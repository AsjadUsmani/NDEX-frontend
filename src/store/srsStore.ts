import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { GeneratedSRS } from '../types/index.ts'

interface SRSState {
  documents: Record<string, GeneratedSRS>
  activeDocId: string | null
  activeDoc: GeneratedSRS | null

  setDocument: (repoFullName: string, doc: GeneratedSRS) => void
  setActiveDoc: (id: string) => void
  getDoc: (repoFullName: string) => GeneratedSRS | null
  clearAll: () => void
}

export const useSRSStore = create<SRSState>()(
  devtools(
    persist(
      (set, get) => ({
        documents: {},
        activeDocId: null,
        activeDoc: null,

        setDocument: (repoFullName: string, doc: GeneratedSRS) =>
          set(state => ({
            documents: { ...state.documents, [repoFullName]: doc },
            activeDocId: doc.id,
            activeDoc: doc,
          })),

        setActiveDoc: (id: string) =>
          set(state => {
            const doc = Object.values(state.documents).find(item => item.id === id) || null
            return {
              activeDocId: id,
              activeDoc: doc,
            }
          }),

        getDoc: (repoFullName: string) => get().documents[repoFullName] || null,

        clearAll: () =>
          set({
            documents: {},
            activeDocId: null,
            activeDoc: null,
          }),
      }),
      { name: 'ndex-srs' },
    ),
  ),
)
