import { create } from "zustand";

type UserStore = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  description?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
};

type UserState = {
  user: UserStore;
  setUser: (user: UserStore) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: { id: 0, email: "", first_name: "", last_name: "", profile_image: "" },
  setUser: (user) => set({ user }),
  clearUser: () =>
    set({
      user: {
        id: 0,
        email: "",
        first_name: "",
        last_name: "",
        profile_image: "",
      },
    }),
}));
