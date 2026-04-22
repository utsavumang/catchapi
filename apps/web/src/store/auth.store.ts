import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setCredentials: (token: string, user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const getStoredUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: getStoredUser(),
  isLoading: true,
  isAuthenticated: false,

  setCredentials: (token, user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  setToken: (token) => {
    set({ token, isAuthenticated: true });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
