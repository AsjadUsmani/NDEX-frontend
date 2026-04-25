import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  activeModal: string | null
  loadingStates: Record<string, boolean>

  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  setLoading: (key: string, value: boolean) => void
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
}

export const useUIStore = create<UIState>()(
  devtools((set, get) => ({
    sidebarCollapsed: false,
    activeModal: null,
    loadingStates: {},

    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
    openModal: (id: string) => set({ activeModal: id }),
    closeModal: () => set({ activeModal: null }),
    setLoading: (key: string, value: boolean) =>
      set(state => ({ loadingStates: { ...state.loadingStates, [key]: value } })),
    isLoading: (key: string) => Boolean(get().loadingStates[key]),
    isAnyLoading: () => Object.values(get().loadingStates).some(Boolean),
  })),
)
