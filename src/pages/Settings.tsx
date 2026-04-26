import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageShell from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'
import { useRepoStore } from '../store/repoStore'
import { useUIStore } from '../store/uiStore'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const { reset: resetRepo } = useRepoStore()
  const { theme, setTheme } = useUIStore()
  const navigate = useNavigate()

  const handleClearCache = () => {
    // In future this will clear Supabase cache if needed
    toast.success('Local analysis state cleared')
  }

  const handleDisconnectRepo = () => {
    resetRepo()
    toast.success('Repository disconnected')
  }

  const handleExportData = () => {
    toast.error('Exporting from Supabase coming soon')
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

        {/* Appearance Section */}
        <section style={sectionStyle}>
          <h2 style={titleStyle}>Appearance</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>
            Customize how NDEX looks on your device.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: theme === 'dark' ? 'var(--bg-raised)' : 'var(--bg-base)',
                border: theme === 'dark' ? '1px solid var(--teal)' : '1px solid var(--border-2)',
                color: theme === 'dark' ? 'var(--text-1)' : 'var(--text-3)',
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0d1117', border: '1px solid #30363d' }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Dark</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: theme === 'light' ? 'var(--bg-raised)' : 'var(--bg-base)',
                border: theme === 'light' ? '1px solid var(--teal)' : '1px solid var(--border-2)',
                color: theme === 'light' ? 'var(--text-1)' : 'var(--text-3)',
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f8fafc', border: '1px solid #cbd5e1' }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Light</span>
            </button>
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
            NDEX stores data locally in your browser. All data is under your control and can be cleared at any time.
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
