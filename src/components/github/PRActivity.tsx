import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GitPullRequest, ExternalLink } from 'lucide-react'
import { useD3 } from '../../hooks/useD3'
import { usePRActivity } from '../../hooks/usePRActivity'
import { useRepoStore } from '../../store/repoStore'
import type { PRData } from '../../types/index.ts'
import {
  renderActivityChart,
  renderContributorBars,
  renderMergeGauge,
  renderPRSizeChart,
} from '../../lib/d3/prActivity'

interface PRActivityProps {
  onPRSelect: (pr: PRData | null) => void
}

function stateColor(pr: PRData): string {
  if (pr.merged) {
    return 'var(--teal)'
  }
  if (pr.state === 'open') {
    return 'var(--gold)'
  }
  return 'var(--error)'
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'N/A'
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--bg-raised)',
        border: '0.5px solid var(--border-2)',
        padding: '6px 16px',
        borderRadius: 20,
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function SkeletonCard() {
  return <div className="ndex-skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
}

export default function PRActivity({ onPRSelect }: PRActivityProps) {
  const { prs, prStats, issueStats } = useRepoStore()
  const { loading, error } = usePRActivity()
  const [selectedPR, setSelectedPR] = useState<PRData | null>(null)

  useEffect(() => {
    if (!selectedPR && prs.length > 0) {
      onPRSelect(null)
    }
  }, [onPRSelect, prs.length, selectedPR])

  const renderActivity = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    try {
      if (!prStats || !issueStats) {
        container.innerHTML = ''
        return () => undefined
      }
      return renderActivityChart(container, prStats, issueStats, {
        width: dimensions.width,
        height: 260,
        margin: { top: 20, right: 22, bottom: 40, left: 42 },
        onWeekHover: () => undefined,
      })
    } catch {
      return () => undefined
    }
  }, [issueStats, prStats])

  const renderGauge = useCallback((container: HTMLDivElement) => {
    try {
      if (!prStats) {
        container.innerHTML = ''
        return () => undefined
      }
      return renderMergeGauge(container, prStats.mergeRate, prStats.avgMergeTimeHours)
    } catch {
      return () => undefined
    }
  }, [prStats])

  const renderScatter = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    try {
      return renderPRSizeChart(container, prs, {
        width: dimensions.width,
        height: 280,
        onPRClick: pr => {
          setSelectedPR(pr)
          onPRSelect(pr)
        },
      })
    } catch {
      return () => undefined
    }
  }, [onPRSelect, prs])

  const renderContributors = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    try {
      if (!prStats) {
        container.innerHTML = ''
        return () => undefined
      }
      return renderContributorBars(container, prStats.topContributors, {
        width: dimensions.width,
        height: 280,
      })
    } catch {
      return () => undefined
    }
  }, [prStats])

  const activityRef = useD3<HTMLDivElement>(renderActivity, [prStats, issueStats])
  const gaugeRef = useD3<HTMLDivElement>(renderGauge, [prStats])
  const scatterRef = useD3<HTMLDivElement>(renderScatter, [prs])
  const contributorsRef = useD3<HTMLDivElement>(renderContributors, [prStats])

  const summary = useMemo(() => {
    return [
      { label: 'Total PRs', value: prStats?.totalPRs ?? 0 },
      { label: 'Open', value: prStats?.openPRs ?? 0 },
      { label: 'Merged', value: prStats?.mergedPRs ?? 0 },
      { label: 'Issues', value: issueStats?.totalIssues ?? 0 },
    ]
  }, [issueStats?.totalIssues, prStats])

  const selectedLabels = selectedPR?.labels ?? []

  useEffect(() => {
    if (prs.length && !selectedPR) {
      onPRSelect(null)
    }
  }, [onPRSelect, prs.length, selectedPR])

  useEffect(() => {
    if (!prs.length || selectedPR) {
      return
    }
    if (prs[0]) {
      setSelectedPR(prs[0])
      onPRSelect(prs[0])
    }
  }, [onPRSelect, prs, selectedPR])

  if (!prs.length && !loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 420,
          gap: 12,
          color: 'var(--text-3)',
          border: '1px dashed var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
        }}
      >
        <GitPullRequest size={28} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-2)' }}>
          This repository has no pull requests
        </div>
        <div style={{ fontSize: 13 }}>GitHub PR data only appears on repositories with pull requests enabled.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {summary.map(item => (
          <SummaryPill key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      {error ? (
        <div style={{ color: '#ff9b9b', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{error}</div>
      ) : null}

      {loading ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <SkeletonCard />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
            <section style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>Weekly PR & Issue Activity</div>
                <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Last 12 weeks</div>
              </div>
              <div ref={activityRef} style={{ position: 'relative', width: '100%', height: 260, overflow: 'hidden' }} />
            </section>

            <section style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>Merge Rate Gauge</div>
                <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Average merge time</div>
              </div>
              <div ref={gaugeRef} style={{ width: '100%', minHeight: 180, display: 'grid', placeItems: 'center' }} />
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
            <section style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>PR Size Distribution</div>
                <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Merged, open, and closed PRs</div>
              </div>
              <div ref={scatterRef} style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden' }} />
            </section>

            <section style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)' }}>Top Contributors</div>
                <div style={{ color: 'var(--text-3)', fontSize: 12 }}>PR authors</div>
              </div>
              <div ref={contributorsRef} style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden' }} />
            </section>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedPR ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'var(--bg-raised)',
              border: '0.5px solid var(--border-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'grid',
              gap: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', background: 'var(--gold-faint)', border: '0.5px solid var(--border-gold)', borderRadius: 999, padding: '2px 8px' }}>
                    #{selectedPR.number}
                  </span>
                  <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)', fontSize: 18, overflowWrap: 'anywhere' }}>{selectedPR.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={selectedPR.authorAvatar} alt={selectedPR.author} width={32} height={32} style={{ borderRadius: '50%' }} />
                  <div>
                    <div style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>{selectedPR.author}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Created {formatDate(selectedPR.createdAt)}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span style={{ color: stateColor(selectedPR), fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', background: `${stateColor(selectedPR)}1a`, border: `0.5px solid ${stateColor(selectedPR)}44`, borderRadius: 999, padding: '2px 8px' }}>
                  {selectedPR.merged ? 'merged' : selectedPR.state}
                </span>
                <a href={selectedPR.url || `https://github.com/${selectedPR.author}`} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  View on GitHub <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--teal)' }}>+{selectedPR.additions.toLocaleString()}</span>
              <span style={{ color: '#ff5e5e' }}>-{selectedPR.deletions.toLocaleString()}</span>
              <span style={{ color: 'var(--text-3)' }}>{selectedPR.changedFiles.toLocaleString()} files</span>
              <span style={{ color: 'var(--text-3)' }}>{selectedPR.commentCount.toLocaleString()} comments</span>
              <span style={{ color: 'var(--text-3)' }}>{selectedPR.reviewCount.toLocaleString()} reviews</span>
            </div>

            {selectedLabels.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedLabels.map(label => (
                  <span
                    key={label}
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border-1)',
                      color: 'var(--text-2)',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
