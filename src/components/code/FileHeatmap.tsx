import { useMemo } from 'react'
import { GitCommitHorizontal } from 'lucide-react'
import { useD3 } from '../../hooks/useD3'
import { renderHeatmap } from '../../lib/d3/heatmap'
import type { CommitData, FileNode } from '../../types/index.ts'

interface FileHeatmapProps {
  files: FileNode[]
  commits: CommitData[]
  selectedFile: string | null
  onFileSelect: (path: string) => void
}

function countFiles(nodes: FileNode[]): number {
  return nodes.reduce((total, node) => {
    if (node.type === 'tree' || node.type === 'dir') {
      return total + countFiles(node.children || [])
    }

    return node.type === 'blob' || node.type === 'file' ? total + 1 : total
  }, 0)
}

export default function FileHeatmap({ files, commits, selectedFile, onFileSelect }: FileHeatmapProps) {
  const totalFiles = useMemo(() => countFiles(files), [files])

  const containerRef = useD3<HTMLDivElement>(
    (container, dimensions) =>
      renderHeatmap(container, files, commits, {
        width: dimensions.width,
        height: Math.max(320, dimensions.height),
        selectedFile,
        onFileClick: onFileSelect,
      }),
    [files, commits, onFileSelect, selectedFile],
  )

  if (totalFiles === 0) {
    return (
      <div
        style={{
          minHeight: 240,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-2)',
          color: 'var(--text-3)',
          fontSize: 13,
          background: 'var(--bg-raised)',
        }}
      >
        No file history to display
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 12 }}>
          <GitCommitHorizontal size={14} />
          <span>{commits.length} commits</span>
          <span>•</span>
          <span>{totalFiles} files</span>
        </div>
        <div style={{ color: 'var(--text-4)', fontSize: 12 }}>Click any tile to open that file</div>
      </div>

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 480,
          minHeight: 320,
          borderRadius: 'var(--radius-md)',
          border: '0.5px solid var(--border-1)',
          background: 'linear-gradient(180deg, rgba(16, 25, 40, 0.9), rgba(10, 16, 27, 0.95))',
          overflow: 'hidden',
        }}
      />
    </div>
  )
}
