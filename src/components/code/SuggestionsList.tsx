import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { RefactorSuggestion } from '../../types/index.ts'

interface SuggestionsListProps {
  suggestions: RefactorSuggestion[]
}

function impactColor(impact: RefactorSuggestion['impact']): string {
  if (impact === 'high') return 'var(--teal)'
  if (impact === 'medium') return 'var(--gold)'
  return 'var(--text-3)'
}

function effortColor(effort: RefactorSuggestion['effort']): string {
  if (effort === 'high') return 'var(--error)'
  if (effort === 'medium') return 'var(--gold)'
  return 'var(--success)'
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  if (suggestions.length === 0) {
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        No refactor suggestions available
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'grid', gap: 10 }}>
      {suggestions.map((suggestion, index) => {
        const isOpen = Boolean(expanded[index])
        const impact = impactColor(suggestion.impact)
        const effort = effortColor(suggestion.effort)

        return (
          <div
            key={`${suggestion.title}-${index}`}
            style={{
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: 12,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'grid',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 500 }}>{suggestion.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: impact,
                      background: `${impact}1a`,
                      border: `0.5px solid ${impact}55`,
                      borderRadius: 999,
                      padding: '2px 8px',
                    }}
                  >
                    impact {suggestion.impact}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: effort,
                      background: `${effort}1a`,
                      border: `0.5px solid ${effort}55`,
                      borderRadius: 999,
                      padding: '2px 8px',
                    }}
                  >
                    effort {suggestion.effort}
                  </span>
                </div>
              </div>

              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{suggestion.description}</div>
            </button>

            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ padding: '0 12px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ color: '#ff5e5e', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 6 }}>Before</div>
                      <div style={{ borderLeft: '3px solid #ff5e5e', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <SyntaxHighlighter
                          language="text"
                          style={atomDark}
                          customStyle={{
                            margin: 0,
                            background: 'var(--bg-void)',
                            fontSize: 12,
                            maxHeight: 120,
                          }}
                        >
                          {suggestion.before}
                        </SyntaxHighlighter>
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#00c896', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 6 }}>After</div>
                      <div style={{ borderLeft: '3px solid #00c896', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <SyntaxHighlighter
                          language="text"
                          style={atomDark}
                          customStyle={{
                            margin: 0,
                            background: 'var(--bg-void)',
                            fontSize: 12,
                            maxHeight: 120,
                          }}
                        >
                          {suggestion.after}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
