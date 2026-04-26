import { Loader2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

export default function GlobalLoadingOverlay() {
  const isAnyLoading = useUIStore(state => state.isAnyLoading())

  if (!isAnyLoading) {
    return null
  }

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(5, 8, 15, 0.58)',
        backdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          minWidth: 220,
          padding: '22px 26px',
          borderRadius: 'var(--radius-lg)',
          border: '0.5px solid var(--border-3)',
          background: 'rgba(16, 25, 40, 0.94)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          display: 'grid',
          justifyItems: 'center',
          gap: 12,
        }}
      >
        <Loader2 size={28} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)', fontSize: 16 }}>
          Loading data
        </div>
        <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Fetching the latest view...
        </div>
      </div>
    </div>
  )
}
