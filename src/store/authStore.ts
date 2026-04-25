import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (v: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),
      setSession: (session) =>
        set({ session, user: session?.user ?? null,
              isAuthenticated: !!session }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({ user: null, session: null, isAuthenticated: false }),
    }),
    { name: 'ndex-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)
