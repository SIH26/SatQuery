# SatQuery AI (SIH26167)

SatQuery AI is an agentic multimodal remote-sensing assistant that allows users to analyze satellite imagery using natural-language queries without needing expert knowledge of GIS or remote-sensing workflows.

This repository currently contains the **Phase 1** scaffolding: a complete end-to-end ingestion, metadata extraction, validation, configuration detection, and mapping visualization pipeline.

## 🚀 Tech Stack

*   **Frontend**: React, TypeScript, Vite, MapLibre GL JS
*   **Backend**: Python, FastAPI, Rasterio, GeoPandas, SQLAlchemy
*   **Database**: PostgreSQL with PostGIS extension, Redis

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
1.  **Docker Desktop** (Required for the PostGIS database and Redis cache)
2.  **Python 3.10+** (For the FastAPI backend)
3.  **Node.js 18+** (For the React frontend)
4.  **Git**

---

## 🛠️ Step-by-Step Local Setup

Follow these instructions to spin up the full application locally for development.

### Step 1: Start the Database (Docker)
The application requires a PostgreSQL database with the PostGIS extension to handle geospatial data. We use Docker to spin this up instantly.

1. Open a terminal and navigate to the infrastructure directory:
   ```bash
   cd infrastructure
   ```
2. Start the database and cache in the background:
   ```bash
   docker-compose up -d
   ```
*(Note: If you get a port conflict on 6379, you may already have a local Redis server running. You can safely ignore it or stop your local Redis.)*

### Step 2: Start the Backend (FastAPI)
The Python backend handles file uploads, extracts geospatial metadata using Rasterio, and runs the validation logic.

1. Open a **new** terminal at the root of the project (`SatQuery/`).
2. Create and activate a Python virtual environment:
   **Windows (PowerShell):**
   ```powershell
   python -m venv backend\venv
   .\backend\venv\Scripts\activate
   ```
   **Mac/Linux:**
   ```bash
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Set the Python Path and start the FastAPI server:
   **Windows (PowerShell):**
   ```powershell
   $env:PYTHONPATH=$(Get-Location).Path
   uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   **Mac/Linux:**
   ```bash
   export PYTHONPATH=$(pwd)
   uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
   ```

You can now verify the backend is running by visiting the API documentation at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 3: Start the Frontend (React + Vite)
The frontend provides the interactive map and UI.

1. Open a **third** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

You can now view the SatQuery AI application at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing Phase 1

To test the system:
1. Open the frontend UI.
2. Click the upload box and select a GeoTIFF image (or two for paired analysis).
3. Wait for the `Metadata Extracted` trace.
4. Click **Validate & Detect Config**.
5. The system will determine if it's a `Single Image`, `Bi-Temporal Pair` (if overlapping bounds and different dates), or a `Cross-Modal Pair` (if Optical + SAR), and show the footprint polygon on the MapLibre map.
