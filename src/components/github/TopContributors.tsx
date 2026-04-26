import { useState } from 'react'
import type { ContributorData } from '../../types/index.ts'

interface TopContributorsProps {
  contributors: ContributorData[]
}

function ContributorAvatar({ contributor }: { contributor: ContributorData }) {
  const [failed, setFailed] = useState(false)
  const initials = (contributor.name || contributor.login)
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

  if (failed) {
    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-raised)',
          color: 'var(--text-1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
        }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={contributor.avatarUrl}
      alt={contributor.login}
      width={32}
      height={32}
      style={{ borderRadius: '50%', objectFit: 'cover', flex: '0 0 auto' }}
      onError={() => setFailed(true)}
    />
  )
}

export default function TopContributors({ contributors }: TopContributorsProps) {
  const visibleContributors = contributors.slice(0, 8)
  const maxContributions = Math.max(...visibleContributors.map(contributor => contributor.contributions), 1)

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
        Top Contributors
      </div>

      {visibleContributors.length === 0 ? (
        <div style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-body)', padding: '12px 0' }}>
          Connect a repository to see contributors
        </div>
      ) : (
        <div>
          {visibleContributors.map((contributor, index) => {
            const rank = index + 1
            const rankColor = rank === 1 ? '#e4dd3d' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : 'var(--text-3)'
            const barWidth = Math.max(20, (contributor.contributions / maxContributions) * 100)

            return (
              <div
                key={contributor.login}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: index === visibleContributors.length - 1 ? 'none' : '1px solid var(--border-1)',
                }}
              >
                <div style={{ width: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: rankColor }}>
                  {rank}
                </div>

                <ContributorAvatar contributor={contributor} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 500 }}>
                    {contributor.name || contributor.login}
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{contributor.login}</div>
                  <div
                    style={{
                      marginTop: 6,
                      width: `${barWidth}px`,
                      height: 2,
                      background: 'var(--teal)',
                      borderRadius: 1,
                    }}
                  />
                </div>

                <div
                  style={{
                    background: 'var(--teal-faint)',
                    color: 'var(--teal)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {contributor.contributions.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
