interface AnalysisProgressProps {
  progress: number
  label: string
  status: string
}

export default function AnalysisProgress({ progress, label, status }: AnalysisProgressProps) {
  const activeStep = Math.max(0, Math.min(5, Math.floor((progress / 100) * 6)))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(16, 25, 40, 0.95)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 15,
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center', gap: 14 }}>
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
          <line x1="18" y1="20" x2="60" y2="40" stroke="var(--teal)" strokeWidth="2">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
          </line>
          <line x1="18" y1="60" x2="60" y2="40" stroke="var(--gold)" strokeWidth="2">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
          </line>
          <line x1="60" y1="40" x2="102" y2="20" stroke="var(--teal)" strokeWidth="2">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
          </line>
          <line x1="60" y1="40" x2="102" y2="60" stroke="var(--gold)" strokeWidth="2">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
          </line>

          <circle cx="18" cy="20" r="6" fill="var(--teal)" />
          <circle cx="18" cy="60" r="6" fill="var(--gold)" />
          <circle cx="60" cy="40" r="8" fill="var(--teal)" />
          <circle cx="102" cy="20" r="6" fill="var(--gold)" />
          <circle cx="102" cy="60" r="6" fill="var(--teal)" />
        </svg>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)' }}>Analyzing code</div>

        <div style={{ width: 200, height: 4, borderRadius: 999, background: 'var(--bg-raised)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.max(0, Math.min(progress, 100))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--teal), var(--gold))',
              transition: 'width 220ms ease',
            }}
          />
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>{label || status}</div>

        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, index) => {
            const isDone = index < activeStep
            const isActive = index === activeStep && progress < 100
            return (
              <span
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isDone ? 'var(--teal)' : isActive ? 'var(--gold)' : 'transparent',
                  border: isDone || isActive ? 'none' : '1px solid var(--border-2)',
                  animation: isActive ? 'neural-pulse 1s infinite' : 'none',
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
