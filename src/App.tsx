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

export default function App() {
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

  const { isAuthenticated, hasHydrated, checkSession } = useAuthStore()

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      checkSession()
    }
  }, [hasHydrated, isAuthenticated, checkSession])

  return (
    <BrowserRouter>
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
