import { useCallback } from 'react'
import { useD3 } from '../../hooks/useD3'
import { renderHeatmap } from '../../lib/d3/heatmap'
import { useUIStore } from '../../store/uiStore'
import type { CommitData, FileNode } from '../../types/index.ts'

interface FileHeatmapProps {
  files: FileNode[]
  commits: CommitData[]
  selectedFile: string | null
  onFileSelect: (path: string) => void
}

export default function FileHeatmap({ files, commits, selectedFile, onFileSelect }: FileHeatmapProps) {
  const loading = useUIStore(state => state.isLoading('github-connect') || state.isLoading('api'))

  const renderFn = useCallback((container: HTMLDivElement, dimensions: { width: number; height: number }) => {
    if (!files.length) {
      return () => {
        container.innerHTML = ''
      }
    }

    return renderHeatmap(container, files, commits, {
      width: dimensions.width,
      height: 400,
      selectedFile,
      onFileClick: filePath => {
        onFileSelect(filePath)
      },
    })
  }, [commits, files, onFileSelect, selectedFile])

  const chartRef = useD3<HTMLDivElement>(renderFn, [files, commits])

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 6, borderRadius: 3, width: '100%', background: 'linear-gradient(90deg, #00a19b, #e4dd3d)' }} />
        <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 11 }}>
          <span>Fewer changes</span>
          <span>More changes</span>
        </div>
      </div>

      {loading ? (
        <div className="ndex-skeleton" style={{ height: 400, borderRadius: 8 }} />
      ) : (
        <div ref={chartRef} style={{ position: 'relative', width: '100%', height: 400, overflow: 'hidden' }} />
      )}

      {selectedFile ? (
        <div
          style={{
            marginTop: 12,
            background: 'var(--bg-raised)',
            border: '0.5px solid var(--border-2)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
          }}
        >
          <div style={{ color: 'var(--text-1)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{selectedFile}</div>
          <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>
            Selected file in heatmap
          </div>
        </div>
      ) : null}
    </section>
  )
}
