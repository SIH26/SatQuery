from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.db.database import engine, Base, get_db
from backend.db import models
from backend.core import storage, geospatial, validation
import json

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SatQuery AI Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads an image, saves it, and extracts metadata."""
    if not file.filename.lower().endswith(('.tif', '.tiff', '.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Unsupported file format.")
        
    try:
        file_path = await storage.save_upload_file(file)
        file_size = storage.get_file_size(file_path)
        
        # Only try Rasterio extraction for TIFFs. For PNG/JPEG demo images, we would need a different path.
        if file.filename.lower().endswith(('.tif', '.tiff')):
            metadata = geospatial.extract_metadata(file_path, file.filename)
        else:
             metadata = {
                 "crs": "UNKNOWN", "geom_wkt": "POLYGON EMPTY", "num_bands": 3, 
                 "width": 0, "height": 0, "spatial_res": 0.0, 
                 "acquisition_date": None, "modality": "UNKNOWN", "modality_confidence": "UNKNOWN",
                 "bounds": [0,0,0,0]
             }
             
        # Create un-attached ImageRecord
        new_image = models.ImageRecord(
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            crs=metadata["crs"],
            geom=metadata["geom_wkt"],
            num_bands=metadata["num_bands"],
            width=metadata["width"],
            height=metadata["height"],
            spatial_res=metadata["spatial_res"],
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

from pydantic import BaseModel
class AnalysisRequest(BaseModel):
    image_ids: List[int]
    
@app.post("/api/analysis")
def create_analysis(request: AnalysisRequest, db: Session = Depends(get_db)):
    """Validates images and creates an Analysis session."""
    images = db.query(models.ImageRecord).filter(models.ImageRecord.id.in_(request.image_ids)).all()
    
    if len(images) != len(request.image_ids):
        raise HTTPException(status_code=404, detail="One or more images not found.")
        
    # Prepare data for validation
    validation_data = []
    for img in images:
        validation_data.append({
            "geom_wkt": img.geom,
            "modality": img.modality,
            "acquisition_date": img.acquisition_date,
            "num_bands": img.num_bands,
            "spatial_res": img.spatial_res
        })
        
    result = validation.detect_configuration(validation_data)
    
    trace = [
        {"action": "Files uploaded", "timestamp": datetime.utcnow().isoformat()},
        {"action": "Metadata extracted", "timestamp": datetime.utcnow().isoformat()},
        {"action": f"Configuration detection run: {result['config']}", "timestamp": datetime.utcnow().isoformat()}
    ]
    
    analysis = models.Analysis(
        detected_config=result["config"],
        status=result["status"],
        execution_trace=trace
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Link images
    for img in images:
        img.analysis_id = analysis.id
    db.commit()
    
    return {
        "analysis_id": analysis.id,
        "config": result["config"],
        "status": result["status"],
        "errors": result["errors"]
    }

@app.get("/api/analysis/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    images = []
    for img in analysis.images:
        geom = None
        # Convert WKBElement to bounds if needed for frontend map
        from shapely import wkb
        if img.geom:
             try:
                 g = wkb.loads(bytes(img.geom.data))
                 geom = list(g.bounds) # [minx, miny, maxx, maxy]
             except:
                 pass
                 
        images.append({
            "id": img.id,
            "filename": img.filename,
            "modality": img.modality,
            "acquisition_date": img.acquisition_date.isoformat() if img.acquisition_date else None,
            "bounds": geom
        })
        
    return {
        "id": analysis.id,
        "status": analysis.status,
        "detected_config": analysis.detected_config,
        "execution_trace": analysis.execution_trace,
        "images": images
    }
