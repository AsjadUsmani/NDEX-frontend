import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { BranchData, CommitData, ContributorData, FileNode, IssueData, IssueStats, PRData, PRStats, RepoMetadata } from '../types/index.ts'

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

  if (!trimmed) {
    return { owner: '', repoName: '', repoUrl: '' }
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed)
      const [owner = '', repoName = ''] = url.pathname.split('/').filter(Boolean)
      return {
        owner,
        repoName,
        repoUrl: `${url.origin}/${owner}/${repoName}`,
      }
    } catch {
      return { owner: '', repoName: '', repoUrl: trimmed }
    }
  }

  const [owner = '', repoName = ''] = trimmed.split('/')
  return {
    owner,
    repoName,
    repoUrl: owner && repoName ? `https://github.com/${owner}/${repoName}` : trimmed,
  }
}

export const useRepoStore = create<RepoState>()(
  devtools(
    persist(
      (set) => ({
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
        setMetadata: (data: RepoMetadata) =>
          set({ metadata: data, lastFetched: new Date(), error: null, isConnected: true }),
        setCommits: (commits: CommitData[]) => set({ commits }),
        setBranches: (branches: BranchData[]) => set({ branches }),
        setContributors: (contributors: ContributorData[]) => set({ contributors }),
        setFileTree: (tree: FileNode[]) => set({ fileTree: tree }),
        setLanguages: (langs: Record<string, number>) => set({ languages: langs }),
        setPRs: (prs: PRData[], stats: PRStats) => set({ prs, prStats: stats }),
        setIssues: (issues: IssueData[], stats: IssueStats) => set({ issues, issueStats: stats }),
        setError: (error: string | null) => set({ error }),
        reset: () => set({ ...initialState }),
      }),
      {
        name: 'ndex-repo',
      },
    ),
  ),
)
