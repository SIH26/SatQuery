import React from 'react'

interface ShowcasePageProps {
  onLaunchDashboard: () => void
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ onLaunchDashboard }) => {
  return (
    <div className="showcase-wrapper" style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#060913',
      color: '#f8fafc',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowY: 'auto'
    }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.15), transparent 70%)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 30,
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: 20
          }}>
            <span>⚡ SIH26167 Prototype Solution</span>
            <span>•</span>
            <span>Qwen2.5-VL-3B Powered</span>
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '3.4rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 70%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 20
          }}>
            SatQuery AI
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: 780,
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            Agentic Remote-Sensing Vision-Language Platform for Autonomous Satellite Imagery VQA, Spatial Grounding, and Multi-Modal Raster Intelligence.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onLaunchDashboard}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 10,
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              🚀 Launch Live GIS Dashboard
            </button>

            <a
              href="#architecture"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#e2e8f0',
                border: '1px solid rgba(51, 65, 85, 0.8)',
                padding: '14px 28px',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              ⚙️ Explore Architecture
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            marginTop: 60,
            maxWidth: 1000,
            margin: '60px auto 0'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>Qwen2.5-VL-3B</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>Lightweight Vision-Language Engine</div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>EPSG:4326 WGS84</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>PostGIS Vector Footprints</div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>Multi-Modal</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>Optical, SAR & Bi-Temporal</div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>100% Auditable</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>10-Step Execution Trace Log</div>
            </div>
          </div>

        </div>
      </section>

      {/* Product Screenshot Showcase Gallery */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc' }}>
            📸 Live Platform Demonstration
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 8 }}>
            Real-time interface screenshots featuring MapLibre GIS, Qwen2.5-VL-3B VLM reasoning, and auditable trace logs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24 }}>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            <img src="/assets/showcase/dashboard_main.png" alt="SatQuery AI Main Dashboard" style={{ width: '100%', height: 300, objectFit: 'cover' }} />
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: '1.15rem', color: '#38bdf8', fontWeight: 700 }}>🛰️ Live GIS Dashboard & Satellite Basemap</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: 6, lineHeight: 1.5 }}>
                High-resolution Esri Satellite vector layers with real-time bounding box grounding and task mode shortcuts.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            <img src="/assets/showcase/geochat_demo.png" alt="GeoChat Visual Grounding" style={{ width: '100%', height: 300, objectFit: 'cover' }} />
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: '1.15rem', color: '#34d399', fontWeight: 700 }}>🎯 Visual Grounding & Region Identification</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: 6, lineHeight: 1.5 }}>
                Extracts normalized coordinate bounding boxes `[ymin, xmin, ymax, xmax]` and renders labeled rectangle previews directly on imagery.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* System Architecture Section */}
      <section id="architecture" style={{
        padding: '60px 24px',
        background: 'rgba(13, 19, 34, 0.7)',
        borderTop: '1px solid rgba(51, 65, 85, 0.5)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc' }}>
              ⚙️ Agentic Orchestration Architecture
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 8 }}>
              Two-stage pipeline: Intent Routing → Tool Execution → Qwen2.5-VL-3B VLM → Evidence Aggregation
            </p>
          </div>

          {/* Flowchart Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 20, borderRadius: 12, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Step 1</div>
              <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: 'white' }}>📥 Raster Ingestion</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Extracts GeoTIFF metadata via Rasterio, transforms CRS to EPSG:4326, and calculates spatial resolution.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 20, borderRadius: 12, border: '1px solid rgba(129, 140, 248, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>Step 2</div>
              <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: 'white' }}>🧠 Intent Classification</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                LLM Orchestrator routes query intent (VQA, Change Detection, Spatial Grounding) to specialist tools.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 20, borderRadius: 12, border: '1px solid rgba(192, 132, 252, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>Step 3</div>
              <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: 'white' }}>⚡ Qwen2.5-VL-3B VLM</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Runs Stage-1 vision-language reasoning on Apple Silicon GPU (MPS) and extracts coordinate bounding boxes.
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 20, borderRadius: 12, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>Step 4</div>
              <h4 style={{ fontSize: '1.1rem', margin: '6px 0', color: 'white' }}>📊 Grounded Synthesis</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Evidence Aggregator synthesizes non-hallucinated answers and renders vector polygons on MapLibre GL JS.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: '#f8fafc' }}>
            ✨ Core Technical Capabilities
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.6)', padding: 24, borderRadius: 12 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🛰️</div>
            <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: 700 }}>Optical & SAR Radar Fusion</h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
              Handles Sentinel-2 optical imagery, Sentinel-1 SAR microwave radar, and bi-temporal change detection pairs seamlessly.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.6)', padding: 24, borderRadius: 12 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📊</div>
            <h3 style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 700 }}>Dynamic Pixel Spectral Analytics</h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
              Computes vegetation, bare soil, and built-up land cover percentages directly from RGB image pixel channels.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.6)', padding: 24, borderRadius: 12 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📋</div>
            <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', fontWeight: 700 }}>100% Auditable Execution Trace</h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
              Logs every single decision step, tool execution status, and timestamp for complete transparency and compliance.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <footer style={{
        padding: '60px 24px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 80%, rgba(56, 189, 248, 0.15), transparent 70%)',
        borderTop: '1px solid rgba(51, 65, 85, 0.6)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Ready to Test SatQuery AI?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: 28 }}>
            Experience autonomous satellite vision-language intelligence live in your browser.
          </p>
          <button
            onClick={onLaunchDashboard}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: 'white',
              border: 'none',
              padding: '16px 36px',
              borderRadius: 10,
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)'
            }}
          >
            🚀 Launch Live GIS Dashboard Now
          </button>
          
          <div style={{ marginTop: 40, color: '#64748b', fontSize: '0.82rem' }}>
            SatQuery AI • SIH26167 Prototype • Powered by Qwen2.5-VL-3B & PostGIS 15
          </div>
        </div>
      </footer>

    </div>
  )
}
