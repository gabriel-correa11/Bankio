import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoadingAuth: boolean;
  setUser: (user: User | null) => void;
  setLoadingAuth: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,
  setUser: (user) => set({ user }),
  setLoadingAuth: (loading) => set({ isLoadingAuth: loading }),
}));
