import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, FlaskConical, Layers3, Link as LinkIcon, ShieldCheck } from 'lucide-react'
import type { APIEndpoint, DataModel, GeneratedSRS, NonFunctionalRequirement } from '../../types/index.ts'

interface SRSDocumentProps {
  document: GeneratedSRS
}

interface SectionBlockProps {
  id: string
  number: string
  title: string
  children: React.ReactNode
  printBreak?: boolean
}

function SectionBlock({ id, number, title, children, printBreak = false }: SectionBlockProps) {
  return (
    <section id={id} className={printBreak ? 'print-section' : undefined} style={{ marginTop: 28 }}>
      <div
        style={{
          borderLeft: '3px solid transparent',
          paddingLeft: 12,
          transition: 'border-color 0.2s ease',
        }}
        onMouseEnter={event => {
          event.currentTarget.style.borderLeftColor = 'var(--teal)'
        }}
        onMouseLeave={event => {
          event.currentTarget.style.borderLeftColor = 'transparent'
        }}
      >
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-1)' }}>
          <span style={{ color: 'var(--teal)', marginRight: 8 }}>{number}</span>
          {title}
        </h2>
      </div>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  )
}

function apiMethodColor(method: APIEndpoint['method']): string {
  if (method === 'GET') return 'var(--teal)'
  if (method === 'POST') return 'var(--gold)'
  if (method === 'PUT') return '#3b82f6'
  if (method === 'DELETE') return '#ef4444'
  return '#8b5cf6'
}

function nfrGroups(items: NonFunctionalRequirement[]): Record<string, NonFunctionalRequirement[]> {
  return items.reduce<Record<string, NonFunctionalRequirement[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})
}

function techBadgeColor(tech: string): string {
  const value = tech.toLowerCase()
  if (value.includes('react')) return '#00d4cc'
  if (value.includes('node')) return '#10b981'
  if (value.includes('typescript')) return '#3b82f6'
  if (value.includes('express')) return '#f59e0b'
  return '#8b5cf6'
}

function DataModelCard({ model }: { model: DataModel }) {
  return (
    <article style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: 16 }}>
      <h4 style={{ margin: 0, color: 'var(--text-1)', fontSize: 16 }}>{model.name}</h4>
      <p style={{ margin: '6px 0 14px', color: 'var(--text-2)', fontSize: 13 }}>{model.description}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Field</th>
            <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Type</th>
            <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Required</th>
            <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {model.fields.map(field => (
            <tr key={`${model.name}-${field.name}`}>
              <td style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontSize: 12 }}>{field.name}</td>
              <td style={{ padding: '8px 0', fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontSize: 12 }}>{field.type}</td>
              <td style={{ padding: '8px 0' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: field.required ? '#22c55e' : '#64748b' }} />
              </td>
              <td style={{ padding: '8px 0', color: 'var(--text-2)', fontSize: 12 }}>{field.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  )
}

export default function SRSDocument({ document }: SRSDocumentProps) {
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({})

  const toc = useMemo(
    () => [
      { id: 'srs-introduction', number: '1', title: 'Introduction' },
      { id: 'srs-overall', number: '2', title: 'Overall Description' },
      { id: 'srs-functional', number: '3', title: 'Functional Requirements' },
      { id: 'srs-nonfunctional', number: '4', title: 'Non-Functional Requirements' },
      { id: 'srs-architecture', number: '5', title: 'System Architecture' },
      { id: 'srs-data-models', number: '6', title: 'Data Models' },
      { id: 'srs-api', number: '7', title: 'API Endpoints' },
      { id: 'srs-testing', number: '8', title: 'Testing Requirements' },
      { id: 'srs-glossary', number: '9', title: 'Glossary' },
    ],
    [],
  )

  const groupedNfr = nfrGroups(document.document.nonFunctionalRequirements)

  return (
    <article className="print-root" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', padding: '40px 48px', maxWidth: 860, margin: '0 auto' }}>
      <header>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: 3, color: 'var(--text-3)', textTransform: 'uppercase' }}>
          Software Requirements Specification
        </div>
        <h1 style={{ margin: '8px 0 6px', fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--gold)' }}>{document.repoName}</h1>
        <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          Version {document.version} · {new Date(document.generatedAt).toLocaleString()}
        </div>
        <hr style={{ borderColor: 'var(--border-gold)', margin: '18px 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, color: 'var(--text-2)', fontSize: 13 }}>
          <div>Repository</div>
          <div>{document.repoUrl}</div>
          <div>Generated by</div>
          <div>NDEX AI</div>
          <div>Version</div>
          <div>{document.version}</div>
          <div>Date</div>
          <div>{new Date(document.generatedAt).toLocaleString()}</div>
        </div>
      </header>

      <section style={{ marginTop: 28, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 2 }}>
          Contents
        </h3>
        <ol style={{ margin: '12px 0 0', paddingLeft: 18 }}>
          {toc.map(item => (
            <li key={item.id} style={{ margin: '6px 0' }}>
              <button
                type="button"
                onClick={() => {
                  window.document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                }}
              >
                {item.number}. {item.title}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <SectionBlock id="srs-introduction" number="1" title="Introduction" printBreak>
        <h4 style={{ margin: '0 0 8px', color: 'var(--text-1)' }}>Purpose</h4>
        <p style={{ margin: '0 0 14px', color: 'var(--text-2)', lineHeight: 1.7 }}>{document.document.introduction.purpose}</p>
        <h4 style={{ margin: '0 0 8px', color: 'var(--text-1)' }}>Scope</h4>
        <p style={{ margin: '0 0 14px', color: 'var(--text-2)', lineHeight: 1.7 }}>{document.document.introduction.scope}</p>
        <h4 style={{ margin: '0 0 8px', color: 'var(--text-1)' }}>Definitions</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11, paddingBottom: 8 }}>Term</th>
              <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11, paddingBottom: 8 }}>Definition</th>
            </tr>
          </thead>
          <tbody>
            {document.document.introduction.definitions.map((item, index) => (
              <tr key={`${item.term}-${index}`} style={{ background: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-card)' }}>
                <td style={{ padding: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-2)', fontSize: 13 }}>{item.term}</td>
                <td style={{ padding: 8, color: 'var(--text-2)', fontSize: 13 }}>{item.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBlock>

      <SectionBlock id="srs-overall" number="2" title="Overall Description" printBreak>
        <p style={{ margin: '0 0 10px', color: 'var(--text-2)', lineHeight: 1.7 }}>{document.document.overallDescription.productPerspective}</p>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-1)' }}>Product Functions</h4>
            <ul style={{ margin: '8px 0 0', color: 'var(--text-2)' }}>
              {document.document.overallDescription.productFunctions.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-1)' }}>User Classes</h4>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {document.document.overallDescription.userClasses.map(item => (
                <div key={item.name} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 10 }}>
                  <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{item.description}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{item.privileges}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock id="srs-functional" number="3" title="Functional Requirements" printBreak>
        <div style={{ display: 'grid', gap: 12 }}>
          {document.document.functionalRequirements.map(item => (
            <article key={item.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'var(--teal-faint)', color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                    {item.id}
                  </span>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{item.title}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', borderRadius: 4, color: item.priority === 'HIGH' ? '#ff8b8b' : item.priority === 'MEDIUM' ? 'var(--gold)' : '#22c55e', border: '1px solid var(--border-2)' }}>
                  {item.priority}
                </span>
              </div>
              <p style={{ margin: '10px 0', color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7 }}>{item.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <div>
                  <div style={{ color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase' }}>Inputs</div>
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.inputs.map(value => (
                      <span key={value} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 20 }}>{value}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase' }}>Outputs</div>
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.outputs.map(value => (
                      <span key={value} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 10px', borderRadius: 20 }}>{value}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock id="srs-nonfunctional" number="4" title="Non-Functional Requirements" printBreak>
        <div style={{ display: 'grid', gap: 14 }}>
          {Object.entries(groupedNfr).map(([category, items]) => (
            <div key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-1)' }}>{category}</h4>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {items.map(item => (
                  <article key={item.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{item.id}</div>
                    <p style={{ margin: '4px 0 8px', color: 'var(--text-2)', fontSize: 13 }}>{item.description}</p>
                    <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{item.metric}</div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock id="srs-architecture" number="5" title="System Architecture" printBreak>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>{document.document.systemArchitecture.description}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Name</th>
              <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Responsibility</th>
              <th style={{ textAlign: 'left', color: 'var(--text-3)', fontSize: 11 }}>Technology</th>
            </tr>
          </thead>
          <tbody>
            {document.document.systemArchitecture.components.map(component => (
              <tr key={component.name}>
                <td style={{ padding: '8px 0', color: 'var(--text-1)' }}>{component.name}</td>
                <td style={{ padding: '8px 0', color: 'var(--text-2)' }}>{component.responsibility}</td>
                <td style={{ padding: '8px 0' }}>
                  <span style={{ borderRadius: 12, padding: '2px 8px', fontSize: 11, color: '#ffffff', background: techBadgeColor(component.technology) }}>{component.technology}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, borderLeft: '3px solid var(--teal)', paddingLeft: 10, color: 'var(--text-2)' }}>
          {document.document.systemArchitecture.dataFlow}
        </div>
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {document.document.systemArchitecture.integrations.map(integration => (
            <div key={integration.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkIcon size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ color: 'var(--text-1)' }}>{integration.name}</span>
              <span style={{ color: 'var(--text-3)', fontSize: 12 }}>({integration.type})</span>
              <span style={{ color: 'var(--text-2)', fontSize: 12 }}>— {integration.purpose}</span>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock id="srs-api" number="7" title="API Endpoints" printBreak>
        <div style={{ display: 'grid', gap: 8 }}>
          {document.document.apiEndpoints.map(endpoint => {
            const key = `${endpoint.method}-${endpoint.path}`
            const expanded = Boolean(expandedEndpoints[key])

            return (
              <article key={key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedEndpoints(prev => ({ ...prev, [key]: !expanded }))
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: apiMethodColor(endpoint.method), color: '#05080f', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                      {endpoint.method}
                    </span>
                    <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>{endpoint.path}</span>
                    {endpoint.authRequired ? <span style={{ color: 'var(--gold)', fontSize: 11 }}>🔒 Auth</span> : null}
                  </div>
                  {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />}
                </button>
                <div style={{ padding: '0 12px 12px', color: 'var(--text-2)', fontSize: 13 }}>{endpoint.description}</div>
                {expanded ? (
                  <div style={{ borderTop: '1px solid var(--border-1)', padding: 12, display: 'grid', gap: 8 }}>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Request: {endpoint.requestBody || 'N/A'}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Response: {endpoint.responseSchema || 'N/A'}</div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </SectionBlock>

      <SectionBlock id="srs-data-models" number="6" title="Data Models" printBreak>
        <div style={{ display: 'grid', gap: 10 }}>
          {document.document.dataModels.map(model => (
            <DataModelCard key={model.name} model={model} />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock id="srs-testing" number="8" title="Testing Requirements" printBreak>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {[
            { key: 'Unit Testing', value: document.document.testingRequirements.unitTesting, icon: CheckCircle2 },
            { key: 'Integration Testing', value: document.document.testingRequirements.integrationTesting, icon: Layers3 },
            { key: 'E2E Testing', value: document.document.testingRequirements.e2eTesting, icon: ShieldCheck },
            { key: 'Performance Testing', value: document.document.testingRequirements.performanceTesting, icon: FlaskConical },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} style={{ color: 'var(--teal)' }} />
                  <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>{item.key}</span>
                </div>
                <p style={{ margin: '8px 0 0', color: 'var(--text-2)', fontSize: 13 }}>{item.value}</p>
              </div>
            )
          })}
        </div>
      </SectionBlock>

      <SectionBlock id="srs-glossary" number="9" title="Glossary" printBreak>
        <div style={{ display: 'grid', gap: 8 }}>
          {document.document.glossary.map(item => (
            <div key={item.term} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: 10 }}>
              <div style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{item.term}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>{item.definition}</div>
            </div>
          ))}
        </div>
      </SectionBlock>
    </article>
  )
}
