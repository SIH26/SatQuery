from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from backend.db.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(String, nullable=True)
    detected_config = Column(String, nullable=True) # "SINGLE", "BI_TEMPORAL", "CROSS_MODAL", "INVALID"
    status = Column(String, default="INITIALIZED") # "READY_FOR_VQA", etc.
    execution_trace = Column(JSON, default=list) # List of actions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    images = relationship("ImageRecord", back_populates="analysis")

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
    
    acquisition_date = Column(DateTime(timezone=True), nullable=True)
    modality = Column(String, nullable=True) # "OPTICAL", "SAR", "UNKNOWN"
    modality_confidence = Column(String, nullable=True) # "METADATA", "FILENAME", "USER_CONFIRMED"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    analysis = relationship("Analysis", back_populates="images")
