import PageShell from '../components/layout/PageShell'
import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import CommitTimeline from '../components/github/CommitTimeline'
import BranchTree from '../components/github/BranchTree'
import ContributorGraph from '../components/github/ContributorGraph'
import PRActivity from '../components/github/PRActivity'
import FileHeatmap from '../components/code/FileHeatmap'
import { useRepoStore } from '../store/repoStore'
import { GitBranch, GitCommit, GitPullRequest, Users, Flame } from 'lucide-react'
import type { BranchData, CommitData, ContributorData, PRData } from '../types/index.ts'

type ActiveTab = 'timeline' | 'branches' | 'contributors' | 'activity' | 'heatmap'

const tabs = [
  { id: 'timeline',     label: 'Timeline',     icon: GitCommit },
  { id: 'branches',     label: 'Branches',     icon: GitBranch },
  { id: 'contributors', label: 'Contributors', icon: Users },
  { id: 'activity',     label: 'PR & Issues',  icon: GitPullRequest },
  { id: 'heatmap',      label: 'Heatmap',      icon: Flame },
] as const

interface CommitDetailProps {
  commit: CommitData
}

function PRDetail({ pr }: { pr: PRData }) {
  const stateColor = pr.merged ? 'var(--teal)' : pr.state === 'open' ? 'var(--gold)' : 'var(--error)'

  return (
    <div style={{ display: 'grid', gap: 14, background: 'var(--bg-raised)', border: '0.5px solid var(--border-gold)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', background: 'var(--gold-faint)', border: '0.5px solid var(--border-gold)', borderRadius: 999, padding: '2px 8px' }}>
              #{pr.number}
            </span>
            <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)', fontSize: 18 }}>{pr.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={pr.authorAvatar} alt={pr.author} width={32} height={32} style={{ borderRadius: '50%' }} />
            <div>
              <div style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>{pr.author}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Created {format(new Date(pr.createdAt), 'MMM d, yyyy')}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ color: stateColor, fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', background: `${stateColor}1a`, border: `0.5px solid ${stateColor}44`, borderRadius: 999, padding: '2px 8px' }}>
            {pr.merged ? 'merged' : pr.state}
          </span>
          <a href={pr.url} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: 13 }}>View on GitHub →</a>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        <span style={{ color: 'var(--teal)' }}>+{pr.additions.toLocaleString()}</span>
        <span style={{ color: '#ff5e5e' }}>-{pr.deletions.toLocaleString()}</span>
        <span style={{ color: 'var(--text-3)' }}>{pr.changedFiles.toLocaleString()} files</span>
        <span style={{ color: 'var(--text-3)' }}>{pr.commentCount.toLocaleString()} comments</span>
        <span style={{ color: 'var(--text-3)' }}>{pr.reviewCount.toLocaleString()} reviews</span>
      </div>

      {pr.labels.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pr.labels.map(label => (
            <span key={label} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 999, background: 'var(--bg-surface)', border: '0.5px solid var(--border-1)', color: 'var(--text-2)' }}>
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CommitDetail({ commit }: CommitDetailProps) {
  const initials = commit.author.name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(commit.sha)
          toast.success('SHA copied')
        }}
        style={{
          border: '0.5px solid var(--border-2)',
          background: 'var(--bg-surface)',
          color: 'var(--text-2)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 10px',
          textAlign: 'left',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {commit.sha}
      </button>
      <div style={{ color: 'var(--text-1)', fontSize: 16 }}>{commit.message}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--bg-raised)',
            color: 'var(--text-1)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}
        >
          {initials || '??'}
        </div>
        <div>
          <div style={{ color: 'var(--text-1)', fontSize: 13 }}>{commit.author.name}</div>
          <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{commit.author.email}</div>
        </div>
      </div>
      <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
        {format(new Date(commit.author.date), "MMMM d, yyyy 'at' h:mm a")}
      </div>
      <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        <span style={{ color: '#22c55e' }}>+{commit.additions.toLocaleString()}</span>
        <span style={{ color: '#ef4444' }}>-{commit.deletions.toLocaleString()}</span>
      </div>
      <a href={commit.url} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: 13 }}>
        View on GitHub →
      </a>
    </div>
  )
}

export default function GitTracking() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline')
  const [selectedCommit, setSelectedCommit] = useState<CommitData | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null)
  const [selectedContributor, setSelectedContributor] = useState<ContributorData | null>(null)
  const [selectedPR, setSelectedPR] = useState<PRData | null>(null)

  const { isConnected, commits, branches, contributors, fileTree } = useRepoStore()

  const handleCommitSelect = useCallback((commit: CommitData | null) => {
    setSelectedCommit(commit)
    setSelectedBranch(null)
    setSelectedContributor(null)
  }, [])

  const handleBranchSelect = useCallback((branch: BranchData | null) => {
    setSelectedBranch(branch)
    setSelectedCommit(null)
    setSelectedContributor(null)
  }, [])

  const handleContributorSelect = useCallback((contributor: ContributorData | null) => {
    setSelectedContributor(contributor)
    setSelectedCommit(null)
    setSelectedBranch(null)
    setSelectedPR(null)
  }, [])

  const handlePRSelect = useCallback((pr: PRData | null) => {
    setSelectedPR(pr)
    setSelectedCommit(null)
    setSelectedBranch(null)
    setSelectedContributor(null)
  }, [])

  const actions = (
    <div style={{ display: 'flex', gap: 8 }}>
      {tabs.map(tab => {
        const Icon = tab.icon
        return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          style={{
            height: 30,
            padding: '0 14px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            background: activeTab === tab.id ? 'var(--teal)' : 'var(--bg-raised)',
            color: activeTab === tab.id ? 'var(--bg-void)' : 'var(--text-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon size={16} />
          {tab.label}
        </button>
        )
      })}
    </div>
  )

  const activeChart = useMemo(() => {
    if (activeTab === 'timeline') {
      return (
        <CommitTimeline
          commits={commits}
          onCommitSelect={handleCommitSelect}
        />
      )
    }

    if (activeTab === 'branches') {
      return (
        <BranchTree
          branches={branches}
          commits={commits}
          onBranchSelect={handleBranchSelect}
        />
      )
    }

    if (activeTab === 'contributors') {
      return (
        <ContributorGraph
          contributors={contributors}
          onContributorSelect={handleContributorSelect}
        />
      )
    }

    if (activeTab === 'heatmap') {
      return (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Code Change Heatmap</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Files sized by change frequency across recent commits</div>
            </div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{commits.length} commits analyzed</span>
          </div>
          <div style={{ padding: 16 }}>
            <FileHeatmap
              files={fileTree}
              commits={commits}
              selectedFile={null}
              onFileSelect={() => {}}
            />
          </div>
        </div>
      )
    }

    return (
      <PRActivity
        onPRSelect={handlePRSelect}
      />
    )
  }, [activeTab, branches, commits, contributors, fileTree, handleBranchSelect, handleCommitSelect, handleContributorSelect, handlePRSelect])

  const showSideDetail = activeTab !== 'activity' && activeTab !== 'heatmap'

  const detailPanel = selectedCommit ? (
    <CommitDetail commit={selectedCommit} />
  ) : selectedBranch ? (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: 18 }}>{selectedBranch.name}</div>
      <div style={{ color: 'var(--text-2)', fontSize: 14 }}>{selectedBranch.lastCommitMessage}</div>
      <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {format(new Date(selectedBranch.lastCommitDate), "MMMM d, yyyy 'at' h:mm a")}
      </div>
    </div>
  ) : selectedContributor ? (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={selectedContributor.avatarUrl} alt={selectedContributor.login} width={44} height={44} style={{ borderRadius: '50%' }} />
        <div>
          <div style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 600 }}>{selectedContributor.name || selectedContributor.login}</div>
          <div style={{ color: 'var(--text-3)', fontSize: 12 }}>@{selectedContributor.login}</div>
        </div>
      </div>
      <div style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {selectedContributor.contributions.toLocaleString()} contributions
      </div>
      <a href={`https://github.com/${selectedContributor.login}`} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontSize: 13 }}>
        View on GitHub →
      </a>
    </div>
  ) : selectedPR && activeTab === 'activity' ? (
    <PRDetail pr={selectedPR} />
  ) : (
    <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Click any element to explore</div>
  )

  return (
    <PageShell
      title="Git Tracking"
      subtitle="Interactive D3 visualizations for commits, branches, contributors, and files"
      actions={actions}
    >
      {isConnected ? (
        <div style={{ display: 'grid', gap: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: showSideDetail ? 'minmax(0, 3fr) minmax(0, 2fr)' : 'minmax(0, 1fr)',
              gap: 24,
              alignItems: 'start',
            }}
          >
            {activeChart}
            {showSideDetail ? (
              <section
                style={{
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border-2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-2)', marginBottom: 12 }}>
                  Detail Panel
                </div>
                {detailPanel}
              </section>
            ) : null}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-raised)', border: '0.5px solid var(--border-gold)',
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
    </PageShell>
  )
}
