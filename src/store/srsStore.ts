import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { srsApi } from '../lib/api'
import type { GeneratedSRS } from '../types/index.ts'

interface SRSState {
  documents: Record<string, GeneratedSRS>
  activeDocId: string | null
  activeDoc: GeneratedSRS | null
  isLoading: boolean

  setDocument: (repoFullName: string, doc: GeneratedSRS) => void
  setActiveDoc: (id: string) => void
  getDoc: (repoFullName: string) => GeneratedSRS | null
  clearAll: () => void
  
  loadFromSupabase: () => Promise<void>
  deleteDocument: (id: string) => Promise<void>
}

export const useSRSStore = create<SRSState>()(
  devtools(
    (set, get) => ({
      documents: {},
      activeDocId: null,
      activeDoc: null,
      isLoading: false,

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

      loadFromSupabase: async () => {
        set({ isLoading: true })
        try {
          const { data } = await srsApi.list()
          const docs: Record<string, GeneratedSRS> = {}
          if (data) {
            data.forEach((item: { content: GeneratedSRS }) => {
              const doc = item.content
              docs[doc.repoName] = doc
            })
          }
          set({ documents: docs, isLoading: false })
        } catch (e) {
          console.error('Failed to load SRS docs from Supabase:', e)
          set({ isLoading: false })
        }
      },

      deleteDocument: async (id: string) => {
        try {
          await srsApi.delete(id)
          set(state => {
            const nextDocs = { ...state.documents }
            const repoKey = Object.keys(nextDocs).find(k => nextDocs[k].id === id)
            if (repoKey) delete nextDocs[repoKey]
            return {
              documents: nextDocs,
              activeDocId: state.activeDocId === id ? null : state.activeDocId,
              activeDoc: state.activeDocId === id ? null : state.activeDoc
            }
          })
        } catch (e) {
          console.error('Failed to delete SRS doc:', e)
        }
      }
    }),
  ),
)
