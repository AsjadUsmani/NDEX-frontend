import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show neural loading screen while checking auth
  if (isLoading) return <NeuralLoader />

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// Neural loading screen component (inline):
function NeuralLoader() {
  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      {/* Animated NDEX logo */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 48,
        fontWeight: 800,
        background: 'linear-gradient(135deg, var(--teal), var(--gold))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'neural-pulse 1.5s ease-in-out infinite',
      }}>
        Nx
      </div>
      {/* 3 pulsing dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--teal)',
            animation: `neural-pulse 1s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
