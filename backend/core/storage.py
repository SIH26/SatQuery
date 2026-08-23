import os
import shutil
from fastapi import UploadFile
from backend.core.config import settings
import uuid

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    """Saves an uploaded file locally and returns the file path."""
    file_ext = os.path.splitext(upload_file.filename)[1]
    safe_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

def get_file_size(file_path: str) -> int:
    return os.path.getsize(file_path)
