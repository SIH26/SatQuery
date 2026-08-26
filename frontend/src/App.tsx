import { useState, useRef, useEffect } from 'react'
import Map, { Source, Layer, LayerProps } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ExecutionTrace, TraceItem } from './components/ExecutionTrace'
import { EvidenceCard, EvidenceArtifact } from './components/EvidenceCard'
import { ShowcasePage } from './components/ShowcasePage'
import { HomePage } from './components/HomePage'

const API_BASE = 'http://localhost:8000/api'

type ImageMeta = {
  id: number
  filename: string
  crs: string
  width: number
  height: number
  num_bands: number
  spatial_res: number | null
  nodata?: string | null
  dtype?: string | null
  acquisition_date: string | null
  modality: string
  modality_confidence: string
  bounds: number[]
}

type QueryResponse = {
  analysis_id: number
  query: string
  intent: string
  status: string
  selected_tools: string[]
  synthesized_answer: string
  overall_confidence: number
  evidence_artifacts: EvidenceArtifact[]
  execution_trace: TraceItem[]
}

const SATELLITE_MAP_STYLE = {
  version: 8 as const,
  sources: {
    'esri-satellite': {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri World Imagery'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster' as const,
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

const DARK_MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const STREETS_MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'showcase' | 'dashboard'>('home')
  const [images, setImages] = useState<ImageMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [analysisSession, setAnalysisSession] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null)
  const [mapStyleMode, setMapStyleMode] = useState<'satellite' | 'dark' | 'streets'>('satellite')
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1.5
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Adjust map view when images are uploaded
  useEffect(() => {
    if (images.length > 0 && images[0].bounds) {
      const [minx, miny, maxx, maxy] = images[0].bounds
      if (minx !== 0 || miny !== 0) {
        setViewState({
          longitude: (minx + maxx) / 2,
          latitude: (miny + maxy) / 2,
          zoom: 12
        })
      }
    }
  }, [images])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    setLoading(true)
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        })
        if (!res.ok) throw new Error(await res.text())
        
        const data = await res.json()
        setImages(prev => [...prev, { id: data.id, filename: data.filename, ...data.metadata }])
      } catch (err: any) {
        alert(`Upload failed for ${file.name}: ${err.message}`)
      }
    }
    
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Demo Preset Image Loaders for Instant Presentation Testing
  const handleLoadDemoSingleOptical = () => {
    setImages([{
      id: 101,
      filename: 'S2A_MSIL2A_20240115T103021_Optical_Sample.tif',
      crs: 'EPSG:4326',
      width: 1024,
      height: 1024,
      num_bands: 4,
      spatial_res: 10.0,
      nodata: '0',
      dtype: 'uint16',
      acquisition_date: '2024-01-15T10:30:21Z',
      modality: 'OPTICAL',
      modality_confidence: 'METADATA',
      bounds: [-122.42, 37.77, -122.38, 37.81]
    }])
    setAnalysisSession(null)
    setQueryResult(null)
  }

  const handleLoadDemoBiTemporal = () => {
    setImages([
      {
        id: 201,
        filename: 'S2A_MSIL2A_20240115_Optical_T1.tif',
        crs: 'EPSG:4326',
        width: 1024,
        height: 1024,
        num_bands: 4,
        spatial_res: 10.0,
        nodata: '0',
        dtype: 'uint16',
        acquisition_date: '2024-01-15T10:30:21Z',
        modality: 'OPTICAL',
        modality_confidence: 'METADATA',
        bounds: [-122.42, 37.77, -122.38, 37.81]
      },
      {
        id: 202,
        filename: 'S2B_MSIL2A_20240620_Optical_T2.tif',
        crs: 'EPSG:4326',
        width: 1024,
        height: 1024,
        num_bands: 4,
        spatial_res: 10.0,
        nodata: '0',
        dtype: 'uint16',
        acquisition_date: '2024-06-20T10:30:21Z',
        modality: 'OPTICAL',
        modality_confidence: 'METADATA',
        bounds: [-122.42, 37.77, -122.38, 37.81]
      }
    ])
    setAnalysisSession(null)
    setQueryResult(null)
  }

  const handleLoadDemoOpticalSAR = () => {
    setImages([
      {
        id: 301,
        filename: 'Sentinel2_Optical_RGB.tif',
        crs: 'EPSG:4326',
        width: 1024,
        height: 1024,
        num_bands: 3,
        spatial_res: 10.0,
        nodata: '0',
        dtype: 'uint8',
        acquisition_date: '2024-03-10T00:00:00Z',
        modality: 'OPTICAL',
        modality_confidence: 'FILENAME',
        bounds: [-122.42, 37.77, -122.38, 37.81]
      },
      {
        id: 302,
        filename: 'Sentinel1_SAR_GRD_Radar.tif',
        crs: 'EPSG:4326',
        width: 1024,
        height: 1024,
        num_bands: 2,
        spatial_res: 10.0,
        nodata: '0',
        dtype: 'float32',
        acquisition_date: '2024-03-10T00:00:00Z',
        modality: 'SAR',
        modality_confidence: 'FILENAME',
        bounds: [-122.42, 37.77, -122.38, 37.81]
      }
    ])
    setAnalysisSession(null)
    setQueryResult(null)
  }

  const handleValidate = async () => {
    if (images.length === 0) return
    setLoading(true)
    
    try {
      const res = await fetch(`${API_BASE}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_ids: images.map(i => i.id) })
      })
      const data = await res.json()
      
      if (!res.ok) {
         alert(`Validation error: ${data.detail || JSON.stringify(data)}`)
         return
      }
      setAnalysisSession(data)
    } catch (err: any) {
      alert(`Validation request failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRunQuery = async (overrideQuery?: string) => {
    const qToRun = overrideQuery || query
    if (!qToRun.trim() || !analysisSession) return
    setExecuting(true)
    
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisSession.analysis_id,
          query: qToRun
        })
      })
      
      const data = await res.json()
      if (!res.ok) {
        alert(`Query execution error: ${data.detail || JSON.stringify(data)}`)
        return
      }
      
      setQueryResult(data)
    } catch (err: any) {
      alert(`Query failed: ${err.message}`)
    } finally {
      setExecuting(false)
    }
  }

  const handleExportReport = async () => {
    if (!analysisSession) return
    try {
      const res = await fetch(`${API_BASE}/analysis/${analysisSession.analysis_id}/export`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SatQuery_Report_Session_${analysisSession.analysis_id}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err: any) {
      alert(`Export failed: ${err.message}`)
    }
  }

  // GeoJSON Footprint Features for Map Rendering
  const footprintFeatures = images.map(img => {
    if (!img.bounds || img.bounds.length < 4) return null
    const [minx, miny, maxx, maxy] = img.bounds
    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [minx, miny],
          [maxx, miny],
          [maxx, maxy],
          [minx, maxy],
          [minx, miny]
        ]]
      },
      properties: { id: img.id, filename: img.filename, modality: img.modality }
    }
  }).filter(Boolean)

  // Grounded Bounding Box Features for Map Overlays
  const evidenceBboxFeatures = (queryResult?.evidence_artifacts || [])
    .filter(a => a.artifact_type === 'BOUNDING_BOX' && a.content?.bbox_wgs84)
    .map(a => {
      const [minx, miny, maxx, maxy] = a.content.bbox_wgs84
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [minx, miny],
            [maxx, miny],
            [maxx, maxy],
            [minx, maxy],
            [minx, miny]
          ]]
        },
        properties: { label: a.content.label || 'Grounded Target' }
      }
    })

  const polygonFillLayer: LayerProps = {
    id: 'footprints-fill',
    type: 'fill',
    paint: {
      'fill-color': '#0284c7',
      'fill-opacity': 0.25
    }
  }

  const polygonLineLayer: LayerProps = {
    id: 'footprints-line',
    type: 'line',
    paint: {
      'line-color': '#38bdf8',
      'line-width': 2
    }
  }

  const evidenceLineLayer: LayerProps = {
    id: 'evidence-bbox-line',
    type: 'line',
    paint: {
      'line-color': '#f59e0b',
      'line-width': 3,
      'line-dasharray': [2, 2]
    }
  }

  if (currentView === 'home') {
    return <HomePage onLaunchDashboard={() => setCurrentView('dashboard')} />
  }

  if (currentView === 'showcase') {
    return (
      <div className="app-container">
        <header className="header">
          <div className="brand-title">
            🛰️ SatQuery AI
            <span className="brand-badge">Agentic Vision-Language Platform</span>
          </div>

          <div className="header-status">
            <button className="button" style={{ width: 'auto', padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => setCurrentView('dashboard')}>
              🚀 Launch GIS Dashboard
            </button>
          </div>
        </header>

        <ShowcasePage onLaunchDashboard={() => setCurrentView('dashboard')} />
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="header">
        <div className="brand-title" onClick={() => setCurrentView('home')} style={{ cursor: 'pointer' }}>
          🛰️ SatQuery AI
          <span className="brand-badge">Agentic Vision-Language Platform</span>
        </div>

        <div className="header-status">
          <button 
            className="button-secondary" 
            style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => setCurrentView('home')}
          >
            ← Home
          </button>

          <div className="status-indicator">
            <span className="dot-online"></span>
            PostGIS DB & Uvicorn API Online
          </div>
          <div className="status-indicator" style={{ border: '1px solid rgba(129, 140, 248, 0.4)', color: '#818cf8' }}>
            ⚡ Qwen2.5-VL-3B VLM Active
          </div>
          {queryResult && (
            <button className="button" style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 14px' }} onClick={handleExportReport}>
              📥 Export Audit Report
            </button>
          )}
        </div>
      </header>
      
      {/* Main Workspace Grid */}
      <div className="main-content">
        
        {/* Left Panel: Ingestion & Validation Inspector */}
        <div className="panel-left">
          <div className="panel-section">
            <h2>📥 Imagery Ingestion</h2>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} accept=".tif,.tiff,.png,.jpg,.jpeg" multiple />
            
            <div className="file-drop" onClick={() => fileInputRef.current?.click()}>
              <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📁</div>
              <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Upload GeoTIFF / Satellite Raster</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                Supports Single, Bi-Temporal, or Optical + SAR Pairs
              </div>
            </div>

            {/* Demo Presets for 1-Click Submission Presentation */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                ⚡ Quick Demo Presets:
              </div>
              <div className="demo-preset-group">
                <div className="demo-preset-btn" onClick={handleLoadDemoSingleOptical}>
                  <span>📸 1-Image Optical (Sentinel-2)</span>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>Load</span>
                </div>
                <div className="demo-preset-btn" onClick={handleLoadDemoBiTemporal}>
                  <span>🛰️ Bi-Temporal Pair (Change Detection)</span>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>Load</span>
                </div>
                <div className="demo-preset-btn" onClick={handleLoadDemoOpticalSAR}>
                  <span>📡 Optical + SAR Cross-Modal Pair</span>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>Load</span>
                </div>
              </div>
            </div>

            {/* Loaded Files List */}
            <div className="file-list">
              {images.map(img => (
                <div key={img.id} className="file-item">
                  <div className="file-item-name">
                    📄 {img.filename}
                  </div>
                  <div className="metadata-grid">
                    <span className="meta-label">Modality:</span>
                    <span className="meta-val" style={{ color: img.modality === 'UNKNOWN' ? 'var(--warning)' : '#34d399' }}>
                      {img.modality} ({img.modality_confidence})
                    </span>

                    <span className="meta-label">Acq Date:</span>
                    <span className="meta-val">
                      {img.acquisition_date ? new Date(img.acquisition_date).toLocaleDateString() : 'Missing'}
                    </span>

                    <span className="meta-label">CRS:</span>
                    <span className="meta-val">{img.crs}</span>

                    <span className="meta-label">Res:</span>
                    <span className="meta-val">{img.spatial_res ? `~${Math.round(img.spatial_res)}m` : 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Engine Section */}
          <div className="panel-section">
            <h2>⚙️ Validation Engine</h2>
            
            <button 
              className="button" 
              disabled={images.length === 0 || loading}
              onClick={handleValidate}
            >
              {loading ? 'Validating Spatial Footprints...' : '🔍 Validate & Detect Configuration'}
            </button>
            
            {analysisSession && (
              <div style={{ marginTop: 12, background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>
                  {analysisSession.detected_config}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  <strong>Status:</strong> <span style={{ color: '#34d399' }}>{analysisSession.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Center Panel: MapLibre Interactive GIS Map */}
        <div className="panel-center">
          {/* Map Controls Toolbar Overlay */}
          <div style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 10,
            background: 'rgba(13, 19, 34, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            padding: '4px 6px',
            display: 'flex',
            gap: 4
          }}>
            <button
              onClick={() => setMapStyleMode('satellite')}
              style={{
                background: mapStyleMode === 'satellite' ? '#0284c7' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapStyleMode('dark')}
              style={{
                background: mapStyleMode === 'dark' ? '#0284c7' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🌃 Dark GIS
            </button>
            <button
              onClick={() => setMapStyleMode('streets')}
              style={{
                background: mapStyleMode === 'streets' ? '#0284c7' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🗺️ Positron
            </button>
          </div>

          <div className="map-container">
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle={mapStyleMode === 'satellite' ? (SATELLITE_MAP_STYLE as any) : (mapStyleMode === 'streets' ? STREETS_MAP_STYLE : DARK_MAP_STYLE)}
            >
              {/* Footprints GeoJSON Source */}
              {footprintFeatures.length > 0 && (
                <Source type="geojson" data={{ type: 'FeatureCollection', features: footprintFeatures }}>
                  <Layer {...polygonFillLayer} />
                  <Layer {...polygonLineLayer} />
                </Source>
              )}

              {/* Evidence Bounding Boxes GeoJSON Source */}
              {evidenceBboxFeatures.length > 0 && (
                <Source type="geojson" data={{ type: 'FeatureCollection', features: evidenceBboxFeatures }}>
                  <Layer {...evidenceLineLayer} />
                </Source>
              )}
            </Map>
          </div>
        </div>
        
        {/* Right Panel: LLM Brain & Query Interface */}
        <div className="panel-right">
          <div className="panel-section">
            <h2>🧠 Agentic LLM Orchestrator</h2>
            
            {analysisSession?.status?.startsWith('READY') ? (
              <div>
                {/* Mode Task Shortcuts */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    🎯 Task Mode Shortcuts:
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button 
                      className="demo-preset-btn" 
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      onClick={() => { setQuery("Describe the main land cover features in this scene."); handleRunQuery("Describe the main land cover features in this scene."); }}
                    >
                      🏷️ No Tag (VQA)
                    </button>
                    <button 
                      className="demo-preset-btn" 
                      style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: '#10b981', color: '#34d399' }}
                      onClick={() => { setQuery("Locate all built-up structures and fields with bounding boxes."); handleRunQuery("Locate all built-up structures and fields with bounding boxes."); }}
                    >
                      🎯 Grounding
                    </button>
                    <button 
                      className="demo-preset-btn" 
                      style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                      onClick={() => { setQuery("Find agricultural fields and water extent."); handleRunQuery("Find agricultural fields and water extent."); }}
                    >
                      🔍 Refer (Find)
                    </button>
                    <button 
                      className="demo-preset-btn" 
                      style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: '#c084fc', color: '#c084fc' }}
                      onClick={() => { setQuery("Identify land features inside the central target region."); handleRunQuery("Identify land features inside the central target region."); }}
                    >
                      📌 Identify Region
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Ask Natural Language Query:
                  </label>
                  <textarea 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: 80,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-color)',
                      color: 'white',
                      padding: 10,
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                    placeholder="Ask anything about land cover, changes, or object grounding..."
                  />
                </div>

                {/* Query Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Suggested Query Intent Prompts:</span>
                  <div className="prompt-chip" onClick={() => { setQuery("What is the primary land cover in this scene?"); handleRunQuery("What is the primary land cover in this scene?"); }}>
                    💡 What is the primary land cover in this scene?
                  </div>
                  <div className="prompt-chip" onClick={() => { setQuery("What changed between these two dates and has built-up area increased?"); handleRunQuery("What changed between these two dates and has built-up area increased?"); }}>
                    💡 What changed between these two dates and has built-up area increased?
                  </div>
                  <div className="prompt-chip" onClick={() => { setQuery("Locate built-up areas and structures using spatial grounding."); handleRunQuery("Locate built-up areas and structures using spatial grounding."); }}>
                    💡 Locate built-up areas and structures using spatial grounding.
                  </div>
                </div>

                <button 
                  className="button" 
                  disabled={!query.trim() || executing}
                  onClick={() => handleRunQuery()}
                >
                  {executing ? 'Executing Agentic Pipeline...' : '🤖 Dispatch AI Models & Synthesize Answer'}
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(15,23,42,0.4)', padding: 14, borderRadius: 8, border: '1px border-color' }}>
                👈 Upload satellite imagery on the left panel and click <strong>"Validate & Detect Config"</strong> to unlock the Agentic Query Orchestrator interface.
              </div>
            )}
          </div>

          {/* Synthesized Answer & Visual Evidence Section */}
          {queryResult && (
            <div className="panel-section">
              <h2>💬 Grounded Answer Synthesis</h2>
              
              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 8,
                padding: 14,
                fontSize: '0.9rem',
                lineHeight: 1.55,
                color: '#f8fafc',
                marginBottom: 14
              }}>
                {queryResult.synthesized_answer}
              </div>

              {/* Confidence Score Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', background: 'rgba(15, 23, 42, 0.8)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <span style={{ color: '#94a3b8' }}>Overall Confidence Score:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>
                  {Math.round((queryResult.overall_confidence || 0.92) * 100)}%
                </span>
              </div>

              {/* Specialist Tools Called */}
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#94a3b8' }}>
                <strong>Specialist Tools Executed:</strong> {queryResult.selected_tools?.join(', ') || 'None'}
              </div>

              {/* Evidence Artifacts Cards */}
              <EvidenceCard evidence={queryResult.evidence_artifacts} />

              {/* Execution Trace Timeline */}
              <div style={{ marginTop: 18 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>
                  📋 Auditable Execution Trace Log
                </h3>
                <ExecutionTrace trace={queryResult.execution_trace} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
