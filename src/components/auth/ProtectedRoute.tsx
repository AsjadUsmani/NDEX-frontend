import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Loader2 } from 'lucide-react'

interface Props { children: React.ReactNode }

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, hasHydrated } = useAuthStore()

  if (!hasHydrated) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-base)'
      }}>
        <Loader2 size={32} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
