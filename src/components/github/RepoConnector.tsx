import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Github, Loader2 } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore'

interface RepoConnectorProps {
  onConnect: (repoUrl: string) => Promise<void>
  loading: boolean
  error: string | null
  progress: number
  progressLabel: string
}

export default function RepoConnector({ onConnect, loading, error, progress, progressLabel }: RepoConnectorProps) {
  const { repoUrl, owner, repoName, isConnected, metadata, reset } = useRepoStore()
  const [input, setInput] = useState(repoUrl)
  const repoOwner = metadata?.owner || owner
  const repoLabel = metadata?.name || repoName

  useEffect(() => {
    setInput(repoUrl)
  }, [repoUrl])

  const handleConnect = async () => {
    await onConnect(input)
  }

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Github size={16} style={{ color: 'var(--teal)' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>
          Connect Repository
        </h2>
      </div>

      {isConnected && metadata ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-1)' }}>
              Connected to {repoOwner}/{repoLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--border-2)',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="github.com/owner/repo or owner/repo"
              spellCheck={false}
              style={{
                width: '100%',
                height: 38,
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border-2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-1)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                padding: '0 16px',
                outline: 'none',
              }}
              onFocus={event => {
                event.currentTarget.style.borderColor = 'var(--teal)'
                event.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,161,155,0.15)'
              }}
              onBlur={event => {
                event.currentTarget.style.borderColor = 'var(--border-2)'
                event.currentTarget.style.boxShadow = 'none'
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  void handleConnect()
                }
              }}
            />
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={loading}
              style={{
                height: 38,
                padding: '0 20px',
                marginLeft: 12,
                background: 'var(--teal)',
                color: 'var(--bg-void)',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.15s ease',
                opacity: loading ? 0.85 : 1,
              }}
              onMouseEnter={event => {
                if (!loading) {
                  event.currentTarget.style.background = 'var(--teal-dim)'
                }
              }}
              onMouseLeave={event => {
                event.currentTarget.style.background = 'var(--teal)'
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>

          {progress > 0 ? (
            <div style={{ marginTop: 18 }}>
              <div style={{ height: 2, width: '100%', background: 'var(--border-1)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--teal), var(--gold))',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                {progressLabel}
              </div>
            </div>
          ) : null}

          {error ? (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error)', fontSize: 13 }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
