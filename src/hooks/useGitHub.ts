import { useState } from 'react'
import toast from 'react-hot-toast'
import { githubApi } from '../lib/api'
import { useRepoStore } from '../store/repoStore'
import { useUIStore } from '../store/uiStore'
import type { BranchData, CommitData, ContributorData, FileNode, RepoMetadata } from '../types/index.ts'

interface UseGitHubReturn {
  connect: (repoUrl: string) => Promise<void>
  fetchCommits: (page?: number) => Promise<void>
  loading: boolean
  error: string | null
  progress: number
  progressLabel: string
}

const parseRepoInput = (input: string): { owner: string; repo: string } => {
  const trimmed = input.trim().replace(/\/+$/, '')

  if (!trimmed) {
    throw new Error('Enter a GitHub repository path.')
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const url = new URL(trimmed)
    const [owner = '', repo = ''] = url.pathname.split('/').filter(Boolean)
    if (!owner || !repo) {
      throw new Error('Enter a valid GitHub repository URL.')
    }
    return { owner, repo }
  }

  const [owner = '', repo = ''] = trimmed.split('/')
  if (!owner || !repo) {
    throw new Error('Enter a valid repository in owner/repo format.')
  }

  return { owner, repo }
}

export function useGitHub(): UseGitHubReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const setGithubLoading = useUIStore(state => state.setLoading)
  const repoStore = useRepoStore()

  const fetchCommits = async (page = 1): Promise<void> => {
    if (!repoStore.owner || !repoStore.repoName) {
      throw new Error('Connect a repository first.')
    }

    setGithubLoading('github-commits', true)
    try {
      const response = await githubApi.getCommits(repoStore.owner, repoStore.repoName, {
        page,
        per_page: 50,
        branch: repoStore.metadata?.defaultBranch || 'main',
      })
      repoStore.setCommits(response.data as CommitData[])
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to fetch commits.'
      repoStore.setError(message)
      toast.error(message)
      throw requestError instanceof Error ? requestError : new Error(message)
    } finally {
      setGithubLoading('github-commits', false)
    }
  }

  const connect = async (repoUrl: string): Promise<void> => {
    const parsed = parseRepoInput(repoUrl)
    setLoading(true)
    setError(null)
    setProgress(0)
    setProgressLabel('Validating repository...')
    repoStore.setError(null)
    setGithubLoading('github-connect', true)

    try {
      setProgress(0)
      setProgressLabel('Validating repository...')

      const repoResponse = await githubApi.getRepo(parsed.owner, parsed.repo)
      const metadata = repoResponse.data as RepoMetadata
      repoStore.setMetadata(metadata)
      setProgress(25)
      setProgressLabel('Fetching metadata...')

      const languagesResponse = await githubApi.getLanguages(parsed.owner, parsed.repo)
      repoStore.setLanguages(languagesResponse.data.languages as Record<string, number>)
      setProgress(50)
      setProgressLabel('Analyzing languages...')

      const contributorsResponse = await githubApi.getContributors(parsed.owner, parsed.repo)
      repoStore.setContributors(contributorsResponse.data as ContributorData[])
      setProgress(70)
      setProgressLabel('Loading contributors...')

      const branchesResponse = await githubApi.getBranches(parsed.owner, parsed.repo)
      repoStore.setBranches(branchesResponse.data as BranchData[])
      setProgress(85)
      setProgressLabel('Mapping branches...')

      const fileTreeResponse = await githubApi.getFileTree(parsed.owner, parsed.repo, metadata.defaultBranch || 'main')
      repoStore.setFileTree(fileTreeResponse.data as FileNode[])

      const commitsResponse = await githubApi.getCommits(parsed.owner, parsed.repo, {
        page: 1,
        per_page: 50,
        branch: metadata.defaultBranch || 'main',
      })
      repoStore.setCommits(commitsResponse.data as CommitData[])
      setProgress(100)
      setProgressLabel('Complete!')
      repoStore.setRepo(repoUrl)
      toast.success(`Connected to ${metadata.owner}/${metadata.name}`)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to connect repository.'
      setError(message)
      repoStore.setError(message)
      repoStore.setCommits([])
      repoStore.setBranches([])
      repoStore.setContributors([])
      repoStore.setLanguages({})
      repoStore.setFileTree([])
      setProgress(0)
      setProgressLabel('')
      toast.error(message)
      throw requestError instanceof Error ? requestError : new Error(message)
    } finally {
      setLoading(false)
      setGithubLoading('github-connect', false)
    }
  }

  return { connect, fetchCommits, loading, error, progress, progressLabel }
}
