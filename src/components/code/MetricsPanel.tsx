import {
  Braces,
  Brain,
  FileCode,
  GitBranch,
  Layers,
  Package,
  Wrench,
} from 'lucide-react'
import type { ComplexityMetrics } from '../../types/index.ts'

interface MetricsPanelProps {
  metrics: ComplexityMetrics
  qualityScore: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function qualityColor(score: number): string {
  if (score <= 40) return '#ff5e5e'
  if (score <= 69) return '#e4dd3d'
  if (score <= 84) return 'var(--teal)'
  return 'var(--success)'
}

function complexityColor(value: number): string {
  if (value <= 5) return 'var(--success)'
  if (value <= 10) return 'var(--teal)'
  if (value <= 20) return 'var(--gold)'
  return 'var(--error)'
}

function nestingColor(value: number): string {
  if (value <= 2) return 'var(--success)'
  if (value <= 4) return 'var(--gold)'
  return 'var(--error)'
}

function commentColor(value: number): string {
  if (value < 10) return 'var(--error)'
  if (value < 20) return 'var(--gold)'
  return 'var(--success)'
}

function maintainabilityColor(value: number): string {
  if (value < 40) return 'var(--error)'
  if (value < 70) return 'var(--gold)'
  return 'var(--success)'
}

export default function MetricsPanel({ metrics, qualityScore }: MetricsPanelProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const filled = (clamp(qualityScore, 0, 100) / 100) * circumference
  const scoreColor = qualityColor(qualityScore)

  const cards = [
    {
      key: 'cyclomaticComplexity',
      label: 'Cyclomatic Complexity',
      value: metrics.cyclomaticComplexity,
      max: 50,
      color: complexityColor(metrics.cyclomaticComplexity),
      Icon: GitBranch,
      suffix: '/50',
    },
    {
      key: 'cognitiveComplexity',
      label: 'Cognitive Complexity',
      value: metrics.cognitiveComplexity,
      max: 50,
      color: complexityColor(metrics.cognitiveComplexity),
      Icon: Brain,
      suffix: '/50',
    },
    {
      key: 'linesOfCode',
      label: 'Lines of Code',
      value: metrics.linesOfCode,
      max: Math.max(metrics.linesOfCode, 1),
      color: 'var(--teal)',
      Icon: FileCode,
      suffix: '',
    },
    {
      key: 'commentRatio',
      label: 'Comment Ratio',
      value: Number(metrics.commentRatio.toFixed(1)),
      max: 100,
      color: commentColor(metrics.commentRatio),
      Icon: FileCode,
      suffix: '%',
    },
    {
      key: 'functionCount',
      label: 'Functions',
      value: metrics.functionCount,
      max: Math.max(metrics.functionCount, 1),
      color: 'var(--teal)',
      Icon: Braces,
      suffix: '',
    },
    {
      key: 'nestingDepth',
      label: 'Max Nesting',
      value: metrics.nestingDepth,
      max: 10,
      color: nestingColor(metrics.nestingDepth),
      Icon: Layers,
      suffix: '',
    },
    {
      key: 'maintainabilityIndex',
      label: 'Maintainability',
      value: metrics.maintainabilityIndex,
      max: 100,
      color: maintainabilityColor(metrics.maintainabilityIndex),
      Icon: Wrench,
      suffix: '/100',
    },
    {
      key: 'importCount',
      label: 'Import Count',
      value: metrics.importCount,
      max: Math.max(metrics.importCount, 1),
      color: 'var(--text-2)',
      Icon: Package,
      suffix: '',
    },
  ]

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
      }}
    >
      <div
        style={{
          gridColumn: '1 / -1',
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border-1)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', width: 150, height: 150, display: 'grid', placeItems: 'center' }}>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={radius} stroke="var(--border-2)" strokeWidth="8" fill="none" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={scoreColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${filled} ${circumference - filled}`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: scoreColor }}>
              {Math.round(qualityScore)}
            </div>
            <div
              style={{
                marginTop: -2,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-3)',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Quality Score
            </div>
          </div>
        </div>
      </div>

      {cards.map(card => {
        const progress = clamp((card.value / card.max) * 100, 0, 100)
        return (
          <div
            key={card.key}
            style={{
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `${card.color}1a`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <card.Icon size={16} color={card.color} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: card.color }}>
                {card.value}
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 3 }}>{card.suffix}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: 'var(--text-3)',
              }}
            >
              {card.label}
            </div>

            <div style={{ marginTop: 10, height: 3, width: '100%', borderRadius: 999, background: 'var(--bg-raised)' }}>
              <div style={{ height: '100%', width: `${progress}%`, borderRadius: 999, background: card.color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
