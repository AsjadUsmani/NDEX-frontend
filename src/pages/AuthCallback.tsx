import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const oauthLogin = useAuthStore(s => s.oauthLogin)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase exchanges the URL hash/code into a real session
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          console.error('OAuth callback: no session', error)
          navigate('/', { replace: true })
          return
        }

        // Exchange Supabase access token for our backend JWT
        // This sets isAuthenticated: true in our store
        await oauthLogin(data.session.access_token)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        console.error('OAuth callback error:', err)
        navigate('/', { replace: true })
      }
    }

    handleCallback()
  }, [navigate, oauthLogin])

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
