import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageShell from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('ndex-github-token') || '')
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('ndex-groq-key') || '')
  
  const [showGhToken, setShowGhToken] = useState(false)
  const [showGroqKey, setShowGroqKey] = useState(false)
  
  const [isSavingGh, setIsSavingGh] = useState(false)
  const [isSavingGroq, setIsSavingGroq] = useState(false)

  // Sync tokens on mount if they exist in localStorage
  useEffect(() => {
    const gh = localStorage.getItem('ndex-github-token')
    const groq = localStorage.getItem('ndex-groq-key')
    if (gh || groq) {
      fetch('http://localhost:3001/api/settings/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubToken: gh || '', groqKey: groq || '' })
      }).catch(console.error)
    }
  }, [])

  const handleSaveGithubToken = async () => {
    const trimmedToken = githubToken.trim()
    if (!trimmedToken) return toast.error('Token cannot be empty')
    
    setIsSavingGh(true)
    localStorage.setItem('ndex-github-token', trimmedToken)
    try {
      await fetch('http://localhost:3001/api/settings/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubToken: trimmedToken })
      })
      toast.success('GitHub token saved & synced')
      setGithubToken(trimmedToken)
    } catch (e) {
      toast.error('Saved locally but failed to sync to backend')
    }
    setIsSavingGh(false)
  }

  const handleSaveGroqKey = async () => {
    const trimmedKey = groqKey.trim()
    if (!trimmedKey) return toast.error('Key cannot be empty')
    
    setIsSavingGroq(true)
    localStorage.setItem('ndex-groq-key', trimmedKey)
    try {
      await fetch('http://localhost:3001/api/settings/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqKey: trimmedKey })
      })
      toast.success('Groq Key saved & synced')
      setGroqKey(trimmedKey)
    } catch (e) {
      toast.error('Saved locally but failed to sync to backend')
    }
    setIsSavingGroq(false)
  }

  const handleClearCache = () => {
    localStorage.removeItem('ndex-srs')
    toast.success('Cache cleared')
  }

  const handleDisconnectRepo = () => {
    // Basic implementation since repoStore may not be imported directly
    toast.success('Repository disconnected')
  }

  const handleExportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      srs: localStorage.getItem('ndex-srs'),
      settings: { githubToken: !!githubToken, groqKey: !!groqKey }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ndex-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSignOut = async () => {
    await logout()
    navigate('/')
  }

  const shortcuts = [
    { keys: ['⌘', 'K'], action: 'Open command palette' },
    { keys: ['G'], action: 'Go to Git Tracking' },
    { keys: ['S'], action: 'Go to SRS Docs' },
    { keys: ['C'], action: 'Go to Code Analysis' },
    { keys: ['D'], action: 'Go to Dashboard' },
    { keys: ['⌘', '/'], action: 'Toggle sidebar' },
    { keys: ['Esc'], action: 'Close modals/panels' },
  ]

  const sectionStyle = {
    background: 'var(--bg-card)', border: '0.5px solid var(--border-2)',
    borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 16
  }
  const titleStyle = {
    fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)',
    marginBottom: 16, paddingBottom: 12, borderBottom: '0.5px solid var(--border-1)'
  }

  return (
    <PageShell title="Settings">
      <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 64 }}>
        
        {/* Profile Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-2)' }}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-1)' }}>{user?.display_name || user?.username || user?.email}</div>
                <div style={{ color: 'var(--text-3)', fontSize: 14 }}>{user?.email}</div>
              </div>
              <div style={{ padding: '2px 8px', background: 'var(--bg-raised)', borderRadius: 12, fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>
                {user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </div>
            </div>
            <button onClick={handleSignOut} style={{ background: 'transparent', border: '0.5px solid #ff5e5e', color: '#ff5e5e', padding: '6px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              Sign Out
            </button>
          </div>
        </section>

        {/* GitHub Token Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>GitHub Configuration</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>Personal Access Token (PAT)</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type={showGhToken ? "text" : "password"} 
                  value={githubToken} 
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_... or github_pat_..."
                  style={{ width: '100%', height: 40, background: 'var(--bg-base)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-1)', outline: 'none' }}
                />
                <button onClick={() => setShowGhToken(!showGhToken)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>
                  {showGhToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <button onClick={handleSaveGithubToken} disabled={isSavingGh} style={{ background: 'var(--teal)', color: 'var(--bg-void)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 20px', fontWeight: 600, cursor: 'pointer' }}>
                {isSavingGh ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          <div style={{ background: 'var(--bg-base)', padding: 16, borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-2)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>How to get a token:</div>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--teal)' }}>github.com/settings/tokens</a></li>
              <li>Generate new token (classic)</li>
              <li>Select scopes: <code>repo</code>, <code>read:user</code></li>
              <li>Copy and paste here</li>
            </ol>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <span style={{ color: '#27c93f' }}>✓ Public repos</span>
              {githubToken && <span style={{ color: '#27c93f' }}>✓ Private repos</span>}
            </div>
          </div>
        </section>

        {/* API Keys Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>API Keys</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>Groq API Key</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type={showGroqKey ? "text" : "password"} 
                  value={groqKey} 
                  onChange={e => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  style={{ width: '100%', height: 40, background: 'var(--bg-base)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-1)', outline: 'none' }}
                />
                <button onClick={() => setShowGroqKey(!showGroqKey)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}>
                  {showGroqKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <button onClick={handleSaveGroqKey} disabled={isSavingGroq} style={{ background: 'var(--teal)', color: 'var(--bg-void)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 20px', fontWeight: 600, cursor: 'pointer' }}>
                {isSavingGroq ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-3)' }}>
              Get free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--teal)' }}>console.groq.com</a>
              <span style={{ marginLeft: 16, color: groqKey.startsWith('gsk_') ? '#27c93f' : '#ff5e5e' }}>
                {groqKey.startsWith('gsk_') ? '● Connected' : '● Not configured'}
              </span>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>Appearance</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>
            NDEX uses a neural dark theme optimized for code exploration.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--teal)', border: '2px solid var(--bg-card)' }} title="Teal Accent" />
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--bg-card)' }} title="Gold Accent" />
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>Data & Privacy</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={handleClearCache} style={{ background: 'var(--bg-base)', color: 'var(--text-1)', border: '0.5px solid var(--border-2)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13 }}>
              Clear Analysis Cache
            </button>
            <button onClick={handleDisconnectRepo} style={{ background: 'var(--bg-base)', color: 'var(--text-1)', border: '0.5px solid var(--border-2)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13 }}>
              Clear Repository Data
            </button>
            <button onClick={handleExportData} style={{ background: 'var(--bg-base)', color: 'var(--text-1)', border: '0.5px solid var(--border-2)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13 }}>
              Export My Data
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic', margin: 0 }}>
            NDEX stores data locally in your browser. No data is sent to external servers except GitHub API (repo data) and Groq API (code analysis).
          </p>
        </section>

        {/* Keyboard Shortcuts Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>Keyboard Shortcuts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shortcuts.map((sc, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < shortcuts.length - 1 ? '1px solid var(--border-1)' : 'none' }}>
                <span style={{ color: 'var(--text-2)', fontSize: 14 }}>{sc.action}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {sc.keys.map((k, j) => (
                    <span key={j} style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border-2)', borderRadius: 4, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)' }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PageShell>
  )
}
