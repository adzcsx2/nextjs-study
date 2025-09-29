import { LoginRes } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: LoginRes | null;
  setUser: (user: LoginRes) => void;
  logout: () => void;
  getUser: () => LoginRes | null;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: LoginRes) => set({ user }),
      logout: () => set({ user: null }),
      getUser: () => get().user,
    }),
    {
      name: "user-storage", // localStorage key
    }
  )
);
