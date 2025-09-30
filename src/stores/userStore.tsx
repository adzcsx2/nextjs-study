import { User } from "@/types/user";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  getUser: () => User | null;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      logout: () => set({ user: null }),
      getUser: () => get().user,
    }),
    {
      name: "user-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
