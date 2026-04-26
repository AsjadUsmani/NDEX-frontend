import { motion } from 'framer-motion'

interface LanguageBarProps {
  languages: Record<string, number>
}

const colorMap: Record<string, string> = {
  TypeScript: '#00a19b',
  JavaScript: '#e4dd3d',
  Python: '#3b82f6',
  CSS: '#f59e0b',
  HTML: '#ef4444',
  Go: '#06b6d4',
  Rust: '#f97316',
  Java: '#8b5cf6',
  Other: '#4d7c79',
}

export default function LanguageBar({ languages }: LanguageBarProps) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1])

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)', marginBottom: 14 }}>
        Languages
      </div>

      <div
        style={{
          height: 5,
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          width: '100%',
        }}
      >
        {entries.map(([language, percentage], index) => (
          <motion.div
            key={language}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }}
            style={{ background: colorMap[language] || colorMap.Other, height: '100%' }}
            aria-label={`${language} ${percentage.toFixed(1)} percent`}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
        {entries.map(([language, percentage]) => (
          <div key={language} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              aria-hidden="true"
              style={{ width: 8, height: 5, borderRadius: '50%', background: colorMap[language] || colorMap.Other }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{language}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
