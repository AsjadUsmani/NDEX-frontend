import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { preferencesApi } from '../lib/api'
import { useRepoStore } from './repoStore'
import { useSRSStore } from './srsStore'
import { useUIStore } from './uiStore'

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
  
  loadUserData: () => Promise<void>
}

// Utility to set token in cookie
function setAuthCookie(token: string) {
  const expires = new Date()
  expires.setTime(expires.getTime() + 15 * 60 * 1000) // 15 minutes
  document.cookie = `auth_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`
}

// Utility to clear auth cookie
function clearAuthCookie() {
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, accessToken: null,
      isAuthenticated: false, isLoading: false, hasHydrated: false, error: null,

      loadUserData: async () => {
        try {
          // Load other stores
          await useRepoStore.getState().loadFromSupabase()
          await useSRSStore.getState().loadFromSupabase()
          
          // Load preferences
          const { data: prefs } = await preferencesApi.get()
          if (prefs) {
            useUIStore.getState().setTheme(prefs.theme || 'dark')
          }
        } catch (e) {
          console.error('Failed to load user data:', e)
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/api/auth/login', { email, password })
          const token = data.accessToken
          setAuthCookie(token)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user: data.user, accessToken: token,
                isAuthenticated: true, isLoading: false })
          
          await get().loadUserData()
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
          const token = data.accessToken
          setAuthCookie(token)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user: data.user, accessToken: token,
                isAuthenticated: true, isLoading: false })
          
          await get().loadUserData()
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
          const token = data.accessToken
          setAuthCookie(token)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ user: data.user, accessToken: token,
                isAuthenticated: true, isLoading: false })
          
          await get().loadUserData()
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { error?: string } } })
            ?.response?.data?.error || 'Registration failed'
          set({ error: msg, isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try { 
          await api.post('/api/auth/logout')
        } catch (err) {
          console.error('Logout API call failed:', err)
        }
        // Always clear local state even if API call fails
        clearAuthCookie()
        delete api.defaults.headers.common['Authorization']
        set({ user: null, accessToken: null, isAuthenticated: false })
        
        // Reset other stores
        useRepoStore.getState().reset()
        useSRSStore.getState().clearAll()
      },

      refresh: async () => {
        try {
          const { data } = await api.post('/api/auth/refresh')
          const token = data.accessToken
          setAuthCookie(token)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ accessToken: token, isAuthenticated: true })
        } catch {
          // If refresh fails, logout the user
          get().logout()
        }
      },

      checkSession: async () => {
        try {
          const { data } = await api.get('/api/auth/me')
          set({ user: data.user, isAuthenticated: true })
          
          await get().loadUserData()
        } catch (err: unknown) {
          const axiosError = err as { response?: { status: number } }
          if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
            try {
              await get().refresh()
            } catch {
              await get().logout()
            }
          }
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
