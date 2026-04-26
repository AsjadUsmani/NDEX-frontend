import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

interface UserProfile {
  id: string; email: string; username: string; display_name: string | null;
  avatar_url: string | null; plan: 'free'|'pro'|'team'; github_username: string | null;
}

interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  error: string | null
  login:    (email: string, password: string) => Promise<void>
  oauthLogin: (accessToken: string) => Promise<void>
  register: (email: string, password: string, username: string, display_name?: string) => Promise<void>
  logout:   () => Promise<void>
  refresh:  () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null,
      isAuthenticated: false, isLoading: false, hasHydrated: false, error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/login', { email, password })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          set({ user: data.user, accessToken: data.accessToken,
                isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: string } } })
            ?.response?.data?.error || 'Login failed'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      oauthLogin: async (accessToken: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/oauth', { accessToken })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          set({ user: data.user, accessToken: data.accessToken,
                isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: string } } })
            ?.response?.data?.error || 'OAuth login failed'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      register: async (email, password, username, display_name) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/register',
            { email, password, username, display_name })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          set({ user: data.user, accessToken: data.accessToken,
                isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: string } } })
            ?.response?.data?.error || 'Registration failed'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try { await api.post('/api/auth/logout') } catch { /* ignore */ }
        delete api.defaults.headers.common['Authorization']
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      refresh: async () => {
        try {
          const { data } = await api.post('/api/auth/refresh')
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
          set({ accessToken: data.accessToken, isAuthenticated: true })
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false })
        }
      },

      checkSession: async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          set({ user: data.user, isAuthenticated: true })
        } catch (err: any) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            try {
              await useAuthStore.getState().refresh()
            } catch {
              set({ user: null, accessToken: null, isAuthenticated: false })
            }
          }
          // For other errors (500, network), keep the user logged in locally
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'ndex-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken,
                             isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true
      }
    }
  )
)
