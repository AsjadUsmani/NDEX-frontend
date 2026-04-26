import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, XCircle, Github } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()

  useEffect(() => { return () => clearError() }, [clearError])

  // Check password strength
  useEffect(() => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    setPasswordStrength(score)
  }, [password])

  // Debounce username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle')
      return
    }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking')
      try {
        const { data } = await api.get(`/api/auth/check-username?username=${username}`)
        setUsernameStatus(data.available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    if (passwordStrength < 2) return
    if (usernameStatus === 'taken') return

    try {
      await register(email, password, username, displayName)
      navigate('/dashboard')
    } catch {
      // Error handled by store
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

  const getStrengthColor = () => {
    if (passwordStrength === 1) return 'var(--error)'
    if (passwordStrength === 2) return '#f59e0b'
    if (passwordStrength === 3) return '#eab308'
    if (passwordStrength === 4) return 'var(--success)'
    return 'var(--border-2)'
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
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
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
        marginLeft: '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px'
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
            Create your account
          </h1>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              type="button"
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
              type="button"
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

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: 12 }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-1)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-1)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Display name (optional)</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
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
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 13 }}>@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => { setUsername(e.target.value); clearError(); }}
                  style={{
                    width: '100%', height: 38, background: 'var(--bg-base)',
                    border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-md)',
                    color: 'var(--text-1)', padding: '0 36px 0 28px', fontSize: 13, outline: 'none'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--teal)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                />
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  {usernameStatus === 'checking' && <Loader2 size={14} color="var(--text-3)" style={{ animation: 'spin 1s linear infinite' }} />}
                  {usernameStatus === 'available' && <CheckCircle size={14} color="var(--success)" />}
                  {usernameStatus === 'taken' && <XCircle size={14} color="var(--error)" />}
                </div>
              </div>
            </div>

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
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Password</label>
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
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[1, 2, 3, 4].map(level => (
                  <div key={level} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: password.length === 0 ? 'var(--border-2)' : level <= passwordStrength ? getStrengthColor() : 'var(--border-2)'
                  }} />
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearError(); }}
                style={{
                  width: '100%', height: 38, background: 'var(--bg-base)',
                  border: confirmPassword && password !== confirmPassword ? '0.5px solid var(--error)' : '0.5px solid var(--border-2)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-1)', padding: '0 12px', fontSize: 13, outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = confirmPassword && password !== confirmPassword ? 'var(--error)' : 'var(--teal)'}
                onBlur={e => e.currentTarget.style.borderColor = confirmPassword && password !== confirmPassword ? 'var(--error)' : 'var(--border-2)'}
              />
              {confirmPassword && password !== confirmPassword && (
                <div style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>Passwords do not match</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordStrength < 2 || password !== confirmPassword || usernameStatus === 'taken'}
              style={{
                width: '100%', height: 38, background: 'var(--teal)', color: 'var(--bg-void)',
                border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                fontWeight: 500, fontSize: 13, 
                cursor: isLoading || passwordStrength < 2 || password !== confirmPassword || usernameStatus === 'taken' ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 8, opacity: isLoading || passwordStrength < 2 || password !== confirmPassword || usernameStatus === 'taken' ? 0.5 : 1
              }}
            >
              {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {isLoading ? 'Creating account...' : 'Create account'}
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

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
