import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { loginRes } from '@/types/login'

interface AuthState {
  // 用户信息
  user: loginRes | null
  // 认证令牌
  token: string | null
  // 是否已登录
  isAuthenticated: boolean
  
  // Actions
  login: (user: loginRes, token?: string) => void
  logout: () => void
  updateUser: (user: Partial<loginRes>) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: loginRes, token?: string) => {
        // 如果提供了token，保存到localStorage (与http.ts兼容)
        if (token) {
          localStorage.setItem('token', token)
        }
        
        set({
          user,
          token: token || localStorage.getItem('token'),
          isAuthenticated: true,
        })
      },

      logout: () => {
        // 清除localStorage中的token
        localStorage.removeItem('token')
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData: Partial<loginRes>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      setToken: (token: string) => {
        localStorage.setItem('token', token)
        set({ token })
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 可以选择哪些字段持久化
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // token不在这里持久化，因为它已经在localStorage中单独管理了
      }),
    }
  )
)