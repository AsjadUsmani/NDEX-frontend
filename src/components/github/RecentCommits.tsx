import { formatDistanceToNow } from 'date-fns'
import type { CommitData } from '../../types/index.ts'

interface RecentCommitsProps {
  commits: CommitData[]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || '??'
}

function getAvatarStyle(seed: string): string {
  const palette = ['#00a19b', '#e4dd3d', '#00d4cc', '#b8b230', '#005e5b']
  let hash = 0
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % palette.length
  }
  return `linear-gradient(135deg, ${palette[hash]}, rgba(16,25,40,0.95))`
}

export default function RecentCommits({ commits }: RecentCommitsProps) {
  const visibleCommits = commits.slice(0, 10)

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)', marginBottom: 12 }}>
        Recent Commits
      </div>

      {visibleCommits.length === 0 ? (
        <div style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-body)', padding: '12px 0' }}>
          Fetch commits to see history
        </div>
      ) : (
        <div>
          {visibleCommits.map((commit, index) => {
            const authorName = commit.author.name || 'Unknown author'
            const message = commit.message.length > 60 ? `${commit.message.slice(0, 60)}...` : commit.message
            return (
              <div
                key={commit.sha}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: index === visibleCommits.length - 1 ? 'none' : '1px solid var(--border-1)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--text-1)',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: getAvatarStyle(authorName),
                    flex: '0 0 auto',
                  }}
                >
                  {getInitials(authorName)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {message}
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
                    {authorName} · {formatDistanceToNow(new Date(commit.author.date), { addSuffix: true })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      background: 'var(--bg-surface)',
                      color: 'var(--text-3)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--border-1)',
                    }}
                  >
                    {commit.shortSha}
                  </span>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: '#22c55e' }}>+{commit.additions.toLocaleString()}</span>
                    <span style={{ color: '#ef4444' }}>-{commit.deletions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
