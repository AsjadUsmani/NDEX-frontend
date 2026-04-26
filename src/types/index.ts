export interface RepoMetadata {
  name: string
  owner: string
  description: string | null
  stars: number
  forks: number
  language: string | null
  url: string
  defaultBranch: string
  createdAt: string
  updatedAt: string
  openIssues: number
  size: number
  topics: string[]
  license: string | null
  isPrivate: boolean
}

export interface CommitData {
  sha: string
  shortSha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  filesChanged: number
  changedFiles?: string[]
  additions: number
  deletions: number
  url: string
}

export interface BranchData {
  name: string
  sha: string
  isDefault: boolean
  lastCommitDate: string
  lastCommitMessage: string
}

export interface ContributorData {
  login: string
  avatarUrl: string
  contributions: number
  name: string | null
  url: string
}

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir' | 'blob' | 'tree'
  size: number
  children?: FileNode[]
}

export interface FunctionalRequirement {
  id: string
  title: string
  description: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  inputs: string[]
  outputs: string[]
  dependencies: string[]
}

export interface NonFunctionalRequirement {
  id: string
  category: 'Performance' | 'Security' | 'Scalability' | 'Reliability' | 'Usability' | 'Maintainability'
  description: string
  metric: string
  rationale: string
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  requestBody?: string
  responseSchema?: string
  authRequired: boolean
}

export interface DataModel {
  name: string
  description: string
  fields: { name: string; type: string; required: boolean; description: string }[]
  relationships: string[]
}

export interface GeneratedSRS {
  id: string
  repoUrl: string
  repoName: string
  generatedAt: string
  version: string
  metadata: {
    provider: 'groq'
    generationMode: 'ai' | 'fallback'
    warning?: string
  }
  document: {
    introduction: {
      purpose: string
      scope: string
      definitions: { term: string; definition: string }[]
      overview: string
    }
    overallDescription: {
      productPerspective: string
      productFunctions: string[]
      userClasses: { name: string; description: string; privileges: string }[]
      operatingEnvironment: string
      assumptions: string[]
      constraints: string[]
    }
    functionalRequirements: FunctionalRequirement[]
    nonFunctionalRequirements: NonFunctionalRequirement[]
    systemArchitecture: {
      description: string
      components: { name: string; responsibility: string; technology: string }[]
      dataFlow: string
      integrations: { name: string; purpose: string; type: string }[]
    }
    dataModels: DataModel[]
    apiEndpoints: APIEndpoint[]
    testingRequirements: {
      unitTesting: string
      integrationTesting: string
      e2eTesting: string
      performanceTesting: string
    }
    glossary: { term: string; definition: string }[]
  }
}

export type SRSDocument = GeneratedSRS

export interface ComplexityMetrics {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  linesOfCode: number
  linesOfComments: number
  commentRatio: number
  functionCount: number
  classCount: number
  importCount: number
  nestingDepth: number
  maintainabilityIndex: number
}

export interface CodeIssue {
  type: 'security' | 'performance' | 'style' | 'bug' | 'maintainability'
  severity: 'critical' | 'high' | 'medium' | 'low'
  line?: number
  title: string
  description: string
  suggestion: string
}

export interface RefactorSuggestion {
  title: string
  description: string
  before: string
  after: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
}

export interface DetectedPattern {
  name: string
  type: 'design' | 'anti' | 'architectural'
  description: string
  confidence: number
  location: string
}

export interface AnalysisDependency {
  name: string
  version?: string
  type: 'internal' | 'external' | 'builtin'
  usedIn: string[]
}

export interface AnalysisResult {
  filePath: string
  language: string
  originalCode: string
  annotatedCode: string
  metrics: ComplexityMetrics
  issues: CodeIssue[]
  patterns: DetectedPattern[]
  suggestions: RefactorSuggestion[]
  dependencies: AnalysisDependency[]
  summary: string
  qualityScore: number
  analysisTime: number
}

export interface PRData {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  merged: boolean
  mergedAt: string | null
  createdAt: string
  closedAt: string | null
  author: string
  authorAvatar: string
  url: string
  additions: number
  deletions: number
  changedFiles: number
  labels: string[]
  reviewCount: number
  commentCount: number
}

export interface IssueData {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  createdAt: string
  closedAt: string | null
  author: string
  labels: string[]
  commentCount: number
  isPR: boolean
  url: string
}

export interface PRStats {
  totalPRs: number
  openPRs: number
  closedPRs: number
  mergedPRs: number
  mergeRate: number
  avgMergeTimeHours: number
  avgAdditions: number
  avgDeletions: number
  topContributors: { login: string; prCount: number }[]
  weeklyActivity: {
    week: string
    opened: number
    closed: number
    merged: number
  }[]
}

export interface IssueStats {
  totalIssues: number
  openIssues: number
  closedIssues: number
  resolutionRate: number
  avgResolutionHours: number
  weeklyActivity: {
    week: string
    opened: number
    closed: number
  }[]
  topLabels: { name: string; count: number; color: string }[]
}

export interface AppState {
  repo: RepoMetadata | null
  commits: CommitData[]
  branches: BranchData[]
  contributors: ContributorData[]
  srs: GeneratedSRS | null
  loading: boolean
  error: string | null
}

export type DiagramType = 'uml-class' | 'uml-sequence' | 'dependency' | 'flowchart' | 'component' | 'er-diagram'

export interface GeneratedDiagram {
  type: DiagramType
  title: string
  description: string
  mermaidCode: string
}

export interface AnalysisOutput {
  language: string
  summary: string
  diagrams: GeneratedDiagram[]
  metrics: {
    complexity: number
    maintainability: number
    linesOfCode: number
    functionCount: number
  }
  issues: { severity: string; message: string }[]
  suggestions: string[]
}

export interface DiffFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied'
  additions: number
  deletions: number
  changes: number
  patch?: string
  previousFilename?: string
}

export interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header'
  content: string
  oldLineNum?: number
  newLineNum?: number
}

export interface CommitComparison {
  baseRef: string
  headRef: string
  status: 'ahead' | 'behind' | 'diverged' | 'identical'
  aheadBy: number
  behindBy: number
  totalCommits: number
  files: DiffFile[]
  commits: CommitData[]
}

export interface DiffStats {
  totalFiles: number
  totalAdditions: number
  totalDeletions: number
  addedFiles: number
  removedFiles: number
  modifiedFiles: number
}
export interface UserPreferences {
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  defaultBranch: string
  githubTokenHint: string | null
  notifications: {
    email: boolean
    push: boolean
  }
}

export interface SavedRepository {
  id: string
  user_id: string
  github_url: string
  owner: string
  repo_name: string
  description: string | null
  stars: number
  forks: number
  language: string | null
  is_private: boolean
  file_tree: FileNode[]
  commits: CommitData[]
  branches: BranchData[]
  contributors: ContributorData[]
  languages_data: Record<string, number>
  last_analyzed: string | null
  created_at: string
}
