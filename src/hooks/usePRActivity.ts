import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { githubApi } from '../lib/api'
import { useRepoStore } from '../store/repoStore'
import { useUIStore } from '../store/uiStore'

interface UsePRActivityReturn {
  fetchPRActivity: () => Promise<void>
  loading: boolean
  error: string | null
}

export function usePRActivity(): UsePRActivityReturn {
  const owner = useRepoStore(state => state.owner)
  const repoName = useRepoStore(state => state.repoName)
  const prs = useRepoStore(state => state.prs)
  const issues = useRepoStore(state => state.issues)
  const setPRs = useRepoStore(state => state.setPRs)
  const setIssues = useRepoStore(state => state.setIssues)
  const setLoadingState = useUIStore(state => state.setLoading)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPRActivity = useCallback(async () => {
    if (!owner || !repoName) {
      throw new Error('Connect a repository first.')
    }

    setLoading(true)
    setError(null)
    setLoadingState('github-activity', true)

    try {
      const [prsResponse, issuesResponse] = await Promise.all([
        githubApi.getPullRequests(owner, repoName),
        githubApi.getIssues(owner, repoName),
      ])

      const prsPayload = prsResponse.data as { prs: unknown[]; stats: unknown }
      const issuesPayload = issuesResponse.data as { issues: unknown[]; stats: unknown }

      setPRs(prsPayload.prs as Parameters<typeof setPRs>[0], prsPayload.stats as Parameters<typeof setPRs>[1])
      setIssues(issuesPayload.issues as Parameters<typeof setIssues>[0], issuesPayload.stats as Parameters<typeof setIssues>[1])
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to fetch PR activity.'
      setError(message)
      toast.error(message)
      throw requestError instanceof Error ? requestError : new Error(message)
    } finally {
      setLoading(false)
      setLoadingState('github-activity', false)
    }
  }, [owner, repoName, setIssues, setLoadingState, setPRs])

  useEffect(() => {
    if (!owner || !repoName) {
      return
    }

    if (prs.length > 0 || issues.length > 0) {
      return
    }

    void fetchPRActivity()
  }, [fetchPRActivity, issues.length, owner, prs.length, repoName])

  return useMemo(
    () => ({ fetchPRActivity, loading, error }),
    [error, fetchPRActivity, loading],
  )
}
