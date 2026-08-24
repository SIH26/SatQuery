import pytest
from backend.core import validation
from backend.services.tool_registry import tool_registry
from backend.services.orchestrator import orchestrator
from backend.services.evidence_aggregator import evidence_aggregator

def test_tool_registry_initialization():
    tools = tool_registry.list_tools()
    tool_names = [t["name"] for t in tools]
    assert "rsvqa" in tool_names
    assert "change_detection" in tool_names
    assert "cdvqa" in tool_names
    assert "optical_sar_fusion" in tool_names
    assert "rs_grounding" in tool_names

def test_single_image_configuration_detection():
    images = [{
        "geom_wkt": "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))",
        "modality": "OPTICAL",
        "acquisition_date": "2024-05-01T00:00:00"
    }]
    res = validation.detect_configuration(images)
    assert res["config"] == "SINGLE_IMAGE"
    assert res["status"] == "READY_FOR_VQA"

def test_bi_temporal_configuration_detection():
    images = [
        {
            "geom_wkt": "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))",
            "modality": "OPTICAL",
            "acquisition_date": "2024-05-01T00:00:00"
        },
        {
            "geom_wkt": "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))",
            "modality": "OPTICAL",
            "acquisition_date": "2024-10-01T00:00:00"
        }
    ]
    res = validation.detect_configuration(images)
    assert res["config"] == "BI_TEMPORAL_PAIR"
    assert res["status"] == "READY_FOR_CHANGE_ANALYSIS"

def test_cross_modal_configuration_detection():
    images = [
        {
            "geom_wkt": "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))",
            "modality": "OPTICAL",
            "acquisition_date": "2024-05-01T00:00:00"
        },
        {
            "geom_wkt": "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))",
            "modality": "SAR",
            "acquisition_date": "2024-05-01T00:00:00"
        }
    ]
    res = validation.detect_configuration(images)
    assert res["config"] == "CROSS_MODAL_PAIR"
    assert res["status"] == "READY_FOR_OPTICAL_SAR_ANALYSIS"

def test_orchestrator_rejection_of_single_image_change_query():
    images = [{
        "filename": "image1.tif",
        "modality": "OPTICAL",
        "acquisition_date": "2024-05-01T00:00:00",
        "bounds": [-122.4, 37.7, -122.3, 37.8]
    }]
    res = orchestrator.plan_and_execute("What changed between these two dates?", "SINGLE_IMAGE", images)
    assert res["status"] == "REJECTED"
    assert "only 1 image" in res["error"]

def test_full_orchestration_and_synthesis_flow():
    images = [
        {
            "filename": "t1.tif",
            "modality": "OPTICAL",
            "acquisition_date": "2024-01-01T00:00:00",
            "bounds": [-122.4, 37.7, -122.3, 37.8]
        },
        {
            "filename": "t2.tif",
            "modality": "OPTICAL",
            "acquisition_date": "2024-06-01T00:00:00",
            "bounds": [-122.4, 37.7, -122.3, 37.8]
        }
    ]
    query = "What changed between these two dates and has built-up area increased?"
    orch_res = orchestrator.plan_and_execute(query, "BI_TEMPORAL_PAIR", images)
    assert orch_res["status"] == "EXECUTED"
    assert "change_detection" in orch_res["selected_tools"]

    syn_res = evidence_aggregator.aggregate_and_synthesize(query, orch_res, images)
    assert syn_res["overall_confidence"] > 0.8
    assert len(syn_res["evidence_artifacts"]) >= 2
    assert "built-up" in syn_res["synthesized_answer"].lower() or "change" in syn_res["synthesized_answer"].lower()
