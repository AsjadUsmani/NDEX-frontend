import { useState } from 'react'
import { GitCompare, Loader2, ArrowLeftRight } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore'

interface DiffRefSelectorProps {
  onCompare: (base: string, head: string) => void
  loading: boolean
}

export default function DiffRefSelector({
  onCompare, loading
}: DiffRefSelectorProps) {

  const branches = useRepoStore(s => s.branches)
  const [base, setBase] = useState('main')
  const [head, setHead] = useState('')

  // Common ref suggestions — GitHub compare only supports branch names, tags, and full SHAs (not HEAD~n)
  const refSuggestions = [
    ...branches.map(b => b.name),
  ]

  const inputStyle = {
    height: 40,
    padding: '0 14px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-1)',
    fontFamily: 'Geist Mono, monospace',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    listStyle: 'none',
  } as React.CSSProperties

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 10, marginBottom: 20,
      }}>
        <GitCompare size={16} color="var(--teal)" />
        <span style={{
          fontFamily: 'Geist, sans-serif',
          fontSize: 15, fontWeight: 600,
          color: 'var(--text-1)',
        }}>
          Compare Refs
        </span>
        <span style={{
          fontSize: 12,
          color: 'var(--text-3)',
          fontFamily: 'Geist Mono, monospace',
          background: 'var(--bg-raised)',
          padding: '2px 10px',
          borderRadius: 20,
          border: '1px solid var(--border-1)',
        }}>
          branch · commit · tag
        </span>
      </div>

      {/* Input row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto',
        gap: 12,
        alignItems: 'end',
      }}>

        {/* Base ref */}
        <div>
          <label style={{
            display: 'block', fontSize: 11,
            color: 'var(--text-3)', marginBottom: 6,
            fontFamily: 'Geist Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.8px',
          }}>
            Base
          </label>
          <input
            list="ref-suggestions-base"
            value={base}
            onChange={e => setBase(e.target.value)}
            placeholder="main"
            style={inputStyle}
          />
          <datalist id="ref-suggestions-base">
            {refSuggestions.map(r => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        {/* Swap button */}
        <button
          onClick={() => { setBase(head); setHead(base) }}
          title="Swap base and head"
          style={{
            width: 36, height: 40,
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.color = 'var(--teal)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.color = 'var(--text-3)')
          }
        >
          <ArrowLeftRight size={14} />
        </button>

        {/* Head ref */}
        <div>
          <label style={{
            display: 'block', fontSize: 11,
            color: 'var(--text-3)', marginBottom: 6,
            fontFamily: 'Geist Mono, monospace',
            textTransform: 'uppercase', letterSpacing: '0.8px',
          }}>
            Head
          </label>
          <input
            list="ref-suggestions-head"
            value={head}
            onChange={e => setHead(e.target.value)}
            placeholder="feature-branch or commit SHA"
            style={inputStyle}
          />
          <datalist id="ref-suggestions-head">
            {refSuggestions.map(r => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        {/* Compare button */}
        <button
          onClick={() => onCompare(base, head)}
          disabled={loading || !base.trim() || !head.trim()}
          style={{
            height: 40,
            padding: '0 24px',
            background: loading ? 'var(--teal-dim)' : 'var(--teal)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--bg-void)',
            fontWeight: 700, fontSize: 13,
            fontFamily: 'Geist, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: loading || !base.trim() || !head.trim() ? 0.7 : 1,
            whiteSpace: 'nowrap',
            alignSelf: 'flex-end',
          }}
        >
          {loading
            ? <><Loader2 size={14}
                style={{ animation: 'spin 1s linear infinite' }}
              /> Comparing...</>
            : <><GitCompare size={14} /> Compare</>
          }
        </button>
      </div>

      {/* Quick presets */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 14,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 11, color: 'var(--text-4)',
          fontFamily: 'Geist Mono, monospace',
          alignSelf: 'center',
        }}>
          Quick:
        </span>
        {[
        { base: 'main', head: 'develop',  label: 'main ← develop' },
          { base: 'main', head: 'master',   label: 'main ← master'  },
        ].map(preset => (
          <button
            key={preset.label}
            onClick={() => {
              setBase(preset.base)
              setHead(preset.head)
            }}
            style={{
              height: 26,
              padding: '0 12px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-1)',
              borderRadius: 20,
              color: 'var(--text-3)',
              fontSize: 11,
              fontFamily: 'Geist Mono, monospace',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--teal)'
              e.currentTarget.style.color = 'var(--teal)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-1)'
              e.currentTarget.style.color = 'var(--text-3)'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
