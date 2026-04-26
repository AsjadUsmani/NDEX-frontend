import { useMemo } from 'react'

interface EmptyStateProps {
  onConnect?: () => void
}

const pillStyles = [
  {
    label: 'D3 Git Graphs',
    background: 'var(--teal-faint)',
    border: '0.5px solid var(--border-2)',
    color: 'var(--teal)',
  },
  {
    label: 'AI SRS Docs',
    background: 'var(--gold-faint)',
    border: '0.5px solid var(--border-gold)',
    color: 'var(--gold)',
  },
  {
    label: 'Code Analysis',
    background: 'rgba(139,92,246,0.12)',
    border: '0.5px solid rgba(139,92,246,0.3)',
    color: '#8b5cf6',
  },
]

export default function EmptyState({ onConnect }: EmptyStateProps) {
  const pills = useMemo(() => pillStyles, [])

  return (
    <div
      className="ndex-grid-bg"
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '50% auto auto 50%',
          width: 420,
          height: 420,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,161,155,0.16) 0%, rgba(228,221,61,0.08) 35%, transparent 72%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--teal), var(--gold))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Nx
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 800,
          color: 'var(--text-1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Neural Design Explorer
      </div>
      <div
        style={{
          maxWidth: 400,
          textAlign: 'center',
          color: 'var(--text-2)',
          fontSize: 13,
          lineHeight: 1.7,
          position: 'relative',
          zIndex: 1,
        }}
      >
        Connect any GitHub repository to visualize its architecture, generate SRS documentation, and explore code intelligence.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        {pills.map(pill => (
          <span
            key={pill.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 20,
              background: pill.background,
              border: pill.border,
              color: pill.color,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            {pill.label}
          </span>
        ))}
      </div>
      {onConnect ? (
        <button
          type="button"
          onClick={onConnect}
          style={{
            marginTop: 8,
            height: 44,
            padding: '0 18px',
            borderRadius: 'var(--radius-md)',
            border: '0.5px solid var(--border-2)',
            background: 'var(--bg-card)',
            color: 'var(--text-1)',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Connect repository
        </button>
      ) : null}
    </div>
  )
}
