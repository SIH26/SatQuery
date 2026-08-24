from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from backend.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_migrations():
    """Applies non-destructive schema additions for PostgreSQL/PostGIS tables."""
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE images ADD COLUMN IF NOT EXISTS nodata VARCHAR;"))
            conn.execute(text("ALTER TABLE images ADD COLUMN IF NOT EXISTS dtype VARCHAR;"))
            conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS intent VARCHAR;"))
            conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS selected_tools JSON;"))
            conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS synthesized_answer VARCHAR;"))
            conn.execute(text("ALTER TABLE analyses ADD COLUMN IF NOT EXISTS overall_confidence FLOAT;"))
            conn.commit()
    except Exception as e:
        print(f"Migration note: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

