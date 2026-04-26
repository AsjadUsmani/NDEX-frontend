import { Loader2, Github, GitBranch, Sun, Moon, Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useRepoStore } from '../../store/repoStore'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/git': 'Git Tracking',
  '/srs': 'SRS Documentation',
  '/code': 'Code Analysis',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const { repoUrl, owner, repoName, isConnected, metadata } = useRepoStore()
  const { sidebarCollapsed, theme, toggleTheme, toggleSidebar } = useUIStore()
  const isAnyLoading = useUIStore(state => state.isAnyLoading())
  const title = titleMap[location.pathname] ?? 'NDEX'
  const repoLabel = metadata
    ? `${metadata.owner || owner}/${metadata.name || repoName}`
    : isConnected
      ? `${owner}/${repoName}`
      : ''
  const sidebarWidth = sidebarCollapsed ? 64 : 240

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        width: `calc(100vw - ${sidebarWidth}px)`,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px 0 32px',
        background: 'var(--bg-surface)',
        borderBottom: '0.5px solid var(--border-2)',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: '0.5px solid var(--border-2)',
            background: 'var(--bg-raised)',
            color: 'var(--text-2)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={16} />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>
          {title}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {repoLabel ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'var(--bg-raised)',
              border: '0.5px solid var(--border-gold)',
              color: 'var(--gold)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            <GitBranch size={12} />
            <span>{repoLabel}</span>
          </div>
        ) : (
          <div style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            No repo connected
          </div>
        )}

        <a
          href={repoUrl || 'https://github.com'}
          target="_blank"
          rel="noreferrer"
          aria-label="Open connected repository on GitHub"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 999,
            color: 'var(--text-2)',
            textDecoration: 'none',
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={event => {
            event.currentTarget.style.color = 'var(--teal)'
            event.currentTarget.style.background = 'var(--bg-raised)'
          }}
          onMouseLeave={event => {
            event.currentTarget.style.color = 'var(--text-2)'
            event.currentTarget.style.background = 'transparent'
          }}
        >
          <Github size={18} />
        </a>

        <div
          aria-label={isAnyLoading ? 'Loading in progress' : 'Idle'}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}
        >
          {isAnyLoading ? <Loader2 size={18} style={{ color: 'var(--teal)' }} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)' }} />}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 999,
            background: 'var(--bg-raised)',
            border: '0.5px solid var(--border-2)',
            color: 'var(--text-2)',
            cursor: 'pointer',
            marginLeft: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--teal)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile Dropdown */}
        {user && (
          <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 8 }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', padding: 0
              }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600 }}>
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            {showDropdown && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: 'var(--bg-card)', border: '0.5px solid var(--border-2)',
                borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                minWidth: 160, zIndex: 100, display: 'flex', flexDirection: 'column', padding: '4px 0'
              }}>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/settings'); }}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-1)', padding: '8px 16px',
                    textAlign: 'left', cursor: 'pointer', fontSize: 13,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  Settings
                </button>
                <div style={{ height: 1, background: 'var(--border-1)', margin: '4px 0' }} />
                <button
                  onClick={async () => { setShowDropdown(false); await logout(); navigate('/'); }}
                  style={{
                    background: 'transparent', border: 'none', color: '#ff5e5e', padding: '8px 16px',
                    textAlign: 'left', cursor: 'pointer', fontSize: 13,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
