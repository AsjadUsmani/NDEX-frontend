import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase handles the token exchange from URL hash
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    })
  }, [navigate])

  // Show NeuralLoader while processing
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
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32,
        fontWeight: 800,
        background: 'linear-gradient(135deg, var(--teal), var(--gold))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        NDEX
      </div>
      <p style={{
        color: 'var(--text-3)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
      }}>
        Completing authentication...
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: 'var(--teal)',
            animation: 'neural-pulse 1s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
