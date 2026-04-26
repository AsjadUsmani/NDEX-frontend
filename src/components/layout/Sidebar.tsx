import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Code2, FileText, GitBranch, GitCompare, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/git', label: 'Git Tracking', icon: GitBranch },
  { to: '/diff', label: 'Diff Visualizer', icon: GitCompare },
  { to: '/srs', label: 'SRS Docs', icon: FileText },
  { to: '/code', label: 'Code Analysis', icon: Code2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed)
  const toggleSidebar = useUIStore(state => state.toggleSidebar)
  const navigate = useNavigate()

  const { user, logout } = useAuthStore()
  const width = sidebarCollapsed ? 64 : 240

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        width,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border-2)',
        overflow: 'hidden',
        zIndex: 20,
      }}
    >
      <div
        style={{
          height: 64,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '0.5px solid var(--border-1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'var(--teal)',
            color: 'var(--gold)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 800,
            flex: '0 0 auto',
          }}
        >
          Nx
        </div>
        <AnimatePresence initial={false} mode="wait">
          {!sidebarCollapsed ? (
            <motion.span
              key="ndex-wordmark"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              style={{
                marginLeft: 10,
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--gold)',
                whiteSpace: 'nowrap',
              }}
            >
              NDEX
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <nav style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div
                  onMouseEnter={event => {
                    if (!isActive) {
                      event.currentTarget.style.background = 'var(--bg-raised)'
                    }
                  }}
                  onMouseLeave={event => {
                    event.currentTarget.style.background = isActive ? 'rgba(0,161,155,0.12)' : 'transparent'
                  }}
                  style={{
                    height: 44,
                    margin: '0 8px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: sidebarCollapsed ? '0 0 0 20px' : '0 16px',
                    transition: 'all 0.15s ease',
                    background: isActive ? 'rgba(0,161,155,0.12)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--teal)' : '2px solid transparent',
                    color: isActive ? 'var(--teal)' : 'var(--text-2)',
                  }}
                >
                  <Icon size={18} />
                  <AnimatePresence initial={false}>
                    {!sidebarCollapsed ? (
                      <motion.span
                        key={item.label}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div
        style={{
          padding: sidebarCollapsed ? '12px 0 12px' : '12px 16px',
          borderTop: '0.5px solid var(--border-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: 12,
          overflow: 'hidden',
          minHeight: 64,
        }}
      >
        {user && (
          <>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-raised)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
            }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'var(--text-1)', fontSize: 12, fontWeight: 600 }}>{user.email?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.display_name || user.username || user.email}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </span>
              </motion.div>
            )}
            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, background: 'transparent', border: '0.5px solid var(--border-2)',
                borderRadius: 6, color: 'var(--text-3)', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ff5e5e'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff5e5e55'; (e.currentTarget as HTMLButtonElement).style.background = '#ff5e5e1a' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <LogOut size={13} />
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          height: 44,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderTop: '0.5px solid var(--border-1)',
          background: 'transparent',
          color: 'var(--text-3)',
          cursor: 'pointer',
          transition: 'color 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={event => {
          event.currentTarget.style.color = 'var(--teal)'
          event.currentTarget.style.background = 'var(--bg-raised)'
        }}
        onMouseLeave={event => {
          event.currentTarget.style.color = 'var(--text-3)'
          event.currentTarget.style.background = 'transparent'
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  )
}
