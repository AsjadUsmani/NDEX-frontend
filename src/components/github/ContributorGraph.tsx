import { useCallback, useState } from 'react'
import { useD3 } from '../../hooks/useD3'
import { renderForceGraph } from '../../lib/d3/forceGraph'
import { useUIStore } from '../../store/uiStore'
import type { ContributorData } from '../../types/index.ts'

interface ContributorGraphProps {
  contributors: ContributorData[]
  onContributorSelect: (contributor: ContributorData | null) => void
}

export default function ContributorGraph({ contributors, onContributorSelect }: ContributorGraphProps) {
  const [selected, setSelected] = useState<ContributorData | null>(null)
  const loading = useUIStore(state => state.isLoading('github-connect'))

  const renderFn = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    if (!contributors.length) {
      return () => {
        container.innerHTML = ''
      }
    }

    return renderForceGraph(container, contributors, {
      width: dimensions.width,
      height: 360,
      onNodeClick: contributor => {
        setSelected(contributor)
        onContributorSelect(contributor)
      },
      onNodeHover: contributor => {
        if (!contributor) {
          return
        }
        setSelected(contributor)
      },
    })
  }, [contributors, onContributorSelect])

  const chartRef = useD3<HTMLDivElement>(renderFn, [contributors])

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>Contributor Graph</div>
        <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Node size = commits</div>
      </div>

      {loading ? (
        <div className="ndex-skeleton" style={{ height: 360, borderRadius: 8 }} />
      ) : (
        <div ref={chartRef} style={{ position: 'relative', width: '100%', height: 360, overflow: 'hidden' }} />
      )}

      {selected ? (
        <div
          style={{
            marginTop: 12,
            background: 'var(--bg-raised)',
            border: '0.5px solid var(--border-2)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <img src={selected.avatarUrl} alt={selected.login} width={48} height={48} style={{ borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600 }}>{selected.name || selected.login}</div>
            <div style={{ color: 'var(--text-3)', fontSize: 12 }}>@{selected.login}</div>
            <div style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {selected.contributions.toLocaleString()} contributions
            </div>
          </div>
          <a href={`https://github.com/${selected.login}`} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: 13 }}>
            View on GitHub →
          </a>
        </div>
      ) : null}
    </section>
  )
}
