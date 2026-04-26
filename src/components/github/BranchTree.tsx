import { useCallback, useState } from 'react'
import { format } from 'date-fns'
import { useD3 } from '../../hooks/useD3'
import { renderBranchTree } from '../../lib/d3/branchTree'
import { useUIStore } from '../../store/uiStore'
import type { BranchData, CommitData } from '../../types/index.ts'

interface BranchTreeProps {
  branches: BranchData[]
  commits: CommitData[]
  onBranchSelect: (branch: BranchData | null) => void
}

export default function BranchTree({ branches, commits, onBranchSelect }: BranchTreeProps) {
  const [selected, setSelected] = useState<BranchData | null>(null)
  const loading = useUIStore(state => state.isLoading('github-connect'))

  const renderFn = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    if (!branches.length) {
      return () => {
        container.innerHTML = ''
      }
    }

    return renderBranchTree(container, branches, commits, {
      width: dimensions.width,
      height: 320,
      onBranchClick: branch => {
        setSelected(branch)
        onBranchSelect(branch)
      },
    })
  }, [branches, commits, onBranchSelect])

  const chartRef = useD3<HTMLDivElement>(renderFn, [branches, commits])

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
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>Branch Tree</div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 20,
            border: '0.5px solid var(--border-2)',
            color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}
        >
          {branches.length.toLocaleString()} branches
        </span>
      </div>

      {loading ? (
        <div className="ndex-skeleton" style={{ height: 320, borderRadius: 8 }} />
      ) : (
        <div ref={chartRef} style={{ position: 'relative', width: '100%', height: 320, overflow: 'hidden' }} />
      )}

      {selected ? (
        <div
          style={{
            marginTop: 12,
            background: 'var(--bg-raised)',
            border: '0.5px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
          }}
        >
          <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: 14 }}>{selected.name}</div>
          <div style={{ marginTop: 4, color: 'var(--text-2)', fontSize: 13 }}>{selected.lastCommitMessage}</div>
          <div style={{ marginTop: 4, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {format(new Date(selected.lastCommitDate), 'MMM d, yyyy HH:mm')}
          </div>
        </div>
      ) : null}
    </section>
  )
}
