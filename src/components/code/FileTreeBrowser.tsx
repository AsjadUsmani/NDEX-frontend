import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, File, Folder, Search } from 'lucide-react'
import type { FileNode } from '../../types/index.ts'

interface FileTreeBrowserProps {
  files: FileNode[]
  selectedFile: string | null
  onFileSelect: (path: string) => void
  analyzedFiles: string[]
}

const HIDDEN_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next'])
const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'ico',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'zip',
  'tar',
  'gz',
  'map',
  'lock',
])

function getExtension(path: string): string {
  const parts = path.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() || '' : ''
}

function extensionColor(path: string): string {
  const ext = getExtension(path)
  if (ext === 'ts' || ext === 'tsx') return '#3b82f6'
  if (ext === 'js' || ext === 'jsx') return '#e4dd3d'
  if (ext === 'py') return '#00a19b'
  if (ext === 'css') return '#ec4899'
  if (ext === 'json') return '#f97316'
  if (ext === 'md') return '#8fb5b3'
  if (ext === 'html') return '#ef4444'
  if (ext === 'go') return '#06b6d4'
  return 'var(--text-3)'
}

function isDirectory(node: FileNode): boolean {
  return node.type === 'tree' || node.type === 'dir'
}

function isFile(node: FileNode): boolean {
  return node.type === 'blob' || node.type === 'file'
}

function isBinaryPath(path: string): boolean {
  return BINARY_EXTENSIONS.has(getExtension(path))
}

function shouldHideNode(node: FileNode): boolean {
  return isDirectory(node) && HIDDEN_DIRS.has(node.name)
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const q = query.trim().toLowerCase()

  return nodes
    .filter(node => !shouldHideNode(node))
    .flatMap(node => {
      if (isDirectory(node)) {
        const children = filterTree(node.children || [], query)
        const matchesSelf = !q || node.name.toLowerCase().includes(q)

        if (matchesSelf || children.length > 0) {
          return [{ ...node, children }]
        }

        return []
      }

      if (!q || node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q)) {
        return [node]
      }

      return []
    })
}

function countFiles(nodes: FileNode[]): number {
  return nodes.reduce((total, node) => {
    if (isDirectory(node)) {
      return total + countFiles(node.children || [])
    }
    return isFile(node) ? total + 1 : total
  }, 0)
}

export default function FileTreeBrowser({ files, selectedFile, onFileSelect, analyzedFiles }: FileTreeBrowserProps) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const filteredFiles = useMemo(() => filterTree(files, query), [files, query])
  const totalFiles = useMemo(() => countFiles(filteredFiles), [filteredFiles])

  const toggleExpanded = (path: string): void => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }))
  }

  const renderNode = (node: FileNode, depth: number): JSX.Element | null => {
    if (shouldHideNode(node)) {
      return null
    }

    const indent = depth * 16

    if (isDirectory(node)) {
      const defaultExpanded = depth <= 1
      const isOpen = expanded[node.path] ?? defaultExpanded
      const children = node.children || []

      return (
        <div key={node.path}>
          <button
            type="button"
            onClick={() => toggleExpanded(node.path)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 8px',
              paddingLeft: 8 + indent,
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Folder size={14} color="#e4dd3d" />
            <span>{node.name}</span>
          </button>

          {isOpen ? children.map(child => renderNode(child, depth + 1)) : null}
        </div>
      )
    }

    if (!isFile(node)) {
      return null
    }

    const isSelected = selectedFile === node.path
    const isAnalyzed = analyzedFiles.includes(node.path)
    const binary = isBinaryPath(node.path)

    return (
      <button
        key={node.path}
        type="button"
        disabled={binary}
        onClick={() => {
          if (!binary) {
            onFileSelect(node.path)
          }
        }}
        style={{
          width: '100%',
          border: 'none',
          background: isSelected ? 'var(--teal-faint)' : 'transparent',
          borderLeft: isSelected ? '2px solid var(--teal)' : '2px solid transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '5px 8px',
          paddingLeft: 8 + indent,
          color: binary ? 'var(--text-4)' : isSelected ? 'var(--teal)' : 'var(--text-2)',
          cursor: binary ? 'not-allowed' : 'pointer',
          fontSize: 13,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <File size={14} color={binary ? 'var(--text-4)' : extensionColor(node.path)} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={node.path}
          >
            {node.name}
          </span>
        </span>

        {isAnalyzed ? (
          <span
            aria-label="Analyzed"
            title="Analyzed"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              flexShrink: 0,
            }}
          />
        ) : null}
      </button>
    )
  }

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        maxWidth: 260,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border-1)',
      }}
    >
      <div style={{ padding: 10, borderBottom: '0.5px solid var(--border-1)' }}>
        <label style={{ position: 'relative', display: 'block' }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Filter files..."
            style={{
              width: '100%',
              height: 32,
              padding: '0 10px 0 28px',
              borderRadius: 'var(--radius-sm)',
              border: '0.5px solid var(--border-2)',
              background: 'var(--bg-raised)',
              color: 'var(--text-1)',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          />
        </label>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 6 }}>
        {filteredFiles.length > 0 ? filteredFiles.map(node => renderNode(node, 0)) : (
          <div style={{ padding: '10px 12px', color: 'var(--text-3)', fontSize: 12 }}>No files match your filter.</div>
        )}
      </div>

      <div
        style={{
          padding: '8px 10px',
          borderTop: '0.5px solid var(--border-1)',
          color: 'var(--text-3)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {totalFiles} files
      </div>
    </aside>
  )
}
