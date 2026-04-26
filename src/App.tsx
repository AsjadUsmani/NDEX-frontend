import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/auth/GuestRoute'
import CommandPalette from './components/ui/CommandPalette'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'

// Pages
import HomePage from './pages/HomePage'
import AuthCallback from './pages/AuthCallback'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GitTracking from './pages/GitTracking'
import SRSPage from './pages/SRSPage'
import CodeAnalysis from './pages/CodeAnalysis'
import DiffPage from './pages/DiffPage'
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

// Keyboard shortcuts handler component
function KeyboardShortcuts() {
  const { openModal, closeModal } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openModal('commandPalette')
        return
      }
      
      // Don't trigger shortcuts if in input/textarea
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        return
      }

      // G → Git Tracking
      if (e.key.toLowerCase() === 'g' && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
        e.preventDefault()
        window.location.href = '/git'
      }
      // S → SRS Docs
      else if (e.key.toLowerCase() === 's' && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
        e.preventDefault()
        window.location.href = '/srs'
      }
      // C → Code Analysis
      else if (e.key.toLowerCase() === 'c' && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
        e.preventDefault()
        window.location.href = '/code'
      }
      // D → Dashboard
      else if (e.key.toLowerCase() === 'd' && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
        e.preventDefault()
        window.location.href = '/dashboard'
      }
      // Cmd+/ → Toggle sidebar
      else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        useUIStore.getState().toggleSidebar()
      }
      // Esc → Close modals/panels
      else if (e.key === 'Escape') {
        e.preventDefault()
        closeModal()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openModal, closeModal])

  return null
}

export default function App() {
  const { activeModal, closeModal, theme, hasHydrated: uiHydrated } = useUIStore()
  const { isAuthenticated, hasHydrated: authHydrated, checkSession } = useAuthStore()

  useEffect(() => {
    if (uiHydrated) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, uiHydrated])

  useEffect(() => {
    if (authHydrated && isAuthenticated) {
      checkSession()
    }
  }, [authHydrated, isAuthenticated, checkSession])

  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <AnimatePresence>
        {activeModal === 'commandPalette' && (
          <CommandPalette onClose={closeModal} />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/" element={
          <GuestRoute>
            <HomePage />
          </GuestRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/git"      element={<ProtectedRoute><AppShell><GitTracking /></AppShell></ProtectedRoute>} />
        <Route path="/srs"      element={<ProtectedRoute><AppShell><SRSPage /></AppShell></ProtectedRoute>} />
        <Route path="/code"     element={<ProtectedRoute><AppShell><CodeAnalysis /></AppShell></ProtectedRoute>} />
        <Route path="/diff"     element={<ProtectedRoute><AppShell><DiffPage /></AppShell></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#101928',
            color: '#e8f4f3',
            border: '0.5px solid rgba(0,161,155,0.3)',
            fontFamily: 'Geist, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00a19b', secondary: '#101928' } },
          error:   { iconTheme: { primary: '#ff5e5e', secondary: '#101928' } },
        }}
      />
    </BrowserRouter>
  )
}
