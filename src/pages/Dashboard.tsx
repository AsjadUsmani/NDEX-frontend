import PageShell from '../components/layout/PageShell'
import RepoConnector from '../components/github/RepoConnector'
import StatsRow from '../components/github/StatsRow'
import LanguageBar from '../components/github/LanguageBar'
import RecentCommits from '../components/github/RecentCommits'
import TopContributors from '../components/github/TopContributors'
import { useGitHub } from '../hooks/useGitHub'
import { useRepoStore } from '../store/repoStore'

export default function Dashboard() {
  const { connect, loading, error, progress, progressLabel } = useGitHub()
  const { isConnected, metadata, languages, commits, contributors } = useRepoStore()

  return (
    <PageShell
      title="Dashboard"
      subtitle="Connect a GitHub repository to get started"
    >
      <div style={{ display: 'grid', gap: 24 }}>
        <RepoConnector
          onConnect={connect}
          loading={loading}
          error={error}
          progress={progress}
          progressLabel={progressLabel}
        />

        {isConnected && metadata ? (
          <div style={{ display: 'grid', gap: 24 }}>
            <StatsRow metadata={metadata} />
            <LanguageBar languages={languages} />
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: 24 }}>
              <RecentCommits commits={commits} />
              <TopContributors contributors={contributors} />
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
          }}>
            <span style={{ color: 'var(--text-1)', fontSize: 14 }}>
              No repository connected — go to Dashboard to connect one
            </span>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                background: 'var(--teal)', color: 'var(--bg-void)', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
