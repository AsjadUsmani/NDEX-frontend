import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Github } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      // Error is handled by store
    }
  }

  const handleOAuth = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }} className="ndex-grid-bg">
      {/* Left Branding Panel (40%) */}
      <div style={{
        flex: '0 0 40%',
        background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border-2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 80px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--teal)', color: 'var(--gold)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800
          }}>
            Nx
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>
            NDEX
          </span>
        </div>
        <div style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 48 }}>
          Neural Design Explorer
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            'Connect any GitHub repository instantly',
            'Auto-generate IEEE SRS documentation',
            'Visualize git history with D3.js graphs'
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>
              <CheckCircle size={16} style={{ color: 'var(--teal)' }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel (60%) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                style={{
                  width: '100%', height: 38, background: 'var(--bg-base)',
                  border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-md)',
                  color: 'var(--text-1)', padding: '0 12px', fontSize: 13, outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--teal)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)' }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  style={{
                    width: '100%', height: 38, background: 'var(--bg-base)',
                    border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-1)', padding: '0 36px 0 12px', fontSize: 13, outline: 'none'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--teal)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', height: 38, background: 'var(--teal)', color: 'var(--bg-void)',
                border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                fontWeight: 500, fontSize: 13, cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 8, opacity: isLoading ? 0.8 : 1
              }}
            >
              {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: 16, background: 'rgba(240,80,80,0.08)', border: '0.5px solid var(--error)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <AlertCircle size={14} color="var(--error)" />
              <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-1)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-1)' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleOAuth('github')}
              style={{
                flex: 1, height: 38, background: 'var(--bg-base)', border: '0.5px solid var(--border-2)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-1)', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
              }}
            >
              <Github size={16} /> GitHub
            </button>
            <button
              onClick={() => handleOAuth('google')}
              style={{
                flex: 1, height: 38, background: 'var(--bg-base)', border: '0.5px solid var(--border-2)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-1)', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Don't have an account? </span>
            <Link to="/register" style={{ fontSize: 13, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
