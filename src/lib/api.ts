import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  withCredentials: true,
})

let activeApiRequests = 0

function syncApiLoading(delta: 1 | -1): void {
  activeApiRequests = Math.max(0, activeApiRequests + delta)
  useUIStore.getState().setLoading('api', activeApiRequests > 0)
}

// Attach token to every request
api.interceptors.request.use((config) => {
  syncApiLoading(1)
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401 TOKEN_EXPIRED
let refreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => {
    syncApiLoading(-1)
    return res
  },
  async (err) => {
    syncApiLoading(-1)
    const original = err.config
    const isAuthEndpoint = typeof original?.url === 'string' &&
      ['/api/auth/login', '/api/auth/register', '/api/auth/oauth', '/api/auth/refresh']
        .some(path => original.url.includes(path))

    if (err.response?.status === 401 &&
        !isAuthEndpoint &&
        !original._retry) {
      original._retry = true
      if (refreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }
      refreshing = true
      try {
        await useAuthStore.getState().refresh()
        const newToken = useAuthStore.getState().accessToken!
        queue.forEach(cb => cb(newToken))
        queue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export const githubApi = {
  getRepo:         (owner: string, repo: string) =>
    api.get(`/api/github/repo/${owner}/${repo}`),
  getCommits:      (owner: string, repo: string, params = {}) =>
    api.get(`/api/github/commits/${owner}/${repo}`, { params }),
  getLanguages:    (owner: string, repo: string) =>
    api.get(`/api/github/languages/${owner}/${repo}`),
  getContributors: (owner: string, repo: string) =>
    api.get(`/api/github/contributors/${owner}/${repo}`),
  getBranches:     (owner: string, repo: string) =>
    api.get(`/api/github/branches/${owner}/${repo}`),
  getFileTree:     (owner: string, repo: string, branch = 'main') =>
    api.get(`/api/github/tree/${owner}/${repo}`, { params: { branch } }),
  getPullRequests: (owner: string, repo: string) =>
    api.get(`/api/github/pulls/${owner}/${repo}`),
  getIssues:       (owner: string, repo: string) =>
    api.get(`/api/github/issues/${owner}/${repo}`),
  compareRefs: (owner: string, repo: string, base: string, head: string) =>
    api.get(`/api/github/compare/${owner}/${repo}`, { params: { base, head } }),
}

export const codeApi = {
  getFile: (owner: string, repo: string, path: string, branch: string, signal?: AbortSignal) =>
    api.get('/api/code/file', { params: { owner, repo, path, branch }, signal }),
  analyze: (owner: string, repo: string, data: any) =>
    api.post('/api/code/analyze', { owner, repo, ...data }),
  getAnalyzeStreamUrl: (owner: string, repo: string, path: string, branch: string) =>
    `${api.defaults.baseURL}/api/code/analyze?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&filePath=${encodeURIComponent(path)}&branch=${encodeURIComponent(branch)}`,
}

export const srsApi = {
  list: () => api.get('/api/srs/list'),
  get: (id: string) => api.get(`/api/srs/${id}`),
  delete: (id: string) => api.delete(`/api/srs/${id}`),
  exportMarkdown: (id: string) => api.post(`/api/srs/${id}/export/markdown`, {}, { responseType: 'blob' }),
  getGenerateStreamUrl: (owner: string, repo: string) =>
    `${api.defaults.baseURL}/api/srs/generate?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
}

export const preferencesApi = {
  get: () => api.get('/api/preferences'),
  update: (data: any) => api.put('/api/preferences', data),
}

export const reposApi = {
  list: () => api.get('/api/repos'),
  save: (data: any) => api.post('/api/repos', data),
}

export default api
