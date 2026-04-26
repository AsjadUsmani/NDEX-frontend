import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitCompare, Plus, Minus,
  Files, Download, Filter
} from 'lucide-react'
import { useD3 } from '../hooks/useD3'
import { useRepoStore } from '../store/repoStore'
import { githubApi } from '../lib/api'
import PageShell from '../components/layout/PageShell'
import DiffRefSelector from '../components/diff/DiffRefSelector'
import DiffViewer from '../components/diff/DiffViewer'
import EmptyState from '../components/ui/EmptyState'
import {
  renderDiffWaterfall,
  renderDiffDonut,
  renderDiffTimeline,
} from '../lib/d3/diffChart'
import type {
  CommitComparison, DiffFile, DiffStats
} from '../types'
import toast from 'react-hot-toast'

type FilterType = 'all' | 'added' | 'removed' | 'modified'

export default function DiffPage() {

  const { owner, repoName, isConnected } = useRepoStore()
  const [loading, setLoading]           = useState(false)
  const [comparison, setComparison]     = useState<CommitComparison | null>(null)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set<string>())
  const [filter, setFilter]             = useState<FilterType>('all')
  const [searchQuery, setSearchQuery]   = useState('')

  // Computed stats
  const stats: DiffStats | null = comparison ? {
    totalFiles:    comparison.files.length,
    totalAdditions: comparison.files.reduce((s, f) => s + f.additions, 0),
    totalDeletions: comparison.files.reduce((s, f) => s + f.deletions, 0),
    addedFiles:    comparison.files.filter(f => f.status === 'added').length,
    removedFiles:  comparison.files.filter(f => f.status === 'removed').length,
    modifiedFiles: comparison.files.filter(f => f.status === 'modified').length,
  } : null

  // Filtered files
  const filteredFiles = comparison?.files.filter(f => {
    const matchesFilter = filter === 'all' || f.status === filter
    const matchesSearch = !searchQuery ||
      f.filename.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  }) || []

  // Compare handler
  const handleCompare = useCallback(async (
    base: string, head: string
  ) => {
    if (!owner || !repoName) return
    setLoading(true)
    setComparison(null)
    setExpandedFiles(new Set<string>())
    try {
      const res = await githubApi.compareRefs(owner, repoName, base, head)
      setComparison(res.data)
      // Auto-expand first 3 files
      const firstThree = new Set<string>(
        res.data.files.slice(0, 3).map((f: DiffFile) => f.filename)
      )
      setExpandedFiles(firstThree)
      toast.success(
        `Comparing ${base} ← ${head}: ${res.data.files.length} files changed`
      )
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }, [owner, repoName])

  // D3 waterfall chart
  const waterfallRef = useD3<HTMLDivElement>(
    (container, { width }) => {
      if (!comparison?.files.length) return
      return renderDiffWaterfall(container, comparison.files, {
        width,
        height: Math.min(comparison.files.length * 32 + 40, 400),
        onFileClick: f => {
          setExpandedFiles(prev => {
            const next = new Set(prev)
            next.has(f.filename)
              ? next.delete(f.filename)
              : next.add(f.filename)
            return next
          })
        },
        onFileHover: () => {},
      })
    },
    [comparison]
  )

  // D3 donut chart
  const donutRef = useD3<HTMLDivElement>(
    (container) => {
      if (!stats) return
      return renderDiffDonut(container, stats)
    },
    [stats]
  )

  // D3 timeline
  const timelineRef = useD3<HTMLDivElement>(
    (container, { width }) => {
      if (!comparison?.commits.length) return
      return renderDiffTimeline(container, comparison.commits, {
        width,
        height: 80,
        onCommitClick: c =>
          window.open(c.url, '_blank'),
      })
    },
    [comparison]
  )

  // Download diff as patch file
  const downloadPatch = () => {
    if (!comparison) return
    const patch = comparison.files
      .filter(f => f.patch)
      .map(f => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch}`)
      .join('\n\n')
    const blob = new Blob([patch], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${owner}-${repoName}-diff.patch`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Patch file downloaded!')
  }

  if (!isConnected) {
    return (
      <PageShell title="Diff Viewer">
        <EmptyState />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Diff Viewer"
      subtitle="Compare any two branches, commits, or tags"
      actions={
        comparison && (
          <button
            onClick={downloadPatch}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 34, padding: '0 16px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-2)', fontSize: 13,
              fontFamily: 'Geist, sans-serif',
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Download .patch
          </button>
        )
      }
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        paddingBottom: 40,
      }}>

        {/* Ref selector */}
        <DiffRefSelector onCompare={handleCompare} loading={loading} />

        {/* Results */}
        <AnimatePresence>
        {comparison && stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >

            {/* Stats row: 4 cards + donut */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr) auto',
              gap: 12,
              alignItems: 'stretch',
            }}>

              {/* Stat cards */}
              {[
                { icon: Files,  label: 'Files Changed',
                  value: stats.totalFiles,      color: 'var(--teal)' },
                { icon: Plus,   label: 'Lines Added',
                  value: stats.totalAdditions,  color: '#00c896'     },
                { icon: Minus,  label: 'Lines Removed',
                  value: stats.totalDeletions,  color: '#ff5e5e'     },
                { icon: GitCompare, label: 'Commits',
                  value: comparison.totalCommits, color: 'var(--gold)' },
              ].map(card => (
                <div key={card.label} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, marginBottom: 10,
                  }}>
                    <card.icon size={14} color={card.color} />
                    <span style={{
                      fontSize: 11, color: 'var(--text-3)',
                      fontFamily: 'Geist, sans-serif',
                      textTransform: 'uppercase', letterSpacing: '0.8px',
                    }}>
                      {card.label}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'Geist, sans-serif',
                    fontSize: 28, fontWeight: 700,
                    color: card.color,
                    letterSpacing: '-0.02em',
                  }}>
                    {card.value.toLocaleString()}
                  </div>
                </div>
              ))}

              {/* Donut */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div ref={donutRef} />
              </div>
            </div>

            {/* Commit timeline */}
            {comparison.commits.length > 0 && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
              }}>
                <div style={{
                  fontSize: 12, color: 'var(--text-3)',
                  fontFamily: 'Geist, sans-serif',
                  marginBottom: 8, fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}>
                  {comparison.totalCommits} commits · click to open
                </div>
                <div ref={timelineRef} style={{ height: 80 }} />
              </div>
            )}

            {/* Waterfall chart */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              overflow: 'hidden',
            }}>
              <div style={{
                fontSize: 12, color: 'var(--text-3)',
                fontFamily: 'Geist, sans-serif', marginBottom: 12,
                fontWeight: 500, textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}>
                File changes — click to jump to diff
              </div>
              <div
                ref={waterfallRef}
                style={{ width: '100%', overflow: 'auto' }}
              />
            </div>

            {/* File list header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{
                fontFamily: 'Geist, sans-serif',
                fontSize: 15, fontWeight: 600,
                color: 'var(--text-1)',
              }}>
                Changed Files
              </span>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['all','modified','added','removed'] as FilterType[])
                  .map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      height: 26, padding: '0 12px',
                      background: filter === f
                        ? 'var(--teal)' : 'var(--bg-raised)',
                      border: filter === f
                        ? 'none' : '1px solid var(--border-1)',
                      borderRadius: 20,
                      color: filter === f
                        ? 'var(--bg-void)' : 'var(--text-3)',
                      fontSize: 11,
                      fontFamily: 'Geist, sans-serif',
                      fontWeight: filter === f ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f === 'all'
                      ? `All (${stats.totalFiles})`
                      : f === 'modified'
                        ? `Modified (${stats.modifiedFiles})`
                        : f === 'added'
                          ? `Added (${stats.addedFiles})`
                          : `Removed (${stats.removedFiles})`
                    }
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ marginLeft: 'auto', position: 'relative' }}>
                <Filter
                  size={12}
                  color="var(--text-3)"
                  style={{
                    position: 'absolute', left: 10,
                    top: '50%', transform: 'translateY(-50%)',
                  }}
                />
                <input
                  placeholder="Filter files..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    height: 30, padding: '0 10px 0 28px',
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border-2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-1)',
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 12, outline: 'none',
                    width: 180,
                  }}
                />
              </div>

              {/* Expand/collapse all */}
              <button
                onClick={() => {
                  if (expandedFiles.size === filteredFiles.length) {
                    setExpandedFiles(new Set())
                  } else {
                    setExpandedFiles(
                      new Set(filteredFiles.map(f => f.filename))
                    )
                  }
                }}
                style={{
                  height: 30, padding: '0 12px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-1)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-3)', fontSize: 11,
                  fontFamily: 'Geist, sans-serif',
                  cursor: 'pointer',
                }}
              >
                {expandedFiles.size === filteredFiles.length
                  ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            {/* File diffs */}
            <div>
              {filteredFiles.length === 0 && (
                <div style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--text-3)',
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 13,
                }}>
                  No files match "{searchQuery}"
                </div>
              )}
              {filteredFiles.map(file => (
                <DiffViewer
                  key={file.filename}
                  file={file}
                  isExpanded={expandedFiles.has(file.filename)}
                  onToggle={() => {
                    setExpandedFiles(prev => {
                      const next = new Set(prev)
                      next.has(file.filename)
                        ? next.delete(file.filename)
                        : next.add(file.filename)
                      return next
                    })
                  }}
                />
              ))}
            </div>

          </motion.div>
        )}
        </AnimatePresence>

        {/* Empty: no comparison yet */}
        {!comparison && !loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '80px 0',
            color: 'var(--text-3)',
          }}>
            <GitCompare size={40} color="var(--border-2)" />
            <div style={{
              fontFamily: 'Geist, sans-serif',
              fontSize: 15, color: 'var(--text-3)',
            }}>
              Select two refs above to compare
            </div>
            <div style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 12, color: 'var(--text-4)',
            }}>
              branch · commit SHA · tag · HEAD~n
            </div>
          </div>
        )}

      </div>
    </PageShell>
  )
}
