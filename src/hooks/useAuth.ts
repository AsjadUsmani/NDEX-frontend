import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    hasHydrated,
    error,
    login,
    oauthLogin,
    register,
    logout,
    refresh,
    checkSession,
    initializeSession,
    clearError,
    loadUserData,
  } = useAuthStore()

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    hasHydrated,
    error,
    login,
    oauthLogin,
    register,
    logout,
    refresh,
    checkSession,
    initializeSession,
    clearError,
    loadUserData,
  }
}
