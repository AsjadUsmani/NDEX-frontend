import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useUIStore } from './store/uiStore'
import AuthGuard from './components/auth/AuthGuard'
import CommandPalette from './components/ui/CommandPalette'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Pages
import HomePage from './pages/HomePage'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import GitTracking from './pages/GitTracking'
import SRSPage from './pages/SRSPage'
import CodeAnalysis from './pages/CodeAnalysis'
import Settings from './pages/Settings'
import './styles/globals.css'

// App shell for authenticated pages
function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore()
  const sidebarWidth = sidebarCollapsed ? 64 : 240

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginLeft: sidebarWidth,
        }}
      >
        <TopBar />
        <div style={{ flex: 1, overflow: 'hidden', marginTop: 56 }}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const { activeModal, openModal, closeModal } = useUIStore()

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openModal('commandPalette')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openModal])

  return (
    <BrowserRouter>
      <AnimatePresence>
        {activeModal === 'commandPalette' && (
          <CommandPalette onClose={closeModal} />
        )}
      </AnimatePresence>

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <HomePage />
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes — all inside AppShell */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <AppShell><Dashboard /></AppShell>
          </AuthGuard>
        }/>
        <Route path="/git" element={
          <AuthGuard>
            <AppShell><GitTracking /></AppShell>
          </AuthGuard>
        }/>
        <Route path="/srs" element={
          <AuthGuard>
            <AppShell><SRSPage /></AppShell>
          </AuthGuard>
        }/>
        <Route path="/code" element={
          <AuthGuard>
            <AppShell><CodeAnalysis /></AppShell>
          </AuthGuard>
        }/>
        <Route path="/settings" element={
          <AuthGuard>
            <AppShell><Settings /></AppShell>
          </AuthGuard>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#101928',
            color: '#e8f4f3',
            border: '1px solid rgba(0,161,155,0.3)',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00a19b', secondary: '#101928' } },
          error:   { iconTheme: { primary: '#ff5e5e', secondary: '#101928' } },
        }}
      />
    </BrowserRouter>
  )
}
