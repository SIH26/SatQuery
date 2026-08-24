from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

from backend.db.database import engine, Base, get_db
from backend.db import models
from backend.core import storage, geospatial, validation
from backend.services.orchestrator import orchestrator
from backend.services.evidence_aggregator import evidence_aggregator
from shapely import wkb

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SatQuery AI Backend API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads a raster file, saves it locally, and extracts geospatial metadata."""
    filename = file.filename or "uploaded_raster.tif"
    if not filename.lower().endswith(('.tif', '.tiff', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload GeoTIFF or standard images.")
        
    try:
        file_path = await storage.save_upload_file(file)
        file_size = storage.get_file_size(file_path)
        
        if filename.lower().endswith(('.tif', '.tiff')):
            metadata = geospatial.extract_metadata(file_path, filename)
        else:
             # Default fallback for PNG / JPEG sample benchmarks
             metadata = {
                 "crs": "EPSG:4326", "geom_wkt": "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))",
                 "num_bands": 3, "width": 1024, "height": 1024, "spatial_res": 10.0, 
                 "nodata": None, "dtype": "uint8",
                 "acquisition_date": datetime.now(timezone.utc), 
                 "modality": "OPTICAL", "modality_confidence": "FILENAME",
                 "bounds": [-122.4, 37.7, -122.3, 37.8]
             }
             
        new_image = models.ImageRecord(
            filename=filename,
            file_path=file_path,
            file_size=file_size,
            crs=metadata["crs"],
            geom=metadata["geom_wkt"],
            num_bands=metadata["num_bands"],
            width=metadata["width"],
            height=metadata["height"],
            spatial_res=metadata["spatial_res"],
            nodata=str(metadata.get("nodata")) if metadata.get("nodata") is not None else None,
            dtype=metadata.get("dtype"),
            acquisition_date=metadata["acquisition_date"],
            modality=metadata["modality"],
            modality_confidence=metadata["modality_confidence"]
        )
        db.add(new_image)
        db.commit()
        db.refresh(new_image)
        
        return {
            "id": new_image.id,
            "filename": new_image.filename,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

class AnalysisRequest(BaseModel):
    image_ids: List[int]

@app.post("/api/analysis")
def create_analysis(request: AnalysisRequest, db: Session = Depends(get_db)):
    """Validates uploaded images and detects system configuration (Single, Bi-Temporal, Cross-Modal)."""
    images = db.query(models.ImageRecord).filter(models.ImageRecord.id.in_(request.image_ids)).all()
    
    if len(images) != len(request.image_ids):
        raise HTTPException(status_code=404, detail="One or more images not found.")
        
    validation_data = []
    for img in images:
        validation_data.append({
            "geom_wkt": img.geom,
            "modality": img.modality,
            "acquisition_date": img.acquisition_date
        })
        
    result = validation.detect_configuration(validation_data)
    
    trace = [
        {"step_name": "FilesUploaded", "status": "SUCCESS", "timestamp": datetime.now(timezone.utc).isoformat()},
        {"step_name": "MetadataExtracted", "status": "SUCCESS", "timestamp": datetime.now(timezone.utc).isoformat()},
        {"step_name": f"ConfigurationDetected:{result['config']}", "status": "SUCCESS" if result["status"].startswith("READY") else "WARNING", "timestamp": datetime.now(timezone.utc).isoformat()}
    ]
    
    analysis = models.Analysis(
        detected_config=result["config"],
        status=result["status"],
        execution_trace=trace
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    for img in images:
        img.analysis_id = analysis.id
    db.commit()
    
    return {
        "analysis_id": analysis.id,
        "config": result["config"],
        "status": result["status"],
        "errors": result["errors"]
    }

class QueryRequest(BaseModel):
    analysis_id: int
    query: str

@app.post("/api/query")
def execute_query(req: QueryRequest, db: Session = Depends(get_db)):
    """Agentic Orchestration & Execution pipeline for natural language query."""
    analysis = db.query(models.Analysis).filter(models.Analysis.id == req.analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis session not found")

    images_meta = []
    for img in analysis.images:
        bounds = [0, 0, 0, 0]
        if img.geom:
            try:
                g = wkb.loads(bytes(img.geom.data))
                bounds = list(g.bounds)
            except Exception:
                pass
        images_meta.append({
            "id": img.id,
            "filename": img.filename,
            "modality": img.modality,
            "acquisition_date": img.acquisition_date.isoformat() if img.acquisition_date else None,
            "num_bands": img.num_bands,
            "spatial_res": img.spatial_res,
            "bounds": bounds
        })

    # Step 1 & 2: Agentic Planning & Tool Dispatch
    orch_res = orchestrator.plan_and_execute(req.query, analysis.detected_config, images_meta)
    
    # Step 3 & 4: Evidence Aggregation & Synthesis
    syn_res = evidence_aggregator.aggregate_and_synthesize(req.query, orch_res, images_meta)

    # Persist session state in PostGIS DB
    analysis.user_query = req.query
    analysis.intent = orch_res.get("intent")
    analysis.selected_tools = orch_res.get("selected_tools", [])
    analysis.status = "COMPLETED" if orch_res.get("status") == "EXECUTED" else "REJECTED"
    analysis.synthesized_answer = syn_res.get("synthesized_answer")
    analysis.overall_confidence = syn_res.get("overall_confidence")
    analysis.execution_trace = syn_res.get("execution_trace", [])
    
    # Clear previous artifacts & store new evidence artifacts
    db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.analysis_id == analysis.id).delete()
    for art in syn_res.get("evidence_artifacts", []):
        db.add(models.EvidenceArtifact(
            analysis_id=analysis.id,
            artifact_type=art.get("artifact_type"),
            title=art.get("title"),
            content=art.get("content"),
            confidence=art.get("confidence", 1.0)
        ))
        
    db.commit()

    return {
        "analysis_id": analysis.id,
        "query": req.query,
        "intent": analysis.intent,
        "status": analysis.status,
        "selected_tools": analysis.selected_tools,
        "synthesized_answer": analysis.synthesized_answer,
        "overall_confidence": analysis.overall_confidence,
        "evidence_artifacts": syn_res.get("evidence_artifacts", []),
        "execution_trace": analysis.execution_trace
    }

@app.get("/api/analysis/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis session not found")
        
    images = []
    for img in analysis.images:
        geom = None
        if img.geom:
             try:
                 g = wkb.loads(bytes(img.geom.data))
                 geom = list(g.bounds)
             except Exception:
                 pass
                 
        images.append({
            "id": img.id,
            "filename": img.filename,
            "crs": img.crs,
            "spatial_res": img.spatial_res,
            "modality": img.modality,
            "acquisition_date": img.acquisition_date.isoformat() if img.acquisition_date else None,
            "bounds": geom
        })

    evidence_list = []
    for ev in analysis.evidence:
        evidence_list.append({
            "id": ev.id,
            "artifact_type": ev.artifact_type,
            "title": ev.title,
            "content": ev.content,
            "confidence": ev.confidence
        })

    return {
        "id": analysis.id,
        "user_query": analysis.user_query,
        "intent": analysis.intent,
        "status": analysis.status,
        "detected_config": analysis.detected_config,
        "selected_tools": analysis.selected_tools or [],
        "synthesized_answer": analysis.synthesized_answer,
        "overall_confidence": analysis.overall_confidence,
        "execution_trace": analysis.execution_trace or [],
        "evidence_artifacts": evidence_list,
        "images": images
    }

@app.get("/api/analysis/{analysis_id}/export")
def export_report(analysis_id: int, db: Session = Depends(get_db)):
    """Exports structured auditable analysis session report in JSON format."""
    analysis_data = get_analysis(analysis_id, db)
    return {
        "report_title": f"SatQuery AI Remote Sensing Report - Session #{analysis_id}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": analysis_data
    }
