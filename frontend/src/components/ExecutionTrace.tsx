import React from 'react'

export type TraceItem = {
  step_name: string
  status: string
  details?: Record<string, any>
  timestamp?: string
}

interface Props {
  trace: TraceItem[]
}

export const ExecutionTrace: React.FC<Props> = ({ trace }) => {
  if (!trace || trace.length === 0) {
    return (
      <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem', fontStyle: 'italic', padding: '12px 0' }}>
        No execution trace recorded yet. Run a query to initiate the agentic workflow.
      </div>
    )
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'PASS':
      case 'EXECUTED':
        return 'trace-badge-success'
      case 'WARNING':
      case 'RUNNING':
        return 'trace-badge-warning'
      case 'FAILED':
      case 'REJECTED':
        return 'trace-badge-error'
      default:
        return 'trace-badge-neutral'
    }
  }

  return (
    <div className="trace-container" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {trace.map((item, idx) => (
        <div key={idx} className="trace-item-card" style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>
              #{idx + 1} {item.step_name}
            </span>
            <span className={`status-pill ${getStatusBadgeClass(item.status)}`} style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 12,
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {item.status}
            </span>
          </div>

          {item.details && (
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 8, borderRadius: 4, fontFamily: 'monospace', fontSize: '0.75rem', color: '#cbd5e1', marginTop: 6, overflowX: 'auto' }}>
              {Object.entries(item.details).map(([key, val]) => (
                <div key={key}>
                  <span style={{ color: '#94a3b8' }}>{key}: </span>
                  <span style={{ color: '#f1f5f9' }}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
