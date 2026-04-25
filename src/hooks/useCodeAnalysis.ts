import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { codeApi } from '../lib/api'
import { useRepoStore } from '../store/repoStore'
import type { AnalysisResult } from '../types/index.ts'

interface UseCodeAnalysisReturn {
  analyze: (filePath: string) => void
  cancel: () => void
  progress: number
  progressLabel: string
  status: 'idle' | 'analyzing' | 'complete' | 'error'
  result: AnalysisResult | null
  error: string | null
  cachedResults: Record<string, AnalysisResult>
}

interface AnalysisSSEPayload {
  step?: string
  progress?: number
  label?: string
  result?: AnalysisResult
  error?: string
}

export function useCodeAnalysis(): UseCodeAnalysisReturn {
  const owner = useRepoStore(state => state.owner)
  const repoName = useRepoStore(state => state.repoName)
  const defaultBranch = useRepoStore(state => state.metadata?.defaultBranch || 'main')

  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cachedResults, setCachedResults] = useState<Record<string, AnalysisResult>>({})

  const eventSourceRef = useRef<EventSource | null>(null)
  const selectedFileRef = useRef<string | null>(null)

  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (status === 'analyzing') {
      setStatus('idle')
      setProgress(0)
      setProgressLabel('')
    }
  }, [status])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const analyze = useCallback(
    (filePath: string) => {
      if (!owner || !repoName) {
        setError('Connect a repository first.')
        setStatus('error')
        return
      }

      const normalizedPath = filePath.trim()
      if (!normalizedPath) {
        setError('Select a file to analyze.')
        setStatus('error')
        return
      }

      selectedFileRef.current = normalizedPath
      setError(null)

      const cached = cachedResults[normalizedPath]
      if (cached) {
        setResult(cached)
        setStatus('complete')
        setProgress(100)
        setProgressLabel('Loaded from cache')
        return
      }

      cancel()
      setStatus('analyzing')
      setProgress(0)
      setProgressLabel('Initializing analysis...')

      const streamUrl = codeApi.getAnalyzeStreamUrl(owner, repoName, normalizedPath, defaultBranch)
      const source = new EventSource(streamUrl)
      eventSourceRef.current = source

      source.onmessage = event => {
        try {
          const payload = JSON.parse(event.data) as AnalysisSSEPayload
          if (typeof payload.progress === 'number') {
            setProgress(payload.progress)
          }
          if (typeof payload.label === 'string') {
            setProgressLabel(payload.label)
          }

          if (payload.error) {
            setError(payload.error)
            setStatus('error')
            source.close()
            eventSourceRef.current = null
            return
          }

          if (payload.step === 'complete') {
            if (payload.result) {
              const completed = payload.result
              setResult(completed)
              setCachedResults(prev => ({
                ...prev,
                [completed.filePath]: completed,
              }))
            }
            setStatus('complete')
            setProgress(100)
            setProgressLabel(payload.label || 'Analysis complete!')
            source.close()
            eventSourceRef.current = null
          }
        } catch {
          setError('Failed to parse analysis stream event.')
          setStatus('error')
          source.close()
          eventSourceRef.current = null
        }
      }

      source.onerror = () => {
        source.close()
        eventSourceRef.current = null
        setStatus(prev => (prev === 'complete' ? prev : 'error'))
        setError(prev => prev || 'Analysis stream disconnected.')
      }
    },
    [cachedResults, cancel, defaultBranch, owner, repoName],
  )

  return useMemo(
    () => ({
      analyze,
      cancel,
      progress,
      progressLabel,
      status,
      result,
      error,
      cachedResults,
    }),
    [analyze, cachedResults, cancel, error, progress, progressLabel, result, status],
  )
}
