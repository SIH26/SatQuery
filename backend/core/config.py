import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SatQuery AI"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "127.0.0.1")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "satquery")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "satquery_pass")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "satquery_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "storage/uploads")

    class Config:
        case_sensitive = True

settings = Settings()
