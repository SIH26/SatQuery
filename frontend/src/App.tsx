import { useState, useRef, useEffect } from 'react'
import Map, { Source, Layer, LayerProps } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ExecutionTrace, TraceItem } from './components/ExecutionTrace'
import { EvidenceCard, EvidenceArtifact } from './components/EvidenceCard'

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

export default function App() {
  const [images, setImages] = useState<ImageMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [analysisSession, setAnalysisSession] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null)
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

  const handleRunQuery = async (queryText?: string) => {
    const activeQuery = queryText || query
    if (!activeQuery.trim() || !analysisSession) return
    
    setExecuting(true)
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisSession.analysis_id,
          query: activeQuery
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Query execution failed')

      setQueryResult(data)
    } catch (err: any) {
      alert(`Agent execution failed: ${err.message}`)
    } finally {
      setExecuting(false)
    }
  }

  const handleExportReport = async () => {
    if (!analysisSession) return
    try {
      const res = await fetch(`${API_BASE}/analysis/${analysisSession.analysis_id}/export`)
      const data = await res.json()
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SatQuery_Report_Session_${analysisSession.analysis_id}.json`
      a.click()
    } catch (err: any) {
      alert(`Export failed: ${err.message}`)
    }
  }

  // GeoJSON Features for Footprints
  const footprintFeatures: any[] = images.map(img => {
    const [minx, miny, maxx, maxy] = img.bounds
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [minx, miny],
          [maxx, miny],
          [maxx, maxy],
          [minx, maxy],
          [minx, miny]
        ]]
      },
      properties: { filename: img.filename, modality: img.modality }
    }
  })

  // Grounding / Change Bounding Box Features from Evidence
  const evidenceBboxFeatures: any[] = []
  if (queryResult?.evidence_artifacts) {
    queryResult.evidence_artifacts.forEach((art) => {
      const bbox = art.content?.bbox_wgs84 || art.content?.change_bbox_wgs84
      if (bbox && bbox.length === 4) {
        const [bminx, bminy, bmaxx, bmaxy] = bbox
        evidenceBboxFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [bminx, bminy],
              [bmaxx, bminy],
              [bmaxx, bmaxy],
              [bminx, bmaxy],
              [bminx, bminy]
            ]]
          },
          properties: { title: art.title, type: art.artifact_type }
        })
      }
    })
  }

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

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.4rem' }}>🛰️</span>
          <span>SatQuery AI</span>
          <span style={{
            fontSize: '0.75rem',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '3px 10px',
            borderRadius: 12,
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontWeight: 600
          }}>
            Agentic Remote-Sensing VLM
          </span>
        </div>

        {queryResult && (
          <button className="button" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleExportReport}>
            📥 Export Report JSON
          </button>
        )}
      </header>
      
      {/* Main Grid Workspace */}
      <div className="main-content">
        
        {/* Left Panel: Ingestion & Metadata Inspector */}
        <div className="panel-left">
          <div className="panel-section">
            <h2>📥 Imagery Ingestion</h2>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} accept=".tif,.tiff,.png,.jpg,.jpeg" multiple />
            <div className="file-drop" onClick={() => fileInputRef.current?.click()}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📁</div>
              <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Upload GeoTIFF / Raster</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                Supports Single, Bi-Temporal, or Optical + SAR Pairs
              </div>
            </div>
            
            <div className="file-list">
              {images.map(img => (
                <div key={img.id} className="file-item">
                  <div className="file-item-name">{img.filename}</div>
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

                    <span className="meta-label">Spatial Res:</span>
                    <span className="meta-val">
                      {img.spatial_res ? `${img.spatial_res} m/px` : 'N/A'}
                    </span>

                    <span className="meta-label">Bands / Type:</span>
                    <span className="meta-val">{img.num_bands} bands ({img.dtype || 'uint8'})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="panel-section" style={{ flex: 1 }}>
            <h2>⚙️ Validation Engine</h2>
            <button className="button" style={{ width: '100%' }} onClick={handleValidate} disabled={loading || images.length === 0}>
              {loading ? 'Validating Footprints...' : 'Validate & Detect Config'}
            </button>

            {analysisSession && (
              <div style={{ marginTop: 16 }}>
                <div className={`status-badge ${analysisSession.status.startsWith('READY') ? 'status-success' : 'status-warning'}`}>
                  Configuration: {analysisSession.config}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  <strong>Validation Status:</strong> {analysisSession.status}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Center Panel: MapLibre GIS Map */}
        <div className="panel-center">
          <div className="map-container">
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            >
              {/* Footprints Source */}
              {footprintFeatures.length > 0 && (
                <Source type="geojson" data={{ type: 'FeatureCollection', features: footprintFeatures }}>
                  <Layer {...polygonFillLayer} />
                  <Layer {...polygonLineLayer} />
                </Source>
              )}

              {/* Evidence Bounding Boxes Source */}
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
            
            {analysisSession?.status.startsWith('READY') ? (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Natural Language Query:
                  </label>
                  <textarea 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: 80,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-color)',
                      color: 'white',
                      padding: 10,
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                    placeholder="Ask anything about the satellite imagery..."
                  />
                </div>

                {/* Query Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Suggested Queries:</span>
                  <div className="prompt-chip" onClick={() => { setQuery("What is the primary land cover in this scene?"); handleRunQuery("What is the primary land cover in this scene?"); }}>
                    💡 What is the primary land cover in this scene?
                  </div>
                  <div className="prompt-chip" onClick={() => { setQuery("What changed between these two dates and has the built-up area increased?"); handleRunQuery("What changed between these two dates and has the built-up area increased?"); }}>
                    💡 What changed between these two dates and has built-up area increased?
                  </div>
                  <div className="prompt-chip" onClick={() => { setQuery("Locate built-up areas and structures using spatial grounding."); handleRunQuery("Locate built-up areas and structures using spatial grounding."); }}>
                    💡 Locate built-up areas and structures using spatial grounding.
                  </div>
                </div>

                <button className="button" style={{ width: '100%' }} onClick={() => handleRunQuery()} disabled={executing || !query.trim()}>
                  {executing ? 'Executing Agentic Pipeline...' : '🤖 Dispatch AI Models & Synthesize Answer'}
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Upload imagery and run configuration validation to unlock the LLM Query Interface.
              </div>
            )}
          </div>

          {/* Synthesized Answer & Evidence Section */}
          {queryResult && (
            <div className="panel-section">
              <h2>💬 Synthesized Answer</h2>
              
              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 8,
                padding: 12,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: '#f8fafc',
                marginBottom: 12
              }}>
                {queryResult.synthesized_answer}
              </div>

              {/* Confidence Score Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: 6 }}>
                <span style={{ color: '#94a3b8' }}>Overall Confidence:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                  {Math.round((queryResult.overall_confidence || 0.9) * 100)}%
                </span>
              </div>

              {/* Specialist Tools Called */}
              <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#94a3b8' }}>
                <strong>Tools Executed:</strong> {queryResult.selected_tools?.join(', ') || 'None'}
              </div>

              {/* Evidence Artifacts */}
              <EvidenceCard evidence={queryResult.evidence_artifacts} />

              {/* Execution Trace Timeline */}
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
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
