import { create } from 'zustand';
import { LoggedInUser } from '@/lib/api/types';

interface AuthState {
  user: LoggedInUser | null;
  isAuthenticated: boolean;
  setUser: (user: LoggedInUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));