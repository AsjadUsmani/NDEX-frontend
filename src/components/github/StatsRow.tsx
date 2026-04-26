import { CircleDot, GitFork, Star, Users } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore'
import type { RepoMetadata } from '../../types/index.ts'

interface StatsRowProps {
  metadata: RepoMetadata
}

const cards = [
  {
    label: 'Stars',
    icon: Star,
    color: 'var(--gold)',
    tint: 'rgba(228,221,61,0.1)',
    value: (metadata: RepoMetadata, _contributorCount: number) => metadata.stars.toLocaleString(),
  },
  {
    label: 'Forks',
    icon: GitFork,
    color: 'var(--teal)',
    tint: 'rgba(0,161,155,0.1)',
    value: (metadata: RepoMetadata, _contributorCount: number) => metadata.forks.toLocaleString(),
  },
  {
    label: 'Open Issues',
    icon: CircleDot,
    color: 'var(--warning)',
    tint: 'rgba(228,221,61,0.1)',
    value: (metadata: RepoMetadata, _contributorCount: number) => metadata.openIssues.toLocaleString(),
  },
  {
    label: 'Contributors',
    icon: Users,
    color: '#8b5cf6',
    tint: 'rgba(139,92,246,0.1)',
    value: (_metadata: RepoMetadata, contributorCount: number) => contributorCount.toLocaleString(),
  },
]

export default function StatsRow({ metadata }: StatsRowProps) {
  const contributorCount = useRepoStore(state => state.contributors.length)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
      {cards.map(card => {
        const Icon = card.icon
        return (
          <article
            key={card.label}
            style={{
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border-2)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={event => {
              event.currentTarget.style.borderColor = 'var(--border-3)'
              event.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={event => {
              event.currentTarget.style.borderColor = 'var(--border-2)'
              event.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: card.tint,
                color: card.color,
              }}
            >
              <Icon size={18} />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--text-1)',
                marginTop: 12,
              }}
            >
              {card.value(metadata, contributorCount)}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: 'var(--text-3)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {card.label}
            </div>
          </article>
        )
      })}
    </div>
  )
}
