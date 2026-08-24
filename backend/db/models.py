from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from backend.db.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(String, nullable=True)
    intent = Column(String, nullable=True)
    detected_config = Column(String, nullable=True) # "SINGLE_IMAGE", "BI_TEMPORAL_PAIR", "CROSS_MODAL_PAIR", "INVALID"
    status = Column(String, default="INITIALIZED") # "READY_FOR_VQA", "COMPLETED", "FAILED"
    selected_tools = Column(JSON, default=list) # List of tools called
    synthesized_answer = Column(String, nullable=True)
    overall_confidence = Column(Float, nullable=True)
    execution_trace = Column(JSON, default=list) # Audit log array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    images = relationship("ImageRecord", back_populates="analysis")
    steps = relationship("ExecutionStep", back_populates="analysis", cascade="all, delete-orphan")
    evidence = relationship("EvidenceArtifact", back_populates="analysis", cascade="all, delete-orphan")

class ImageRecord(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    filename = Column(String, index=True)
    file_path = Column(String)
    file_size = Column(Integer)
    
    crs = Column(String)
    geom = Column(Geometry(geometry_type='POLYGON', srid=4326))
    num_bands = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    spatial_res = Column(Float, nullable=True)
    nodata = Column(String, nullable=True)
    dtype = Column(String, nullable=True)
    
    acquisition_date = Column(DateTime(timezone=True), nullable=True)
    modality = Column(String, nullable=True) # "OPTICAL", "SAR", "UNKNOWN"
    modality_confidence = Column(String, nullable=True) # "METADATA", "FILENAME", "USER_CONFIRMED"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    analysis = relationship("Analysis", back_populates="images")

class ExecutionStep(Base):
    __tablename__ = "execution_steps"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    step_index = Column(Integer)
    step_name = Column(String) # e.g. "QueryReceived", "IntentExtracted", "ModelExecuted"
    status = Column(String) # "SUCCESS", "RUNNING", "FAILED"
    details = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analysis = relationship("Analysis", back_populates="steps")

class EvidenceArtifact(Base):
    __tablename__ = "evidence_artifacts"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    artifact_type = Column(String) # "TEXT", "BOUNDING_BOX", "CHANGE_MASK", "STATISTIC"
    title = Column(String)
    content = Column(JSON) # Detailed structure, coordinates, mask stats, etc.
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analysis = relationship("Analysis", back_populates="evidence")

