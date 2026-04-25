import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useUIStore } from '../store/uiStore'

const env = (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env

const api = axios.create({
  baseURL: env?.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
})

let activeRequests = 0

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  activeRequests++
  useUIStore.getState().setLoading('api', activeRequests > 0)
  return config
})

api.interceptors.response.use(
  response => {
    activeRequests = Math.max(0, activeRequests - 1)
    useUIStore.getState().setLoading('api', activeRequests > 0)
    return response
  },
  (error: AxiosError<{ error?: string }>) => {
    activeRequests = Math.max(0, activeRequests - 1)
    useUIStore.getState().setLoading('api', activeRequests > 0)
    const message = error.response?.data?.error || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  },
)

export const githubApi = {
  getRepo: (owner: string, repo: string) => api.get(`/api/github/repo/${owner}/${repo}`),
  getCommits: (owner: string, repo: string, params = {}) => api.get(`/api/github/commits/${owner}/${repo}`, { params }),
  getLanguages: (owner: string, repo: string) => api.get(`/api/github/languages/${owner}/${repo}`),
  getContributors: (owner: string, repo: string) => api.get(`/api/github/contributors/${owner}/${repo}`),
  getBranches: (owner: string, repo: string) => api.get(`/api/github/branches/${owner}/${repo}`),
  getFileTree: (owner: string, repo: string, branch = 'main') => api.get(`/api/github/tree/${owner}/${repo}`, { params: { branch } }),
  getPullRequests: (owner: string, repo: string) => api.get(`/api/github/pulls/${owner}/${repo}`),
  getIssues: (owner: string, repo: string) => api.get(`/api/github/issues/${owner}/${repo}`),
}

export const srsApi = {
  getGenerateStreamUrl: (owner: string, repo: string) => {
    const base = env?.VITE_API_BASE_URL || 'http://localhost:3001'
    const query = new URLSearchParams({ owner, repo }).toString()
    return `${base}/api/srs/generate?${query}`
  },
  getById: (id: string) => api.get(`/api/srs/${id}`),
  exportMarkdown: (id: string) =>
    api.post(`/api/srs/${id}/export/markdown`, null, {
      responseType: 'blob',
      headers: { Accept: 'text/markdown' },
    }),
}

export const codeApi = {
  getAnalyzeStreamUrl: (owner: string, repo: string, filePath: string, branch: string) => {
    const base = env?.VITE_API_BASE_URL || 'http://localhost:3001'
    const query = new URLSearchParams({ owner, repo, filePath, branch }).toString()
    return `${base}/api/code/analyze?${query}`
  },
  getFile: (owner: string, repo: string, path: string, branch: string) =>
    api.get('/api/code/file', {
      params: { owner, repo, path, branch },
    }),
  getCached: (owner: string, repo: string, filePath: string) =>
    api.get(`/api/code/cache/${owner}/${repo}/${encodeURIComponent(filePath)}`),
}

export default api
