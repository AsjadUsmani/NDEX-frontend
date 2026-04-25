import { AlertTriangle, Layers, Search, Star } from 'lucide-react'
import type { DetectedPattern } from '../../types/index.ts'

interface PatternsListProps {
  patterns: DetectedPattern[]
}

function patternIcon(type: DetectedPattern['type']) {
  if (type === 'design') {
    return { Icon: Star, color: 'var(--gold)' }
  }
  if (type === 'anti') {
    return { Icon: AlertTriangle, color: 'var(--error)' }
  }
  return { Icon: Layers, color: 'var(--teal)' }
}

function sectionPatterns(patterns: DetectedPattern[], section: 'design' | 'anti'): DetectedPattern[] {
  if (section === 'design') {
    return patterns.filter(pattern => pattern.type === 'design' || pattern.type === 'architectural')
  }
  return patterns.filter(pattern => pattern.type === 'anti')
}

export default function PatternsList({ patterns }: PatternsListProps) {
  if (patterns.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          gap: 8,
        }}
      >
        <Search size={18} />
        No patterns identified
      </div>
    )
  }

  const designPatterns = sectionPatterns(patterns, 'design')
  const antiPatterns = sectionPatterns(patterns, 'anti')

  const renderCard = (pattern: DetectedPattern, index: number): JSX.Element => {
    const { Icon, color } = patternIcon(pattern.type)
    return (
      <div
        key={`${pattern.name}-${pattern.location}-${index}`}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: `${color}1a`,
          }}
        >
          <Icon size={15} color={color} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-1)' }}>{pattern.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{pattern.location}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 2, width: '100%', background: 'var(--bg-raised)', borderRadius: 999 }}>
              <div
                style={{
                  width: `${Math.max(0, Math.min(pattern.confidence, 100))}%`,
                  height: '100%',
                  background: pattern.type === 'anti' ? 'var(--error)' : 'var(--teal)',
                  borderRadius: 999,
                }}
              />
            </div>
            <div style={{ marginTop: 4, color: 'var(--text-3)', fontSize: 11 }}>{pattern.confidence}% confidence</div>
          </div>
          <div style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 13 }}>{pattern.description}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'grid', gap: 16 }}>
      <section>
        <div style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Design Patterns</div>
        {designPatterns.length > 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>{designPatterns.map(renderCard)}</div>
        ) : (
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No design patterns identified.</div>
        )}
      </section>

      <section>
        <div style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Anti-Patterns</div>
        {antiPatterns.length > 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>{antiPatterns.map(renderCard)}</div>
        ) : (
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No anti-patterns identified.</div>
        )}
      </section>
    </div>
  )
}
