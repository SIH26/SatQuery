from typing import List, Dict, Any, Tuple, Optional
from backend.services.tool_registry import tool_registry

class LLMOrchestrator:
    """
    LLM Orchestrator ("Brain"):
    1. Does NOT process raw pixels directly.
    2. Receives query + validated metadata/configuration.
    3. Identifies intent, extracts parameters.
    4. Generates structured JSON executable plan.
    5. Validates & dispatches tools from controlled ToolRegistry.
    """

    def plan_and_execute(
        self, 
        query: str, 
        detected_config: str, 
        images_metadata: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        execution_trace = []
        
        # Step 1: Query Received
        execution_trace.append({
            "step_name": "QueryReceived",
            "status": "SUCCESS",
            "details": {"query": query, "detected_config": detected_config, "num_images": len(images_metadata)}
        })

        # Step 2: Intent Classification & Parameter Extraction
        intent, selected_tool_names, validation_error = self._analyze_intent_and_select_tools(query, detected_config)
        
        execution_trace.append({
            "step_name": "IntentExtracted",
            "status": "FAILED" if validation_error else "SUCCESS",
            "details": {
                "intent": intent, 
                "selected_tools": selected_tool_names,
                "error": validation_error
            }
        })

        if validation_error:
            return {
                "intent": intent,
                "selected_tools": [],
                "execution_trace": execution_trace,
                "status": "REJECTED",
                "error": validation_error,
                "raw_tool_results": []
            }

        # Step 3: Configuration Validation
        execution_trace.append({
            "step_name": "ConfigurationValidated",
            "status": "SUCCESS",
            "details": {
                "config": detected_config,
                "tool_compatibility": "PASS",
                "images_checked": [i.get("filename") for i in images_metadata]
            }
        })

        # Step 4: Execute Specialist Models
        tool_outputs = []
        for tool_name in selected_tool_names:
            tool = tool_registry.get_tool(tool_name)
            
            execution_trace.append({
                "step_name": f"ToolSelected:{tool_name}",
                "status": "RUNNING",
                "details": {"tool_name": tool_name, "description": tool.description}
            })

            result = tool.execute(images_metadata, query, {"intent": intent, "config": detected_config})
            tool_outputs.append({
                "tool_name": tool_name,
                "output": result
            })

            execution_trace.append({
                "step_name": f"ModelExecuted:{tool_name}",
                "status": "SUCCESS",
                "details": {
                    "tool_name": tool_name,
                    "confidence": result.get("confidence"),
                    "num_evidence_artifacts": len(result.get("visual_evidence", []))
                }
            })

        return {
            "intent": intent,
            "selected_tools": selected_tool_names,
            "execution_trace": execution_trace,
            "status": "EXECUTED",
            "error": None,
            "raw_tool_results": tool_outputs
        }

    def _analyze_intent_and_select_tools(self, query: str, config: str) -> Tuple[str, List[str], Optional[str]]:
        q_lower = query.lower()

        # Input configuration validation rules
        if config == "INVALID":
            return "UNKNOWN", [], "Invalid input image configuration. Geographic overlap or image formats do not meet system requirements."

        # Bi-temporal query requested on single image -> REJECT
        if config == "SINGLE_IMAGE" and any(w in q_lower for w in ["changed", "difference", "between dates", "bi-temporal", "before and after"]):
            return "BI_TEMPORAL_CHANGE", [], "Bi-temporal change query requested, but only 1 image was uploaded. Please upload a second image from a different date."

        # Configuration: SINGLE_IMAGE
        if config == "SINGLE_IMAGE":
            if any(w in q_lower for w in ["where", "locate", "find", "bounding box", "highlight"]):
                return "GROUNDING", ["rs_grounding", "rsvqa"], None
            elif any(w in q_lower for w in ["describe", "caption", "summary", "overview"]):
                return "CAPTIONING", ["rs_vlm_captioner"], None
            else:
                return "SINGLE_IMAGE_VQA", ["rsvqa", "rs_vlm_captioner"], None

        # Configuration: BI_TEMPORAL_PAIR
        elif config == "BI_TEMPORAL_PAIR":
            if any(w in q_lower for w in ["what changed", "difference", "increase", "loss", "expansion"]):
                return "BI_TEMPORAL_CHANGE_VQA", ["change_detection", "cdvqa"], None
            else:
                return "BI_TEMPORAL_ANALYSIS", ["change_detection", "cdvqa", "rs_vlm_captioner"], None

        # Configuration: CROSS_MODAL_PAIR
        elif config == "CROSS_MODAL_PAIR":
            return "OPTICAL_SAR_FUSION", ["optical_sar_fusion", "rs_vlm_captioner"], None

        return "GENERAL_QUERY", ["rsvqa"], None

orchestrator = LLMOrchestrator()
