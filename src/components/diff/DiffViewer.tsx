import { useState, useMemo } from 'react'
import { Copy, ChevronDown, ChevronRight } from 'lucide-react'
import type { DiffFile, DiffLine } from '../../types'
import toast from 'react-hot-toast'

interface DiffViewerProps {
  file: DiffFile
  isExpanded: boolean
  onToggle: () => void
}

// Parse unified diff patch into DiffLine array
function parsePatch(patch: string): DiffLine[] {
  if (!patch) return []
  const lines: DiffLine[] = []
  let oldNum = 0
  let newNum = 0

  for (const raw of patch.split('\n')) {
    if (raw.startsWith('@@')) {
      // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
      const match = raw.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (match) {
        oldNum = parseInt(match[1]) - 1
        newNum = parseInt(match[2]) - 1
      }
      lines.push({ type: 'header', content: raw })
      continue
    }
    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      newNum++
      lines.push({ type: 'added', content: raw.slice(1), newLineNum: newNum })
    } else if (raw.startsWith('-') && !raw.startsWith('---')) {
      oldNum++
      lines.push({ type: 'removed', content: raw.slice(1), oldLineNum: oldNum })
    } else if (raw && !raw.startsWith('\\')) {
      oldNum++; newNum++
      lines.push({ type: 'context', content: raw.slice(1),
                   oldLineNum: oldNum, newLineNum: newNum })
    }
  }
  return lines
}

// Status badge color
const statusColor = (status: DiffFile['status']) =>
  status === 'added'    ? '#00c896' :
  status === 'removed'  ? '#ff5e5e' :
  status === 'modified' ? '#e4dd3d' : '#8fb5b3'

const statusLabel = (status: DiffFile['status']) =>
  status === 'added'    ? 'A' :
  status === 'removed'  ? 'D' :
  status === 'modified' ? 'M' :
  status === 'renamed'  ? 'R' : 'C'

export default function DiffViewer({
  file, isExpanded, onToggle
}: DiffViewerProps) {

  const lines  = useMemo(() => parsePatch(file.patch || ''), [file.patch])
  const [showAll, setShowAll] = useState(false)

  // Show first 50 lines by default, "Show all" for more
  const visibleLines = showAll ? lines : lines.slice(0, 50)
  const hasMore      = lines.length > 50

  const lineStyle = (type: DiffLine['type']): React.CSSProperties => ({
    display: 'flex',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 12,
    lineHeight: '20px',
    background:
      type === 'added'   ? 'rgba(0,200,150,0.08)'   :
      type === 'removed' ? 'rgba(255,94,94,0.08)'   :
      type === 'header'  ? 'rgba(0,161,155,0.06)'   :
      'transparent',
    borderLeft:
      type === 'added'   ? '3px solid #00c896' :
      type === 'removed' ? '3px solid #ff5e5e' :
      type === 'header'  ? '3px solid #00a19b' :
      '3px solid transparent',
  })

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      marginBottom: 8,
    }}>

      {/* File header — always visible */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          cursor: 'pointer',
          background: isExpanded ? 'var(--bg-raised)' : 'var(--bg-card)',
          borderBottom: isExpanded ? '1px solid var(--border-1)' : 'none',
          userSelect: 'none',
          transition: 'background 0.15s',
        }}
      >
        {/* Expand toggle */}
        {isExpanded
          ? <ChevronDown size={14} color="var(--text-3)" />
          : <ChevronRight size={14} color="var(--text-3)" />
        }

        {/* Status badge */}
        <span style={{
          width: 18, height: 18,
          borderRadius: 4,
          background: `${statusColor(file.status)}20`,
          color: statusColor(file.status),
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Geist Mono, monospace',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {statusLabel(file.status)}
        </span>

        {/* Filename */}
        <span style={{
          fontFamily: 'Geist Mono, monospace',
          fontSize: 13,
          color: 'var(--text-1)',
          flex: 1,
        }}>
          {file.previousFilename
            ? `${file.previousFilename} → ${file.filename}`
            : file.filename
          }
        </span>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {file.additions > 0 && (
            <span style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 12,
              color: '#00c896',
              fontWeight: 600,
            }}>
              +{file.additions}
            </span>
          )}
          {file.deletions > 0 && (
            <span style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 12,
              color: '#ff5e5e',
              fontWeight: 600,
            }}>
              -{file.deletions}
            </span>
          )}

          {/* Mini change bar */}
          <div style={{
            width: 60, height: 6,
            background: 'var(--bg-raised)',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
          }}>
            <div style={{
              width: `${(file.additions / (file.changes || 1)) * 100}%`,
              background: '#00c896',
              height: '100%',
            }} />
            <div style={{
              width: `${(file.deletions / (file.changes || 1)) * 100}%`,
              background: '#ff5e5e',
              height: '100%',
            }} />
          </div>

          {/* Copy button */}
          <button
            onClick={e => {
              e.stopPropagation()
              navigator.clipboard.writeText(file.patch || '')
              toast.success('Patch copied!')
            }}
            style={{
              width: 26, height: 26,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-1)',
              borderRadius: 4,
              color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Copy size={11} />
          </button>
        </div>
      </div>

      {/* Diff lines */}
      {isExpanded && lines.length > 0 && (
        <div style={{ overflow: 'auto', maxHeight: 500 }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}>
            <colgroup>
              <col style={{ width: 40 }} />  {/* old line num */}
              <col style={{ width: 40 }} />  {/* new line num */}
              <col />                         {/* content */}
            </colgroup>
            <tbody>
              {visibleLines.map((line, i) => (
                <tr key={i} style={lineStyle(line.type)}>
                  {/* Old line number */}
                  <td style={{
                    padding: '0 8px',
                    textAlign: 'right',
                    color: '#2a4a48',
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 11,
                    userSelect: 'none',
                    verticalAlign: 'top',
                    paddingTop: 1,
                  }}>
                    {line.type !== 'added' && line.type !== 'header'
                      ? line.oldLineNum : ''}
                  </td>
                  {/* New line number */}
                  <td style={{
                    padding: '0 8px',
                    textAlign: 'right',
                    color: '#2a4a48',
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 11,
                    userSelect: 'none',
                    verticalAlign: 'top',
                    paddingTop: 1,
                  }}>
                    {line.type !== 'removed' && line.type !== 'header'
                      ? line.newLineNum : ''}
                  </td>
                  {/* Content */}
                  <td style={{
                    padding: '0 12px',
                    color:
                      line.type === 'added'   ? '#00c896' :
                      line.type === 'removed' ? '#ff5e5e' :
                      line.type === 'header'  ? '#4d7c79' :
                      '#8fb5b3',
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 12,
                    whiteSpace: 'pre',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {line.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Show more */}
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-surface)',
                border: 'none',
                borderTop: '1px solid var(--border-1)',
                color: 'var(--teal)',
                fontFamily: 'Geist Mono, monospace',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Show {lines.length - 50} more lines
            </button>
          )}
        </div>
      )}

      {/* No patch available */}
      {isExpanded && !lines.length && (
        <div style={{
          padding: '16px 20px',
          color: 'var(--text-3)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 12,
        }}>
          {file.status === 'added'
            ? 'New file added'
            : file.status === 'removed'
              ? 'File deleted'
              : 'Binary file or no diff available'}
        </div>
      )}
    </div>
  )
}
