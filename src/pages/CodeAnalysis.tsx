import { useEffect, useState } from 'react'
import { ArrowLeft, Code2, FolderOpen } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import PageShell from '../components/layout/PageShell'
import FileTreeBrowser from '../components/code/FileTreeBrowser'
import CodeInputPanel from '../components/code/CodeInputPanel'
import { useRepoStore } from '../store/repoStore'
import { codeApi } from '../lib/api'

type TopTab = 'paste' | 'browse'

function mapHighlightLanguage(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop() || ''
  if (ext === 'ts' || ext === 'tsx') return 'typescript'
  if (ext === 'js' || ext === 'jsx') return 'javascript'
  if (ext === 'py') return 'python'
  if (ext === 'go') return 'go'
  if (ext === 'rs') return 'rust'
  if (ext === 'css') return 'css'
  if (ext === 'json') return 'json'
  if (ext === 'md') return 'markdown'
  if (ext === 'html') return 'html'
  return 'text'
}

export default function CodeAnalysis() {
  const isConnected   = useRepoStore(state => state.isConnected)
  const owner         = useRepoStore(state => state.owner)
  const repoName      = useRepoStore(state => state.repoName)
  const defaultBranch = useRepoStore(state => state.metadata?.defaultBranch || 'main')
  const fileTree      = useRepoStore(state => state.fileTree)

  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [rawCode, setRawCode]           = useState('')
  const [rawLoading, setRawLoading]     = useState(false)
  const [topTab, setTopTab]             = useState<TopTab>('paste')

  // Fetch raw file content when a file is selected in Browse tab
  useEffect(() => {
    if (!selectedFile || !owner || !repoName) { setRawCode(''); return }
    const controller = new AbortController()
    setRawLoading(true)
    void codeApi
      .getFile(owner, repoName, selectedFile, defaultBranch)
      .then(response => {
        if (!controller.signal.aborted)
          setRawCode((response.data as { content?: string })?.content || '')
      })
      .catch(() => { if (!controller.signal.aborted) setRawCode('') })
      .finally(() => { if (!controller.signal.aborted) setRawLoading(false) })
    return () => controller.abort()
  }, [defaultBranch, owner, repoName, selectedFile])




  if (!isConnected) {
    return (
      <PageShell title="Code Analysis" subtitle="Connect a repository to inspect source code">
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
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Code Analysis"
      subtitle="Inspect code structure, issues, and refactor opportunities"
      noPadding
    >
      {/* ── Top-level navigation tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-1)', background: 'var(--bg-surface)', padding: '0 20px', gap: 2 }}>
        {([['paste', 'Paste Code', Code2], ['browse', 'Browse Repo', FolderOpen]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTopTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '12px 18px', background: 'transparent', border: 'none',
              borderBottom: topTab === id ? '2px solid var(--teal)' : '2px solid transparent',
              color: topTab === id ? 'var(--teal)' : 'var(--text-3)',
              fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: topTab === id ? 600 : 400,
              cursor: 'pointer', transition: 'color 0.15s',
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Paste Code tab ── */}
      {topTab === 'paste' && (
        <div style={{ padding: 20, overflowY: 'auto', height: 'calc(100vh - 190px)' }}>
          <CodeInputPanel />
        </div>
      )}

      {/* ── Browse Repo tab — read-only file viewer ── */}
      {topTab === 'browse' && (
        <div style={{ height: 'calc(100vh - 190px)', display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)' }}>

          <FileTreeBrowser
            files={fileTree}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            analyzedFiles={[]}
          />

          <section style={{ minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-void)' }}>
            {!selectedFile ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-3)' }}>
                <ArrowLeft size={20} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>Select a file to view its source</span>
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto' }}>
                {/* File header bar */}
                <div style={{ height: 38, background: 'var(--bg-raised)', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', position: 'sticky', top: 0, zIndex: 1 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{selectedFile}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4 }}>
                    {mapHighlightLanguage(selectedFile)}
                  </span>
                </div>

                <SyntaxHighlighter
                  language={mapHighlightLanguage(selectedFile)}
                  style={atomDark}
                  showLineNumbers
                  customStyle={{ background: '#05080f', margin: 0, minHeight: '100%', fontSize: 13 }}
                  lineNumberStyle={{ color: '#2a4a48', minWidth: 42 }}
                >
                  {rawLoading ? '// Loading...' : rawCode || '// File is empty or could not be loaded.'}
                </SyntaxHighlighter>
              </div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  )
}

