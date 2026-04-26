import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { reposApi } from '../lib/api'
import type { BranchData, CommitData, ContributorData, FileNode, IssueData, IssueStats, PRData, PRStats, RepoMetadata, SavedRepository } from '../types/index.ts'

interface RepoState {
  repoUrl: string
  owner: string
  repoName: string
  isConnected: boolean
  metadata: RepoMetadata | null
  commits: CommitData[]
  branches: BranchData[]
  contributors: ContributorData[]
  fileTree: FileNode[]
  languages: Record<string, number>
  prs: PRData[]
  prStats: PRStats | null
  issues: IssueData[]
  issueStats: IssueStats | null
  lastFetched: Date | null
  error: string | null

  setRepo: (url: string) => void
  setMetadata: (data: RepoMetadata) => void
  setCommits: (commits: CommitData[]) => void
  setBranches: (branches: BranchData[]) => void
  setContributors: (contributors: ContributorData[]) => void
  setFileTree: (tree: FileNode[]) => void
  setLanguages: (langs: Record<string, number>) => void
  setPRs: (prs: PRData[], stats: PRStats) => void
  setIssues: (issues: IssueData[], stats: IssueStats) => void
  setError: (error: string | null) => void
  reset: () => void
  
  saveToSupabase: () => Promise<void>
  loadFromSupabase: () => Promise<void>
}

const initialState = {
  repoUrl: '',
  owner: '',
  repoName: '',
  isConnected: false,
  metadata: null,
  commits: [],
  branches: [],
  contributors: [],
  fileTree: [],
  languages: {},
  prs: [],
  prStats: null,
  issues: [],
  issueStats: null,
  lastFetched: null,
  error: null,
}

const parseRepoInput = (input: string): { owner: string; repoName: string; repoUrl: string } => {
  const trimmed = input.trim().replace(/\/+$/, '')
  if (!trimmed) return { owner: '', repoName: '', repoUrl: '' }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed)
      const [owner = '', repoName = ''] = url.pathname.split('/').filter(Boolean)
      return { owner, repoName, repoUrl: `${url.origin}/${owner}/${repoName}` }
    } catch {
      return { owner: '', repoName: '', repoUrl: trimmed }
    }
  }
  const [owner = '', repoName = ''] = trimmed.split('/')
  return { owner, repoName, repoUrl: owner && repoName ? `https://github.com/${owner}/${repoName}` : trimmed }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useRepoStore = create<RepoState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setRepo: (url: string) => {
        const parsed = parseRepoInput(url)
        set({
          repoUrl: parsed.repoUrl,
          owner: parsed.owner,
          repoName: parsed.repoName,
          isConnected: Boolean(parsed.owner && parsed.repoName),
          error: null,
        })
      },
      setMetadata: (data: RepoMetadata) => {
        set(state => ({
          metadata: data,
          lastFetched: new Date(),
          error: null,
          isConnected: true,
          owner: state.owner || data.owner,
          repoName: state.repoName || data.name,
          repoUrl: state.repoUrl || data.url,
        }))
        get().saveToSupabase()
      },
      setCommits: (commits: CommitData[]) => {
        set({ commits })
        get().saveToSupabase()
      },
      setBranches: (branches: BranchData[]) => {
        set({ branches })
        get().saveToSupabase()
      },
      setContributors: (contributors: ContributorData[]) => {
        set({ contributors })
        get().saveToSupabase()
      },
      setFileTree: (tree: FileNode[]) => {
        set({ fileTree: tree })
        get().saveToSupabase()
      },
      setLanguages: (langs: Record<string, number>) => {
        set({ languages: langs })
        get().saveToSupabase()
      },
      setPRs: (prs: PRData[], stats: PRStats) => set({ prs, prStats: stats }),
      setIssues: (issues: IssueData[], stats: IssueStats) => set({ issues, issueStats: stats }),
      setError: (error: string | null) => set({ error }),
      reset: () => set({ ...initialState }),

      saveToSupabase: async () => {
        if (saveTimer) clearTimeout(saveTimer)
        
        saveTimer = setTimeout(async () => {
          try {
            const {
              isConnected,
              repoUrl,
              owner,
              repoName,
              metadata,
              fileTree,
              commits,
              branches,
              contributors,
              languages,
            } = get()
            const parsed = parseRepoInput(repoUrl || `${owner}/${repoName}`)
            const resolvedOwner = owner || parsed.owner || metadata?.owner || ''
            const resolvedRepoName = repoName || parsed.repoName || metadata?.name || ''
            const resolvedRepoUrl = repoUrl || parsed.repoUrl || metadata?.url || ''

            if (!isConnected || !resolvedOwner || !resolvedRepoName || !resolvedRepoUrl) {
              return
            }

            await reposApi.save({
              github_url: resolvedRepoUrl,
              owner: resolvedOwner,
              repo_name: resolvedRepoName,
              description: metadata?.description || '',
              stars: metadata?.stars || 0,
              forks: metadata?.forks || 0,
              language: metadata?.language || '',
              is_private: metadata?.isPrivate || false,
              file_tree: fileTree,
              commits,
              branches,
              contributors,
              languages_data: languages
            })
          } catch (e) {
            console.error('Failed to save repo to Supabase:', e)
          }
        }, 1000)
      },

      loadFromSupabase: async () => {
        try {
          const current = get()
          if (current.isConnected && current.owner && current.repoName && current.metadata) {
            return
          }

          const { data } = await reposApi.list()
          if (data && data.length > 0) {
            const last = data[0] as SavedRepository
            const parsed = parseRepoInput(last.github_url || `${last.owner}/${last.repo_name}`)
            const resolvedOwner = last.owner || parsed.owner
            const resolvedRepoName = last.repo_name || parsed.repoName
            const resolvedRepoUrl = parsed.repoUrl || last.github_url

            if (!resolvedOwner || !resolvedRepoName || !resolvedRepoUrl) {
              return
            }

            set({
              repoUrl: resolvedRepoUrl,
              owner: resolvedOwner,
              repoName: resolvedRepoName,
              isConnected: Boolean(resolvedOwner && resolvedRepoName),
              metadata: {
                name: resolvedRepoName,
                owner: resolvedOwner,
                description: last.description,
                stars: last.stars,
                forks: last.forks,
                language: last.language,
                isPrivate: last.is_private,
                defaultBranch: 'main',
                url: resolvedRepoUrl,
                createdAt: last.created_at,
                updatedAt: last.last_analyzed || last.created_at,
                openIssues: 0,
                size: 0,
                topics: [],
                license: null
              },
              fileTree: last.file_tree || [],
              commits: last.commits || [],
              branches: last.branches || [],
              contributors: last.contributors || [],
              languages: last.languages_data || {}
            })
          }
        } catch (e) {
          console.error('Failed to load repo from Supabase:', e)
        }
      }
    }),
  ),
)
