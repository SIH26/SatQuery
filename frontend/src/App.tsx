import { useState, useRef } from 'react'
import Map, { Source, Layer, FillLayer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

const API_BASE = 'http://localhost:8000/api'

type ImageMeta = {
  id: number
  filename: string
  crs: string
  width: number
  height: number
  num_bands: number
  spatial_res: number | null
  acquisition_date: string | null
  modality: string
  modality_confidence: string
  bounds: number[]
}

export default function App() {
  const [images, setImages] = useState<ImageMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [analysisState, setAnalysisState] = useState<any>(null)
  const [trace, setTrace] = useState<{time: string, msg: string}[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addTrace = (msg: string) => {
    setTrace(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    
    setLoading(true)
    
    for (const file of files) {
      addTrace(`Starting upload for ${file.name}...`)
      
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        })
        if (!res.ok) throw new Error(await res.text())
        
        const data = await res.json()
        addTrace(`Upload successful: ${file.name}`)
        addTrace(`Metadata extracted: CRS=${data.metadata.crs}, Modality=${data.metadata.modality}`)
        
        setImages(prev => [...prev, { id: data.id, filename: data.filename, ...data.metadata }])
      } catch (err: any) {
        addTrace(`Upload failed: ${err.message}`)
      }
    }
    
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleValidate = async () => {
    if (images.length === 0) return
    addTrace(`Validating configuration for ${images.length} image(s)...`)
    setLoading(true)
    
    try {
      const res = await fetch(`${API_BASE}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_ids: images.map(i => i.id) })
      })
      const data = await res.json()
      
      if (!res.ok) {
         addTrace(`Validation failed: ${data.detail || JSON.stringify(data)}`)
         return
      }
      
      setAnalysisState(data)
      addTrace(`Configuration detected: ${data.config}`)
      addTrace(`Status: ${data.status}`)
      
      if (data.errors?.length > 0) {
        data.errors.forEach((err: string) => addTrace(`Warning/Error: ${err}`))
      }
      
    } catch (err: any) {
      addTrace(`Validation request failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const geojsonFeatures = images.map(img => {
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
        properties: { filename: img.filename }
      }
  })

  const geojson = {
    type: 'FeatureCollection',
    features: geojsonFeatures
  }

  const polygonLayer: FillLayer = {
    id: 'footprints',
    type: 'fill',
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0.3
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        SatQuery AI <span style={{fontSize:'0.7em', color:'var(--text-secondary)', marginLeft:12}}>Phase 1 Scaffold</span>
      </header>
      
      <div className="main-content">
        <div className="panel-left">
          <div className="panel-section">
            <h2>Ingestion</h2>
            <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} accept=".tif,.tiff,.png,.jpg,.jpeg" multiple />
            <div className="file-drop" onClick={() => fileInputRef.current?.click()}>
              {loading ? 'Processing...' : 'Click to Upload Imagery'}
            </div>
            
            <div className="file-list">
              {images.map(img => (
                <div key={img.id} className="file-item">
                  <div className="file-item-name">{img.filename}</div>
                  <div className="metadata-grid">
                    <span className="meta-label">Modality:</span>
                    <span className="meta-val" style={{color: img.modality === 'UNKNOWN' ? 'var(--warning)' : 'inherit'}}>
                      {img.modality} ({img.modality_confidence})
                    </span>
                    <span className="meta-label">Date:</span>
                    <span className="meta-val">{img.acquisition_date ? new Date(img.acquisition_date).toLocaleDateString() : 'UNKNOWN'}</span>
                    <span className="meta-label">CRS:</span>
                    <span className="meta-val">{img.crs}</span>
                    <span className="meta-label">Resolution:</span>
                    <span className="meta-val">{img.spatial_res ? `${img.spatial_res.toFixed(2)}m` : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="panel-section" style={{flex:1}}>
            <button className="button" onClick={handleValidate} disabled={loading || images.length === 0}>
              Validate & Detect Config
            </button>
          </div>
        </div>
        
        <div className="panel-center">
          <div className="map-container">
            <Map
              initialViewState={{
                longitude: 0,
                latitude: 0,
                zoom: 1
              }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            >
              {images.length > 0 && (
                 <Source type="geojson" data={geojson as any}>
                    <Layer {...polygonLayer} />
                 </Source>
              )}
            </Map>
          </div>
          
          <div className="execution-trace">
            {trace.map((t, i) => (
              <div key={i} className="trace-line">
                <span className="trace-time">[{t.time}]</span>
                <span className="trace-msg">{t.msg}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="panel-right">
          <div className="panel-section">
            <h2>Analysis Configuration</h2>
            
            {analysisState ? (
              <div>
                <div className={`status-badge ${analysisState.status.includes('READY') ? 'status-success' : analysisState.status.includes('PENDING') ? 'status-warning' : 'status-error'}`}>
                  {analysisState.config}
                </div>
                
                <div style={{marginBottom: 16, fontSize: '0.875rem'}}>
                  <strong>Status:</strong> {analysisState.status}
                </div>
                
                {analysisState.status.includes('PENDING_USER_CONFIRMATION') && (
                  <div style={{background: 'var(--bg-primary)', padding: 12, borderRadius: 6, border: '1px solid var(--warning)'}}>
                    <p style={{fontSize: '0.875rem', marginBottom: 8}}>Manual confirmation required. Please ensure modalities and dates are correct.</p>
                    <button className="button" style={{background: 'var(--warning)', color: '#000'}}>Confirm Overrides</button>
                  </div>
                )}
                
                {analysisState.status.includes('READY') && (
                  <div>
                    <h2 style={{marginTop: 24}}>Natural Language Query</h2>
                    <textarea 
                      style={{width: '100%', height: 100, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white', padding: 8, borderRadius: 6, marginBottom: 8}}
                      placeholder="e.g. What changed between these two dates?"
                    />
                    <button className="button" onClick={() => addTrace('AI analysis will be available in Phase 2.')}>Run Analysis</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic'}}>
                Upload images and validate to detect configuration.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
