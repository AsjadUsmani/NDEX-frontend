import PageShell from '../components/layout/PageShell'
import { useEffect, useMemo, useState } from 'react'
import SRSGenerator from '../components/srs/SRSGenerator'
import SRSDocument from '../components/srs/SRSDocument'
import SRSExporter from '../components/srs/SRSExporter'
import { useRepoStore } from '../store/repoStore'
import { useSRS } from '../hooks/useSRS'
import { useSRSStore } from '../store/srsStore'

export default function SRSPage() {
  const { isConnected, owner, repoName } = useRepoStore()
  const { generate, cancel, progress, progressLabel, currentStep, status, document: generatedDocument } = useSRS()
  const getDoc = useSRSStore(state => state.getDoc)

  const repoKey = owner && repoName ? `${owner}/${repoName}` : ''
  const persistedDoc = repoKey ? getDoc(repoKey) : null
  const activeDoc = generatedDocument || persistedDoc

  const [activeSection, setActiveSection] = useState('srs-introduction')

  const tocItems = useMemo(
    () => [
      { id: 'srs-introduction', label: '1. Introduction' },
      { id: 'srs-overall', label: '2. Overall Description' },
      { id: 'srs-functional', label: '3. Functional Requirements' },
      { id: 'srs-nonfunctional', label: '4. Non-Functional Requirements' },
      { id: 'srs-architecture', label: '5. System Architecture' },
      { id: 'srs-data-models', label: '6. Data Models' },
      { id: 'srs-api', label: '7. API Endpoints' },
      { id: 'srs-testing', label: '8. Testing Requirements' },
      { id: 'srs-glossary', label: '9. Glossary' },
    ],
    [],
  )

  useEffect(() => {
    if (!activeDoc) {
      return
    }

    const targets = tocItems
      .map(item => window.document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!targets.length) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target?.id) {
          setActiveSection(visible.target.id)
        }
      },
      { threshold: 0.3, rootMargin: '-10% 0px -70% 0px' },
    )

    targets.forEach(target => observer.observe(target))

    return () => {
      observer.disconnect()
    }
  }, [activeDoc, tocItems])

  const actions = activeDoc ? <SRSExporter document={activeDoc} /> : undefined

  return (
    <PageShell
      title="SRS Documentation"
      subtitle="Generate and review IEEE 830 requirements using AI"
      actions={actions}
    >
      {isConnected ? (
        <div style={{ display: 'grid', gap: 20 }}>
          <SRSGenerator
            status={status}
            progress={progress}
            progressLabel={progressLabel}
            currentStep={currentStep}
            document={activeDoc}
            onGenerate={() => {
              if (!owner || !repoName) {
                return
              }
              generate(owner, repoName)
            }}
            onCancel={cancel}
            onRegenerate={() => {
              if (!owner || !repoName) {
                return
              }
              generate(owner, repoName)
            }}
          />

          {activeDoc ? (
            <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: 20 }}>
              <aside
                style={{
                  position: 'sticky',
                  top: 12,
                  alignSelf: 'start',
                  background: 'var(--bg-surface)',
                  borderRight: '1px solid var(--border-1)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  maxHeight: 'calc(100vh - 180px)',
                  overflowY: 'auto',
                }}
              >
                <div style={{ color: 'var(--text-3)', fontSize: 12, marginBottom: 8 }}>Contents</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {tocItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        window.document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: activeSection === item.id ? 'var(--teal)' : 'var(--text-2)',
                        fontWeight: activeSection === item.id ? 500 : 400,
                        textAlign: 'left',
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '4px 2px',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </aside>

              <div style={{ overflow: 'auto' }}>
                <SRSDocument document={activeDoc} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-raised)', border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
        }}>
          <span style={{ color: 'var(--text-1)', fontSize: 14 }}>
            No repository connected — go to Dashboard to connect one
          </span>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              background: 'var(--teal)', color: 'var(--bg-void)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </PageShell>
  )
}
