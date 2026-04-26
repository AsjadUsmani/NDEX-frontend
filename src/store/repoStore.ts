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
        set({ metadata: data, lastFetched: new Date(), error: null, isConnected: true })
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
        const { isConnected, repoUrl, owner, repoName, metadata, fileTree, commits, branches, contributors, languages } = get()
        if (!isConnected) return

        if (saveTimer) clearTimeout(saveTimer)
        
        saveTimer = setTimeout(async () => {
          try {
            await reposApi.save({
              github_url: repoUrl,
              owner,
              repo_name: repoName,
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
          const { data } = await reposApi.list()
          if (data && data.length > 0) {
            const last = data[0] as SavedRepository
            set({
              repoUrl: last.github_url,
              owner: last.owner,
              repoName: last.repo_name,
              isConnected: true,
              metadata: {
                name: last.repo_name,
                owner: last.owner,
                description: last.description,
                stars: last.stars,
                forks: last.forks,
                language: last.language,
                isPrivate: last.is_private,
                defaultBranch: 'main',
                url: last.github_url,
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
