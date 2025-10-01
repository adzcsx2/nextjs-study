import { User } from "@/types/user";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HomeTitle {
  title?: string;
}

export const useHomeTitle = create<HomeTitle>()((set, get) => ({
  title: undefined,
  setTitle: (title: string) => set({ title }),
  getTitle: () => get().title,
}));
