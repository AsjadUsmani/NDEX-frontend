import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface UIState {
  sidebarCollapsed: boolean
  activeModal: string | null
  loadingStates: Record<string, boolean>
  theme: Theme
  hasHydrated: boolean

  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  setLoading: (key: string, value: boolean) => void
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarCollapsed: false,
        activeModal: null,
        loadingStates: {},
        theme: 'dark',
        hasHydrated: false,

        toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
        openModal: (id: string) => set({ activeModal: id }),
        closeModal: () => set({ activeModal: null }),
        setLoading: (key: string, value: boolean) =>
          set(state => ({ loadingStates: { ...state.loadingStates, [key]: value } })),
        isLoading: (key: string) => Boolean(get().loadingStates[key]),
        isAnyLoading: () => Object.values(get().loadingStates).some(Boolean),

        setTheme: (theme: Theme) => {
          applyTheme(theme)
          set({ theme })
        },

        toggleTheme: () => {
          const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
          applyTheme(next)
          set({ theme: next })
        },
      }),
      {
        name: 'ndex-ui-prefs',
        // Only persist theme (as requested — theme stays in localStorage)
        partialize: (s) => ({ theme: s.theme }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.hasHydrated = true
            if (state.theme) applyTheme(state.theme)
          }
        },
      }
    )
  )
)
