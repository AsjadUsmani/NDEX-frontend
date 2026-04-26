import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeViewerProps {
  originalCode: string
  annotatedCode: string
  language: string
  filePath: string
}

function languageMeta(language: string): { label: string; color: string } {
  const key = language.toLowerCase()
  if (key === 'typescript') return { label: 'TypeScript', color: '#3b82f6' }
  if (key === 'javascript') return { label: 'JavaScript', color: '#e4dd3d' }
  if (key === 'python') return { label: 'Python', color: '#00a19b' }
  if (key === 'css') return { label: 'CSS', color: '#ec4899' }
  if (key === 'json') return { label: 'JSON', color: '#f97316' }
  if (key === 'markdown') return { label: 'Markdown', color: '#8fb5b3' }
  if (key === 'html') return { label: 'HTML', color: '#ef4444' }
  if (key === 'go') return { label: 'Go', color: '#06b6d4' }
  if (key === 'rust') return { label: 'Rust', color: '#f97316' }
  return { label: 'Text', color: 'var(--text-3)' }
}

export default function CodeViewer({ originalCode, annotatedCode, language, filePath }: CodeViewerProps) {
  const [leftWidth, setLeftWidth] = useState(50)
  const [dragging, setDragging] = useState(false)
  const leftScrollRef = useRef<HTMLDivElement | null>(null)
  const rightScrollRef = useRef<HTMLDivElement | null>(null)
  const syncGuardRef = useRef(false)

  const lang = useMemo(() => languageMeta(language), [language])
  const fileName = useMemo(() => filePath.split('/').pop() || filePath, [filePath])

  const syntaxTheme = useMemo(() => {
    const theme = atomDark as unknown as Record<string, CSSProperties>
    return {
      ...theme,
      'pre[class*="language-"]': {
        background: '#101928',
        color: '#e8f4f3',
        margin: 0,
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        minHeight: '100%',
      },
      'code[class*="language-"]': {
        color: '#e8f4f3',
        fontFamily: 'var(--font-mono)',
      },
      comment: { color: '#4d7c79' },
      keyword: { color: '#00a19b' },
      string: { color: '#e4dd3d' },
      function: { color: '#00d4cc' },
      number: { color: '#f97316' },
    } as { [key: string]: CSSProperties }
  }, [])

  const onPaneScroll = (source: 'left' | 'right') => {
    if (syncGuardRef.current) {
      return
    }

    const sourceRef = source === 'left' ? leftScrollRef.current : rightScrollRef.current
    const targetRef = source === 'left' ? rightScrollRef.current : leftScrollRef.current
    if (!sourceRef || !targetRef) {
      return
    }

    syncGuardRef.current = true
    targetRef.scrollTop = sourceRef.scrollTop
    requestAnimationFrame(() => {
      syncGuardRef.current = false
    })
  }

  useEffect(() => {
    if (!dragging) {
      return
    }

    const onMouseMove = (event: MouseEvent): void => {
      const container = leftScrollRef.current?.parentElement?.parentElement
      if (!container) {
        return
      }

      const rect = container.getBoundingClientRect()
      const ratio = ((event.clientX - rect.left) / rect.width) * 100
      const constrained = Math.min(Math.max(ratio, 25), 75)
      setLeftWidth(constrained)
    }

    const onMouseUp = (): void => {
      setDragging(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  const copyCode = async (text: string): Promise<void> => {
    if (!navigator?.clipboard) {
      return
    }
    await navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${leftWidth}%`, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: 36,
            borderBottom: '0.5px solid var(--border-1)',
            background: 'var(--bg-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <strong style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>Original</strong>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{fileName}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: lang.color, fontSize: 11 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: lang.color }} />
              {lang.label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              void copyCode(originalCode)
            }}
            style={{
              border: '0.5px solid var(--border-2)',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              height: 24,
              width: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Copy original code"
          >
            <Copy size={14} />
          </button>
        </div>

        <div
          ref={leftScrollRef}
          onScroll={() => onPaneScroll('left')}
          style={{ flex: 1, overflow: 'auto', background: 'var(--bg-card)' }}
        >
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            showLineNumbers
            wrapLongLines
            customStyle={{ background: '#101928', margin: 0, minHeight: '100%' }}
            lineNumberStyle={{ color: '#2a4a48' }}
          >
            {originalCode || ''}
          </SyntaxHighlighter>
        </div>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => setDragging(true)}
        style={{
          width: 8,
          cursor: 'col-resize',
          background: 'var(--bg-surface)',
          borderLeft: '0.5px solid var(--border-2)',
          borderRight: '0.5px solid var(--border-2)',
          flexShrink: 0,
        }}
      />

      <div style={{ width: `${100 - leftWidth}%`, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: 36,
            borderBottom: '0.5px solid var(--border-1)',
            background: 'var(--bg-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <strong style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>Annotated</strong>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: 20,
                background: 'var(--teal-faint)',
                color: 'var(--teal)',
                border: '0.5px solid var(--border-2)',
              }}
            >
              AI Enhanced
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: lang.color, fontSize: 11 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: lang.color }} />
              {lang.label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              void copyCode(annotatedCode)
            }}
            style={{
              border: '0.5px solid var(--border-2)',
              background: 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              height: 24,
              width: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Copy annotated code"
          >
            <Copy size={14} />
          </button>
        </div>

        <div
          ref={rightScrollRef}
          onScroll={() => onPaneScroll('right')}
          style={{ flex: 1, overflow: 'auto', background: 'var(--bg-card)' }}
        >
          <SyntaxHighlighter
            language={language}
            style={syntaxTheme}
            showLineNumbers
            wrapLongLines
            customStyle={{ background: '#101928', margin: 0, minHeight: '100%' }}
            lineNumberStyle={{ color: '#2a4a48' }}
          >
            {annotatedCode || ''}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
