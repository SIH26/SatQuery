import React from 'react'

export type EvidenceArtifact = {
  id?: number
  artifact_type: string
  title: string
  content: Record<string, any>
  confidence: number
}

interface Props {
  evidence: EvidenceArtifact[]
}

export const EvidenceCard: React.FC<Props> = ({ evidence }) => {
  if (!evidence || evidence.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        🛡️ Evidence & Grounded Proofs
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {evidence.map((art, idx) => {
          const confPct = Math.round((art.confidence || 1.0) * 100)
          return (
            <div key={idx} style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 8,
              padding: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {art.title}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 600
                }}>
                  {art.artifact_type}
                </span>
              </div>

              {/* Confidence Meter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Model Confidence:</span>
                <div style={{ flex: 1, height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${confPct}%`,
                    height: '100%',
                    background: confPct > 85 ? '#10b981' : confPct > 70 ? '#f59e0b' : '#ef4444',
                    borderRadius: 3
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9' }}>{confPct}%</span>
              </div>

              {/* Artifact details */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 8, borderRadius: 6, fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                {Object.entries(art.content || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>{k}:</span>
                    <span style={{ color: '#38bdf8' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
