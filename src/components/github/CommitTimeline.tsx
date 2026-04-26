import { memo, useCallback, useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import { useD3 } from '../../hooks/useD3'
import { renderTimeline } from '../../lib/d3/timeline'
import { useUIStore } from '../../store/uiStore'
import type { CommitData } from '../../types/index.ts'

interface CommitTimelineProps {
  commits: CommitData[]
  onCommitSelect: (commit: CommitData | null) => void
}

type RangeKey = '7D' | '30D' | '90D' | 'All'

const ranges: RangeKey[] = ['7D', '30D', '90D', 'All']
const noopHover = () => undefined

function CommitTimeline({ commits, onCommitSelect }: CommitTimelineProps) {
  const [activeRange, setActiveRange] = useState<RangeKey>('All')
  const loading = useUIStore(state => state.isLoading('github-connect'))

  const filtered = useMemo(() => {
    if (activeRange === 'All') {
      return commits
    }

    const days = Number(activeRange.replace('D', ''))
    const cutoff = subDays(new Date(), days)
    return commits.filter(commit => new Date(commit.author.date) >= cutoff)
  }, [activeRange, commits])

  const renderFn = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    if (!filtered.length) {
      return () => {
        container.innerHTML = ''
      }
    }

    return renderTimeline(container, filtered, {
      width: dimensions.width,
      height: 280,
      margin: { top: 16, right: 18, bottom: 40, left: 10 },
      onCommitClick: onCommitSelect,
      onCommitHover: noopHover,
    })
  }, [filtered, onCommitSelect])

  const chartRef = useD3<HTMLDivElement>(renderFn, [filtered])

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>Commit Timeline</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ranges.map(range => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              style={{
                height: 28,
                padding: '0 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeRange === range ? 'var(--teal)' : 'var(--bg-raised)',
                color: activeRange === range ? 'var(--bg-void)' : 'var(--text-2)',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ndex-skeleton" style={{ height: 280, borderRadius: 8 }} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            height: 280,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--text-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          }}
        >
          No commits in this range
        </div>
      ) : (
        <div ref={chartRef} style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden' }} />
      )}

      <div style={{ marginTop: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Showing {filtered.length.toLocaleString()} commits
      </div>
    </section>
  )
}

export default memo(CommitTimeline)
