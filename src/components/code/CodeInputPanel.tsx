import { useRef, useState } from 'react'
import { Download, Copy, ChevronDown, Code2, Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import type { AnalysisOutput, DiagramType, GeneratedDiagram } from '../../types/index.ts'

const API_BASE = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ?? 'http://localhost:3001'

const LANGUAGES = ['Auto Detect','TypeScript','JavaScript','Python','Java','C++','C#','Go','Rust','PHP','Ruby','Swift','SQL','Other']

const DIAGRAM_META: { id: DiagramType; label: string; color: string }[] = [
  { id: 'uml-class',    label: 'Class',     color: '#00a19b' },
  { id: 'uml-sequence', label: 'Sequence',  color: '#e4dd3d' },
  { id: 'dependency',   label: 'Deps',      color: '#00d4cc' },
  { id: 'flowchart',    label: 'Flowchart', color: '#b8b230' },
  { id: 'component',    label: 'Component', color: '#4d7c79' },
]

// Suppress Mermaid's default auto-scan on load (must run before any render)
let mermaidInited = false
void import('mermaid').then(mod => {
  mod.default.initialize({ startOnLoad: false })
  mermaidInited = true
})


async function renderMermaid(diagrams: GeneratedDiagram[]): Promise<Record<string, string>> {
  const mod = await import('mermaid')
  const mermaid = mod.default
  if (!mermaidInited) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        background: '#05080f',
        primaryColor: '#00a19b',
        primaryTextColor: '#e8f4f3',
        primaryBorderColor: '#00a19b33',
        lineColor: '#4d7c79',
        secondaryColor: '#0c1420',
        tertiaryColor: '#101928',
        fontSize: '13px',
      },
    })
    mermaidInited = true
  }
  const svgs: Record<string, string> = {}
  for (const d of diagrams) {
    try {
      const { svg } = await mermaid.render(`ndex-${d.type}-${Date.now()}`, d.mermaidCode)
      svgs[d.type] = svg
    } catch {
      svgs[d.type] = `<div style="color:#ff5e5e;font-family:monospace;padding:12px;font-size:12px">⚠ Render failed for ${d.title}</div>`
    }
  }
  return svgs
}

function downloadSVG(svg: string, title: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${title}.svg` })
  a.click(); URL.revokeObjectURL(a.href)
}

function downloadPNG(svg: string, title: string) {
  const img = new Image()
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || 1200; canvas.height = img.naturalHeight || 800
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    Object.assign(document.createElement('a'), { href: canvas.toDataURL('image/png'), download: `${title}.png` }).click()
    URL.revokeObjectURL(url)
  }
  img.src = url
}

function severityColor(s: string) {
  return s === 'critical' ? '#ff5e5e' : s === 'high' ? '#f97316' : s === 'medium' ? '#e4dd3d' : '#4d7c79'
}

export default function CodeInputPanel() {
  const [code, setCode]         = useState('')
  const [lang, setLang]         = useState('Auto Detect')
  const [loading, setLoading]   = useState(false)
  const [output, setOutput]     = useState<AnalysisOutput | null>(null)
  const [svgs, setSvgs]         = useState<Record<string, string>>({})
  const [active, setActive]     = useState<DiagramType>('uml-class')
  const [err, setErr]           = useState('')
  const textareaRef             = useRef<HTMLTextAreaElement>(null)

  const analyze = async () => {
    if (!code.trim()) return
    setLoading(true); setErr(''); setOutput(null); setSvgs({})
    try {
      const res = await fetch(`${API_BASE}/api/code/analyze-input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: lang }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as { error?: string }).error ?? res.statusText) }
      const data = await res.json() as AnalysisOutput
      setOutput(data)
      if (data.diagrams.length) {
        setActive(data.diagrams[0].type)
        renderMermaid(data.diagrams).then(setSvgs)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const currentDiagram = output?.diagrams.find(d => d.type === active)
  const lines = code.split('\n').length
  const tokens = Math.ceil(code.length / 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Input card ─────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,161,155,0.07)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,var(--bg-raised),var(--bg-card))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-faint)', border: '1px solid var(--border-2)', display: 'grid', placeItems: 'center' }}>
              <Code2 size={15} color="var(--teal)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>Paste Code Analyzer</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Paste any code → AI analysis + UML diagrams</div>
            </div>
          </div>
          {/* Language selector */}
          <div style={{ position: 'relative' }}>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ appearance: 'none', background: 'var(--bg-raised)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 32px 6px 12px', cursor: 'pointer', outline: 'none' }}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={12} color="var(--text-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={`// Paste any code here — TypeScript, Python, Java, Go, SQL...
//
// NDEX will generate:
//   ✦ UML Class Diagram      ✦ Sequence Diagram
//   ✦ Dependency Map         ✦ Logic Flowchart
//   ✦ Component Diagram
//
// All diagrams are downloadable as SVG or PNG`}
          style={{ width: '100%', minHeight: 260, background: 'var(--bg-void)', border: 'none', color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.75, padding: '20px 24px', resize: 'vertical', outline: 'none', tabSize: 2 }}
          spellCheck={false}
        />

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{lines} lines</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{code.length.toLocaleString()} chars</span>
            {code.length > 0 && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--teal)', background: 'var(--teal-faint)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border-2)' }}>~{tokens} tokens</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {code.length > 0 && (
              <button onClick={() => { setCode(''); setOutput(null); setSvgs({}) }} style={{ height: 36, padding: '0 16px', background: 'transparent', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>Clear</button>
            )}
            <button
              onClick={analyze}
              disabled={loading || !code.trim()}
              style={{ height: 36, padding: '0 20px', background: loading ? 'var(--teal-dim)' : 'linear-gradient(135deg,var(--teal),#00c8c2)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--bg-void)', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: !code.trim() ? 0.5 : 1, transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,161,155,0.3)' }}
            >
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={14} /> Analyze Code</>}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(255,94,94,0.08)', border: '1px solid rgba(255,94,94,0.3)', borderRadius: 'var(--radius-md)', color: '#ff9b9b', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          <AlertTriangle size={15} color="#ff5e5e" /> {err}
        </div>
      )}

      {/* ── Output ─────────────────────────────────────────── */}
      {output && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Summary + metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '18px 22px', backgroundImage: 'linear-gradient(135deg,transparent,rgba(228,221,61,0.02))' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={11} /> AI Summary
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.75, margin: '0 0 10px' }}>{output.summary}</p>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                Detected: <span style={{ color: 'var(--teal)' }}>{output.language}</span>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, minWidth: 220 }}>
              {[
                { label: 'Complexity',      value: output.metrics.complexity,      hi: output.metrics.complexity > 15 },
                { label: 'Maintainability', value: output.metrics.maintainability, hi: false },
                { label: 'Lines',           value: output.metrics.linesOfCode,     hi: false },
                { label: 'Functions',       value: output.metrics.functionCount,   hi: false },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: m.hi ? '#ff5e5e' : 'var(--teal)', lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontFamily: 'var(--font-mono)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram viewer */}
          {output.diagrams.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)', overflowX: 'auto' }}>
                {DIAGRAM_META.map(dt => {
                  const has = output.diagrams.some(d => d.type === dt.id)
                  const isActive = active === dt.id
                  return (
                    <button key={dt.id} onClick={() => has && setActive(dt.id)} disabled={!has}
                      style={{ padding: '11px 18px', background: 'transparent', border: 'none', borderBottom: isActive ? `2px solid ${dt.color}` : '2px solid transparent', color: isActive ? dt.color : has ? 'var(--text-2)' : 'var(--text-4)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: isActive ? 700 : 400, cursor: has ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', opacity: has ? 1 : 0.35, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {dt.label}
                      {has && <span style={{ width: 5, height: 5, borderRadius: '50%', background: dt.color, display: 'inline-block' }} />}
                    </button>
                  )
                })}
              </div>

              {currentDiagram && (
                <>
                  {/* Toolbar */}
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{currentDiagram.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 10 }}>{currentDiagram.description}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigator.clipboard.writeText(currentDiagram.mermaidCode)} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', background: 'var(--bg-raised)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-2)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                        <Copy size={11} /> Source
                      </button>
                      {svgs[currentDiagram.type] && <>
                        <button onClick={() => downloadSVG(svgs[currentDiagram.type], currentDiagram.title)} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', background: 'var(--bg-raised)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-2)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          <Download size={11} /> SVG
                        </button>
                        <button onClick={() => downloadPNG(svgs[currentDiagram.type], currentDiagram.title)} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 14px', background: 'var(--teal)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--bg-void)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          <Download size={11} /> PNG
                        </button>
                      </>}
                    </div>
                  </div>

                  {/* Diagram canvas */}
                  <div style={{ padding: 28, minHeight: 320, overflow: 'auto', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {svgs[currentDiagram.type]
                      ? <div dangerouslySetInnerHTML={{ __html: svgs[currentDiagram.type] }} style={{ maxWidth: '100%' }} />
                      : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} color="var(--teal)" />
                          Rendering {currentDiagram.title}...
                        </div>
                    }
                  </div>

                  {/* Collapsible source */}
                  <details style={{ borderTop: '1px solid var(--border-1)' }}>
                    <summary style={{ padding: '9px 16px', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', cursor: 'pointer', userSelect: 'none', background: 'var(--bg-surface)', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ChevronDown size={11} /> View Mermaid source
                    </summary>
                    <pre style={{ margin: 0, padding: '14px 20px', background: 'var(--bg-void)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.65, overflow: 'auto', maxHeight: 180 }}>
                      {currentDiagram.mermaidCode}
                    </pre>
                  </details>
                </>
              )}
            </div>
          )}

          {/* Issues + Suggestions */}
          {(output.issues.length > 0 || output.suggestions.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border-1)', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                  Issues <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginLeft: 6 }}>({output.issues.length})</span>
                </div>
                <div style={{ padding: '6px 0', maxHeight: 280, overflowY: 'auto' }}>
                  {output.issues.map((issue, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 16px', borderBottom: i < output.issues.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', background: `${severityColor(issue.severity)}20`, color: severityColor(issue.severity), border: `1px solid ${severityColor(issue.severity)}50`, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 1 }}>{issue.severity}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border-1)', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                  Suggestions <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginLeft: 6 }}>({output.suggestions.length})</span>
                </div>
                <div style={{ padding: '6px 0', maxHeight: 280, overflowY: 'auto' }}>
                  {output.suggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 16px', borderBottom: i < output.suggestions.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
                      <span style={{ color: 'var(--gold)', fontSize: 14, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>✦</span>
                      <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
