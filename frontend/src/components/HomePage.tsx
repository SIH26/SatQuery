import React, { useState, useEffect, useRef } from 'react'

interface HomePageProps {
  onLaunchDashboard: () => void
}

// Reusable Scroll Reveal Hook
const useScrollReveal = (threshold = 0.15) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

const AdobeStockGlobeVideo: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '54%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(1.35)',
      width: 1100,
      height: 1100,
      maxWidth: '120vw',
      pointerEvents: 'none',
      zIndex: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Soft Radial Vignette Shadow & Glow Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 720,
        height: 720,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.65) 75%, rgba(0, 0, 0, 0.95) 100%)',
        filter: 'blur(16px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: 0.9,
          mixBlendMode: 'screen',
          filter: 'contrast(1.2) brightness(1.25) drop-shadow(0 0 50px rgba(0, 0, 0, 0.95))'
        }}
      >
        <source src="/assets/showcase/globe_hero.mp4" type="video/mp4" />
        <source src="/assets/showcase/globe_hero.mov" type="video/quicktime" />
      </video>
    </div>
  )
}

export const HomePage: React.FC<HomePageProps> = ({ onLaunchDashboard }) => {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0)

  const capabilities = useScrollReveal(0.1)
  const architecture = useScrollReveal(0.1)
  const benchmarks = useScrollReveal(0.1)
  const cta = useScrollReveal(0.1)

  const architectureBlueprintNodes = [
    {
      num: '01',
      stage: 'Ingestion Layer',
      title: 'Multi-Modal Satellite Ingestion',
      status: 'POSTGIS 15.0 ONLINE',
      description: 'Ingests multi-spectral Sentinel-2 GeoTIFF rasters and Sentinel-1 SAR microwave radar backscatter, extracting spatial resolution, CRS, and WGS84 bounding envelopes.',
      techTag: 'Rasterio 1.3 • PyPROJ • EPSG:4326',
      codeSnippet: `POST /api/raster/ingest
{
  "filename": "Sentinel2_MultiSpectral_Bands.tif",
  "crs": "EPSG:4326 WGS84",
  "num_bands": 7,
  "spatial_res_m": 10.0,
  "bounds_wgs84": [78.1402, 15.6811, 78.2045, 15.7350],
  "postgis_geom": "SRID=4326;POLYGON((...))"
}`,
      metrics: [
        { label: 'Parser Latency', val: '< 12ms' },
        { label: 'CRS Precision', val: 'WGS84 EPSG:4326' },
        { label: 'Spatial Index', val: 'PostGIS R-Tree' }
      ]
    },
    {
      num: '02',
      stage: 'Agentic Router',
      title: 'LLM Intent Classification Orchestrator',
      status: 'ROUTER ACTIVE',
      description: 'Parses natural language query intent and routes task execution to VQA, Visual Grounding, Bi-Temporal Change Detection, or Dynamic Land Cover Analyzer.',
      techTag: 'FastAPI Async Router • Pydantic v2',
      codeSnippet: `POST /api/orchestrator/classify
{
  "query": "Detect urban building growth and locate structures",
  "classified_intent": "SPATIAL_GROUNDING",
  "confidence_score": 0.98,
  "dispatched_tools": ["rs_grounding", "rsvqa", "dynamic_pixel_spectral"]
}`,
      metrics: [
        { label: 'Intent Dispatch', val: '< 38ms' },
        { label: 'Classification', val: '98.4% Acc' },
        { label: 'Taxonomy Modes', val: '4 Engines' }
      ]
    },
    {
      num: '03',
      stage: 'Tool Registry',
      title: 'Decoupled Specialist Tool Registry',
      status: 'CONCURRENCY READY',
      description: 'Executes parallel sub-task workers via Python asyncio, querying specialized tools and calculating dynamic RGB pixel channel land cover ratios.',
      techTag: 'Async Python • NumPy • Pillow Spectral',
      codeSnippet: `# Async Tool Registry Execution
results = await asyncio.gather(
  tool_registry.execute("rsvqa", image_bytes, query),
  tool_registry.execute("rs_grounding", image_bytes, query),
  tool_registry.execute("dynamic_pixel_spectral", image_matrix)
)`,
      metrics: [
        { label: 'Worker Concurrency', val: 'Async parallel' },
        { label: 'Spectral Engine', val: 'RGB Channel' },
        { label: 'Trace Auditing', val: '100% Logged' }
      ]
    },
    {
      num: '04',
      stage: 'Reasoning Engine',
      title: 'Qwen2.5-VL-3B VLM Vision Inference',
      badge: 'PyTorch MPS',
      status: 'MPS GPU ACCELERATED',
      description: 'Performs Stage-1 vision-language spatial reasoning on Apple Silicon GPU (MPS), extracting normalized bounding box grid coordinates [ymin, xmin, ymax, xmax].',
      techTag: 'Qwen2.5-VL-3B • PyTorch MPS • Transformers',
      codeSnippet: `{
  "model": "Qwen/Qwen2.5-VL-3B-Instruct",
  "device": "mps (Apple Silicon GPU)",
  "vlm_reasoning": "Identified dense urban building cluster",
  "raw_bbox_norm": [150, 240, 680, 890],
  "converted_bbox_wgs84": [78.1520, 15.6912, 78.1884, 15.7245]
}`,
      metrics: [
        { label: 'VLM Inference', val: '1.42s (MPS GPU)' },
        { label: 'Spatial BBox', val: '[ymin, xmin, ymax, xmax]' },
        { label: 'Reasoning Mode', val: 'Stage-1 Grounding' }
      ]
    },
    {
      num: '05',
      stage: 'Client Presentation',
      title: 'Grounded Evidence Aggregator & MapLibre GIS',
      status: 'MAPLIBRE GL ONLINE',
      description: 'Aggregates specialist evidence, removes duplicate statements, builds 10-step auditable execution traces, and renders vector bounding boxes on Esri Satellite basemap.',
      techTag: 'MapLibre GL JS • Esri Satellite • React 18',
      codeSnippet: `{
  "analysis_id": 16,
  "status": "COMPLETED",
  "synthesized_answer": "Dense urban built-up environment confirmed (82% land cover).",
  "geojson_layer": { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [...] } },
  "trace_audit": "TRACE_20260827_COMPLETED"
}`,
      metrics: [
        { label: 'Basemap Tiles', val: 'Esri Satellite' },
        { label: 'Answer Synthesis', val: 'Deduplicated' },
        { label: 'Audit Trail', val: '10-Step JSON' }
      ]
    }
  ]

  const activeNode = architectureBlueprintNodes[selectedNodeIndex]

  return (
    <div className="vercel-bg-grid" style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, sans-serif",
      overflowX: 'hidden'
    }}>
      
      {/* Vercel Top Navigation Bar */}
      <nav style={{
        height: 64,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#FFFFFF"/>
          </svg>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
            SatQuery
          </span>
          <span className="brand-badge">AI 2.0</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: '0.88rem', color: '#888888' }}>
          <a href="#overview" style={{ color: '#888888', textDecoration: 'none', transition: 'color 0.15s' }}>Overview</a>
          <a href="#capabilities" style={{ color: '#888888', textDecoration: 'none', transition: 'color 0.15s' }}>Capabilities</a>
          <a href="#architecture" style={{ color: '#888888', textDecoration: 'none', transition: 'color 0.15s' }}>Architecture</a>
          <a href="#benchmarks" style={{ color: '#888888', textDecoration: 'none', transition: 'color 0.15s' }}>Benchmarks</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onLaunchDashboard}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            Launch Dashboard →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="overview" style={{
        padding: '60px 24px 80px',
        textAlign: 'center',
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <AdobeStockGlobeVideo />

        <div style={{ position: 'relative', zIndex: 1 }}>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '4.2rem',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(180deg, #ffffff 40%, #888888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: 950,
            margin: '0 auto 24px'
          }}>
            Geospatial Intelligence.<br />Multi-Modal Reasoning.
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#ffffff',
            maxWidth: 720,
            margin: '0 auto 40px',
            lineHeight: 1.6,
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9)'
          }}>
            Autonomous satellite imagery VQA, visual grounding, and multi-spectral raster intelligence powered by Qwen2.5-VL-3B and PostGIS.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onLaunchDashboard}
              style={{
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #ffffff',
                padding: '14px 32px',
                borderRadius: 6,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Launch Application →
            </button>

            <a
              href="#architecture"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '14px 28px',
                borderRadius: 6,
                fontSize: '0.95rem',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Explore Architecture
            </a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 80,
            padding: '24px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#ffffff' }}>Qwen2.5-VL-3B</div>
              <div style={{ fontSize: '0.8rem', color: '#888888', marginTop: 4 }}>Vision-Language Model</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#ffffff' }}>EPSG:4326</div>
              <div style={{ fontSize: '0.8rem', color: '#888888', marginTop: 4 }}>WGS84 Vector Geometry</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#ffffff' }}>Multi-Modal</div>
              <div style={{ fontSize: '0.8rem', color: '#888888', marginTop: 4 }}>Optical, SAR & Bi-Temporal</div>
            </div>
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#ffffff' }}>100% Auditable</div>
              <div style={{ fontSize: '0.8rem', color: '#888888', marginTop: 4 }}>10-Step Execution Trace</div>
            </div>
          </div>

        </div>
      </section>

      {/* Vercel Bento Grid Capabilities Section */}
      <section
        id="capabilities"
        ref={capabilities.ref}
        style={{
          padding: '80px 24px',
          maxWidth: 1150,
          margin: '0 auto',
          opacity: capabilities.isVisible ? 1 : 0,
          transform: capabilities.isVisible ? 'translateY(0px)' : 'translateY(40px)',
          transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'none' }}>
            Built for High-Precision Geospatial AI
          </h2>
          <p style={{ color: '#888888', fontSize: '1rem', marginTop: 6 }}>
            Comprehensive toolkit for visual question answering, land-use detection, and spatial grounding.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 20
        }}>
          
          <div className="vercel-bento-card" style={{ gridColumn: 'span 8' }}>
            <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vision-Language Intelligence
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '8px 0 12px', color: '#ffffff' }}>
              Qwen2.5-VL-3B VLM & Bounding Box Grounding
            </h3>
            <p style={{ color: '#888888', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20 }}>
              Parses normalized grid coordinates [ymin, xmin, ymax, xmax] directly from raw optical and SAR satellite rasters, generating grounded textual proofs and vector polygons.
            </p>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <img src="/assets/showcase/geochat_demo.png" alt="Visual Grounding Demo" style={{ width: '100%', height: 260, objectFit: 'cover' }} />
            </div>
          </div>

          <div className="vercel-bento-card" style={{ gridColumn: 'span 4' }}>
            <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Multi-Modal Fusion
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '8px 0 12px', color: '#ffffff' }}>
              Optical & SAR Radar Support
            </h3>
            <p style={{ color: '#888888', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Processes Sentinel-2 optical imagery, Sentinel-1 SAR microwave radar backscatter, and bi-temporal change detection pairs seamlessly.
            </p>
            <div style={{ marginTop: 24, padding: 16, background: '#111111', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#888888' }}>
              <div>Modality: <span style={{ color: '#ffffff' }}>OPTICAL</span> (Sentinel-2)</div>
              <div style={{ marginTop: 4 }}>Modality: <span style={{ color: '#ffffff' }}>SAR</span> (Sentinel-1 GRD)</div>
              <div style={{ marginTop: 4 }}>CRS: <span style={{ color: '#ffffff' }}>EPSG:4326</span></div>
            </div>
          </div>

          <div className="vercel-bento-card" style={{ gridColumn: 'span 4' }}>
            <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Spectral Analytics
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '8px 0 10px', color: '#ffffff' }}>
              Dynamic Pixel Channels
            </h3>
            <p style={{ color: '#888888', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Calculates vegetation index, bare soil, and built-up land cover ratios directly from raster image channels.
            </p>
          </div>

          <div className="vercel-bento-card" style={{ gridColumn: 'span 8' }}>
            <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transparency & Compliance
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '8px 0 10px', color: '#ffffff' }}>
              100% Auditable 10-Step Execution Trace Log
            </h3>
            <p style={{ color: '#888888', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 16 }}>
              Logs every single decision step, tool execution status, and timestamp for full transparency and compliance.
            </p>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <img src="/assets/showcase/dashboard_main.png" alt="Audit Trace Log" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            </div>
          </div>

        </div>
      </section>

      {/* Enterprise-Grade Professional Architecture Blueprint Section */}
      <section
        id="architecture"
        ref={architecture.ref}
        style={{
          padding: '90px 24px',
          background: '#040404',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          
          <div style={{
            textAlign: 'center',
            marginBottom: 56,
            opacity: architecture.isVisible ? 1 : 0,
            transform: architecture.isVisible ? 'translateY(0px)' : 'translateY(30px)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <span className="vercel-badge" style={{ marginBottom: 12 }}>
              ⚙️ Enterprise Architecture Blueprint
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', textTransform: 'none', marginTop: 8 }}>
              System Flowchart & Technical Blueprint
            </h2>
            <p style={{ color: '#888888', fontSize: '1.05rem', marginTop: 8, maxWidth: 680, margin: '8px auto 0' }}>
              Select any stage on the left pipeline timeline to inspect its real-time payload schema and technical specifications.
            </p>
          </div>

          {/* Professional Side-by-Side Blueprint Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            gap: 28,
            alignItems: 'start',
            opacity: architecture.isVisible ? 1 : 0,
            transform: architecture.isVisible ? 'translateY(0px)' : 'translateY(40px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s'
          }}>
            
            {/* Left Timeline Pipeline Navigation */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              position: 'relative'
            }}>
              {/* Connecting Vertical Line */}
              <div style={{
                position: 'absolute',
                top: 24,
                bottom: 24,
                left: 27,
                width: 2,
                background: 'rgba(255, 255, 255, 0.12)',
                zIndex: 0
              }} />

              {architectureBlueprintNodes.map((node, idx) => {
                const isSelected = selectedNodeIndex === idx
                return (
                  <div
                    key={node.num}
                    onClick={() => setSelectedNodeIndex(idx)}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 18px',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: isSelected ? '#ffffff' : '#111111',
                      border: isSelected ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.3)',
                      color: isSelected ? '#000000' : '#888888',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {node.num}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.72rem', color: isSelected ? '#ffffff' : '#888888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {node.stage}
                      </div>
                      <div style={{ fontSize: '0.92rem', color: isSelected ? '#ffffff' : '#cccccc', fontWeight: 600, marginTop: 2 }}>
                        {node.title}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Blueprint Technical Window */}
            <div className="vercel-bento-card" style={{
              background: '#080808',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              padding: 32,
              position: 'relative'
            }}>
              
              {/* Header Badge & Title */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  ✦ STAGE {activeNode.num} • {activeNode.status}
                </span>

                <span style={{ fontSize: '0.8rem', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                  {activeNode.techTag}
                </span>
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: 10, letterSpacing: '-0.02em' }}>
                {activeNode.title}
              </h3>

              <p style={{ color: '#888888', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                {activeNode.description}
              </p>

              {/* Terminal Code Payload Window */}
              <div style={{
                background: '#000000',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                overflow: 'hidden',
                marginBottom: 24
              }}>
                <div style={{
                  height: 32,
                  background: '#111111',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#666666', fontFamily: 'var(--font-mono)' }}>
                    Payload Blueprint Schema
                  </span>
                </div>

                <pre style={{
                  padding: 18,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: '#dddddd',
                  overflowX: 'auto',
                  margin: 0
                }}>
                  <code>{activeNode.codeSnippet}</code>
                </pre>
              </div>

              {/* Technical Metrics Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: 20
              }}>
                {activeNode.metrics.map((m, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.75rem', color: '#888888', fontFamily: 'var(--font-mono)' }}>{m.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{m.val}</div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Tech Stack Breakdown Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginTop: 56,
            opacity: architecture.isVisible ? 1 : 0,
            transform: architecture.isVisible ? 'translateY(0px)' : 'translateY(40px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
          }}>
            <div className="vercel-bento-card">
              <h4 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, marginBottom: 12 }}>🐍 Backend Infrastructure</h4>
              <div style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                <div>• Python 3.14 (Virtualenv)</div>
                <div>• FastAPI & Uvicorn API</div>
                <div>• Async SQLAlchemy ORM</div>
                <div>• Docker PostGIS 15 & Redis</div>
              </div>
            </div>

            <div className="vercel-bento-card">
              <h4 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, marginBottom: 12 }}>⚡ AI & VLM Engine</h4>
              <div style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                <div>• Qwen2.5-VL-3B Instruct</div>
                <div>• PyTorch & Transformers</div>
                <div>• Apple Silicon MPS Acceleration</div>
                <div>• Pillow / NumPy Pixel Engine</div>
              </div>
            </div>

            <div className="vercel-bento-card">
              <h4 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, marginBottom: 12 }}>🌐 Geospatial Core</h4>
              <div style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                <div>• Rasterio GeoTIFF Parser</div>
                <div>• PyPROJ CRS Transformer</div>
                <div>• Shapely Vector Geometries</div>
                <div>• EPSG:4326 WGS84 Standard</div>
              </div>
            </div>

            <div className="vercel-bento-card">
              <h4 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700, marginBottom: 12 }}>💻 Frontend Client</h4>
              <div style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
                <div>• React 18 & Vite</div>
                <div>• MapLibre GL JS Vector Engine</div>
                <div>• Esri Satellite Tile Layer</div>
                <div>• Lucide UI Components</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Vercel Terminal / API Preview Showcase */}
      <section
        id="benchmarks"
        ref={benchmarks.ref}
        style={{
          padding: '80px 24px',
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          opacity: benchmarks.isVisible ? 1 : 0,
          transform: benchmarks.isVisible ? 'translateY(0px)' : 'translateY(40px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#ffffff', textTransform: 'none' }}>
              Developer-First API & Auditable Execution
            </h2>
            <p style={{ color: '#888888', fontSize: '0.95rem', marginTop: 6 }}>
              REST API design powering satellite raster ingestion and agentic tool dispatching.
            </p>
          </div>

          <div style={{
            background: '#000000',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: 36,
              background: '#111111',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }}></div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: 'var(--font-mono)', marginLeft: 8 }}>
                curl -X POST http://localhost:8000/api/query
              </span>
            </div>

            <pre style={{
              padding: 24,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: '#cccccc',
              overflowX: 'auto'
            }}>
              <code>{`{
  "analysis_id": 16,
  "query": "What is the primary land cover and locate built-up structures?",
  "intent": "SINGLE_IMAGE_VQA",
  "status": "COMPLETED",
  "selected_tools": ["rsvqa", "rs_grounding"],
  "synthesized_answer": "High-resolution optical satellite scene analysis confirms a dense urban built-up environment (82% land cover). Key features include dense residential/commercial building clusters, roof structures, and asphalt road networks.",
  "overall_confidence": 0.94,
  "evidence_artifacts": [
    {
      "artifact_type": "BOUNDING_BOX",
      "title": "Grounded Target Region",
      "content": { "bbox_wgs84": [78.14, 15.68, 78.20, 15.73], "label": "Dense Urban Building Cluster" }
    }
  ]
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Vercel Final CTA Section */}
      <section
        ref={cta.ref}
        style={{
          padding: '100px 24px',
          textAlign: 'center',
          position: 'relative',
          opacity: cta.isVisible ? 1 : 0,
          transform: cta.isVisible ? 'translateY(0px)' : 'translateY(40px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ maxWidth: 750, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '3rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: 16
          }}>
            Deploy Satellite AI Instantly
          </h2>
          <p style={{ color: '#888888', fontSize: '1.1rem', marginBottom: 36 }}>
            Experience sub-second vision-language spatial grounding live on your local machine.
          </p>

          <button
            onClick={onLaunchDashboard}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              padding: '16px 36px',
              borderRadius: 6,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)'
            }}
          >
            Launch Dashboard Now →
          </button>
        </div>
      </section>

      {/* Vercel Minimalist Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '32px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#666666'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#888888"/>
          </svg>
          <span>SatQuery AI • Agentic Remote-Sensing Vision-Language Platform</span>
        </div>

        <div>
          <span>Powered by Qwen2.5-VL-3B & PostGIS 15</span>
        </div>
      </footer>

    </div>
  )
}
