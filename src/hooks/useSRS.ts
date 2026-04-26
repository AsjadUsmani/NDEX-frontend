import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { srsApi } from '../lib/api'
import { useSRSStore } from '../store/srsStore'
import { useUIStore } from '../store/uiStore'
import type { GeneratedSRS } from '../types/index.ts'

type SRSStatus = 'idle' | 'generating' | 'complete' | 'error'

interface UseSRSReturn {
  generate: (owner: string, repo: string) => void
  cancel: () => void
  progress: number
  progressLabel: string
  currentStep: string
  status: SRSStatus
  document: GeneratedSRS | null
  error: string | null
}

interface SRSProgressEvent {
  step: string
  progress: number
  label: string
  document?: GeneratedSRS
  error?: string
  mode?: 'ai' | 'fallback'
  warning?: string
}

export function useSRS(): UseSRSReturn {
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [currentStep, setCurrentStep] = useState('')
  const [status, setStatus] = useState<SRSStatus>('idle')
  const [document, setDocument] = useState<GeneratedSRS | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sourceRef = useRef<EventSource | null>(null)
  const setDocumentInStore = useSRSStore(state => state.setDocument)
  const setLoadingState = useUIStore(state => state.setLoading)

  const cancel = (): void => {
    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
    setLoadingState('srs-generate', false)
    setProgress(0)
    setProgressLabel('')
    setCurrentStep('')
    setStatus('idle')
  }

  const generate = (owner: string, repo: string): void => {
    if (!owner || !repo) {
      setError('Owner and repo are required.')
      setStatus('error')
      return
    }

    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }

    setProgress(0)
    setProgressLabel('Starting generation...')
    setCurrentStep('init')
    setStatus('generating')
    setError(null)
    setLoadingState('srs-generate', true)

    const source = new EventSource(srsApi.getGenerateStreamUrl(owner, repo))
    sourceRef.current = source

    source.onmessage = (message: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(message.data) as SRSProgressEvent
        setCurrentStep(payload.step)
        setProgress(payload.progress)
        setProgressLabel(payload.label)

        if (payload.step === 'complete' && payload.document) {
          const key = `${owner}/${repo}`
          setDocument(payload.document)
          setDocumentInStore(key, payload.document)
          setStatus('complete')
          if (payload.document.metadata.generationMode === 'fallback') {
            toast(payload.document.metadata.warning || 'Fallback SRS generated because Groq was unavailable.')
          } else {
            toast.success('Groq SRS generation complete')
          }
          setLoadingState('srs-generate', false)
          source.close()
          sourceRef.current = null
          return
        }

        if (payload.step === 'error') {
          const messageText = payload.error || payload.label || 'Failed to generate SRS'
          setError(messageText)
          setStatus('error')
          toast.error(messageText)
          setLoadingState('srs-generate', false)
          source.close()
          sourceRef.current = null
        }
      } catch {
        setError('Failed to parse generation stream response')
        setStatus('error')
        toast.error('Failed to parse generation stream response')
        setLoadingState('srs-generate', false)
        source.close()
        sourceRef.current = null
      }
    }

    source.onerror = () => {
      if (!sourceRef.current) {
        return
      }
      setError('SRS stream connection failed')
      setStatus('error')
      toast.error('SRS stream connection failed')
      setLoadingState('srs-generate', false)
      source.close()
      sourceRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close()
      }
    }
  }, [])

  return {
    generate,
    cancel,
    progress,
    progressLabel,
    currentStep,
    status,
    document,
    error,
  }
}
