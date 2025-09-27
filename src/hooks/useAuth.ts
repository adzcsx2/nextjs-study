import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useAuth = () => {
  const { user, isAuthenticated, logout: authLogout } = useAuthStore()
  const router = useRouter()

  const logout = () => {
    authLogout()
    router.push('/login')
  }

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }

  return {
    user,
    isAuthenticated,
    logout,
    requireAuth,
  }
}

// Hook用于需要认证的页面
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  return { isAuthenticated }
}