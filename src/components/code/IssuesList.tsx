import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, ShieldCheck } from 'lucide-react'
import type { CodeIssue } from '../../types/index.ts'

interface IssuesListProps {
  issues: CodeIssue[]
}

type FilterKey = 'all' | 'security' | 'performance' | 'bug' | 'style' | 'maintainability'

function severityColor(severity: CodeIssue['severity']): string {
  if (severity === 'critical') return '#ff5e5e'
  if (severity === 'high') return '#f97316'
  if (severity === 'medium') return '#e4dd3d'
  return '#4d7c79'
}

function headerBadgeColor(issues: CodeIssue[]): string {
  if (issues.some(issue => issue.severity === 'critical')) return '#ff5e5e'
  if (issues.some(issue => issue.severity === 'high')) return '#f97316'
  if (issues.length > 0) return 'var(--teal)'
  return 'var(--text-3)'
}

export default function IssuesList({ issues }: IssuesListProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const counts = useMemo(
    () => ({
      all: issues.length,
      security: issues.filter(issue => issue.type === 'security').length,
      performance: issues.filter(issue => issue.type === 'performance').length,
      bug: issues.filter(issue => issue.type === 'bug').length,
      style: issues.filter(issue => issue.type === 'style').length,
      maintainability: issues.filter(issue => issue.type === 'maintainability').length,
    }),
    [issues],
  )

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return issues
    }
    return issues.filter(issue => issue.type === filter)
  }, [filter, issues])

  if (issues.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--success)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          gap: 8,
        }}
      >
        <ShieldCheck size={18} />
        No issues detected
      </div>
    )
  }

  const badgeColor = headerBadgeColor(issues)

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 600 }}>Issues Found</div>
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: badgeColor,
            border: `0.5px solid ${badgeColor}55`,
            background: `${badgeColor}1a`,
            borderRadius: 999,
            padding: '3px 10px',
          }}
        >
          {issues.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {([
          ['all', 'All'],
          ['security', 'Security'],
          ['performance', 'Performance'],
          ['bug', 'Bug'],
          ['style', 'Style'],
          ['maintainability', 'Maintainability'],
        ] as Array<[FilterKey, string]>).map(([key, label]) => {
          const active = filter === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              style={{
                border: '0.5px solid var(--border-2)',
                background: active ? 'var(--teal-faint)' : 'transparent',
                color: active ? 'var(--teal)' : 'var(--text-3)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                borderRadius: 999,
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              {label} ({counts[key]})
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map((issue, index) => {
          const expanded = expandedIndex === index
          const color = severityColor(issue.severity)
          return (
            <div
              key={`${issue.title}-${index}`}
              style={{
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border-1)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(prev => (prev === index ? null : index))}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  display: 'grid',
                  gridTemplateColumns: '4px minmax(0, 1fr)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ background: color }} />
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          textTransform: 'uppercase',
                          color,
                          background: `${color}1a`,
                          border: `0.5px solid ${color}44`,
                          borderRadius: 999,
                          padding: '2px 8px',
                        }}
                      >
                        {issue.severity}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--text-3)',
                          background: 'var(--bg-raised)',
                          borderRadius: 999,
                          padding: '2px 8px',
                        }}
                      >
                        {issue.type}
                      </span>
                    </div>
                    {issue.line ? (
                      <span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>#L{issue.line}</span>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 8, color: 'var(--text-1)', fontSize: 14, fontWeight: 500 }}>{issue.title}</div>
                  <div
                    style={{
                      marginTop: 5,
                      color: 'var(--text-2)',
                      fontSize: 13,
                      display: '-webkit-box',
                      WebkitLineClamp: expanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {issue.description}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expanded ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        margin: '0 10px 12px 14px',
                        background: 'var(--bg-raised)',
                        borderLeft: '3px solid var(--gold)',
                        borderRadius: '0 4px 4px 0',
                        padding: '8px 12px',
                        color: 'var(--text-2)',
                        fontSize: 13,
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Lightbulb size={14} color="var(--gold)" style={{ marginTop: 2 }} />
                      <span>{issue.suggestion}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
