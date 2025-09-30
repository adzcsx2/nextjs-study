import { User } from "@/types/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  // 用户信息
  user: User | null;
  // 认证令牌
  token: string | null;
  // 是否已登录
  isAuthenticated: boolean;

  // Actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token?: string) => {
        // 如果提供了token，保存到localStorage (与http.ts兼容)
        if (token) {
          localStorage.setItem("token", token);
        }

        set({
          user,
          token: token || localStorage.getItem("token"),
          isAuthenticated: true,
        });
      },

      logout: () => {
        // 清除localStorage中的token
        localStorage.removeItem("token");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      setToken: (token: string) => {
        localStorage.setItem("token", token);
        set({ token });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 可以选择哪些字段持久化
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // token不在这里持久化，因为它已经在localStorage中单独管理了
      }),
    }
  )
);
