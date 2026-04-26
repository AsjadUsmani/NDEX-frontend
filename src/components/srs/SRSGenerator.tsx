import { CheckCircle2, Cpu, Loader2, Sparkles, XCircle } from 'lucide-react'
import SRSExporter from './SRSExporter'
import type { GeneratedSRS } from '../../types/index.ts'

interface SRSGeneratorProps {
  status: 'idle' | 'generating' | 'complete' | 'error'
  progress: number
  progressLabel: string
  currentStep: string
  document: GeneratedSRS | null
  onGenerate: () => void
  onCancel: () => void
  onRegenerate: () => void
}

const orderedSteps = [
  'context',
  'intro',
  'functional',
  'nonfunctional',
  'architecture',
  'datamodels',
  'api',
  'testing',
]

const stepLabelMap: Record<string, string> = {
  context: 'Gathering repo context...',
  intro: 'Writing introduction...',
  functional: 'Functional requirements',
  nonfunctional: 'Non-functional requirements',
  architecture: 'Mapping architecture...',
  datamodels: 'Defining data models...',
  api: 'Documenting API endpoints...',
  testing: 'Writing testing requirements...',
}

function StepIcon({ state }: { state: 'pending' | 'active' | 'complete' }) {
  if (state === 'complete') {
    return <CheckCircle2 size={14} style={{ color: 'var(--gold)' }} />
  }
  if (state === 'active') {
    return <Loader2 size={14} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
  }
  return <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-4)', display: 'inline-block' }} />
}

export default function SRSGenerator({
  status,
  progress,
  progressLabel,
  currentStep,
  document,
  onGenerate,
  onCancel,
  onRegenerate,
}: SRSGeneratorProps) {
  if (status === 'complete' && document) {
    const isFallback = document.metadata.generationMode === 'fallback'

    return (
      <div
        style={{
          background: 'var(--bg-raised)',
          border: '0.5px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={16} style={{ color: isFallback ? '#f59e0b' : '#22c55e' }} />
          <div>
            <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 14 }}>
              {isFallback ? 'Fallback SRS Generated' : 'SRS Generated with Groq'}
            </div>
            <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {new Date(document.generatedAt).toLocaleString()}
            </div>
            {document.metadata.warning ? (
              <div style={{ color: '#fbbf24', fontSize: 12, marginTop: 4 }}>
                {document.metadata.warning}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={onRegenerate}
            style={{
              height: 32,
              padding: '0 12px',
              border: '0.5px solid var(--border-2)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
            }}
          >
            Regenerate
          </button>
          <SRSExporter document={document} />
        </div>
      </div>
    )
  }

  if (status === 'generating') {
    const currentIndex = orderedSteps.indexOf(currentStep)
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference

    return (
      <section
        className="ndex-grid-bg"
        style={{
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          display: 'grid',
          gap: 20,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {orderedSteps.map((step, index) => {
              const state: 'pending' | 'active' | 'complete' =
                index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'pending'

              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, color: state === 'active' ? 'var(--teal)' : state === 'complete' ? 'var(--gold)' : 'var(--text-3)' }}>
                  <StepIcon state={state} />
                  <span style={{ fontSize: 13 }}>{stepLabelMap[step]}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
            <svg width={92} height={92} viewBox="0 0 92 92">
              <circle cx="46" cy="46" r={radius} fill="none" stroke="rgba(0,161,155,0.2)" strokeWidth="3" />
              <circle
                cx="46"
                cy="46"
                r={radius}
                fill="none"
                stroke="var(--teal)"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 46 46)"
                style={{ transition: 'stroke-dashoffset 300ms ease' }}
              />
              <text x="46" y="52" textAnchor="middle" style={{ fill: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: 26 }}>
                {progress}
              </text>
            </svg>
            <div style={{ color: 'var(--text-2)', fontSize: 14 }}>{progressLabel}</div>
            <button
              type="button"
              onClick={onCancel}
              style={{
                height: 32,
                padding: '0 12px',
                border: '0.5px solid rgba(255,94,94,0.45)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                color: '#ff8b8b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <XCircle size={14} />
              Cancel
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="ndex-grid-bg"
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 24px',
        display: 'grid',
        justifyItems: 'center',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <Cpu size={48} style={{ color: 'var(--teal)' }} />
      <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)' }}>
        Generate SRS Documentation
      </h2>
      <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 14, maxWidth: 480, lineHeight: 1.7 }}>
        AI analyzes your repository and generates a complete IEEE 830 Software Requirements Specification.
      </p>
      <button
        type="button"
        onClick={onGenerate}
        style={{
          height: 48,
          padding: '0 32px',
          background: 'linear-gradient(135deg, var(--teal), var(--teal-dim))',
          color: 'var(--bg-void)',
          fontWeight: 700,
          fontSize: 15,
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
        onMouseEnter={event => {
          event.currentTarget.style.filter = 'brightness(1.1)'
          event.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={event => {
          event.currentTarget.style.filter = 'none'
          event.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <Sparkles size={16} />
        Generate SRS
      </button>
      <div style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
        Powered by Groq · llama-3.3-70b-versatile
      </div>
    </section>
  )
}
