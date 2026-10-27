import { create } from 'zustand';
import { authService, LoginCredentials, SignupCredentials } from '@/services/auth.service';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuth: (user: User | null, token: string | null) => void;
  initializeAuth: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token: string | null) =>
    set({ token, isAuthenticated: Boolean(token) }),

  setUser: (user: User | null) =>
    set({ user }),

  setAuth: (user: User | null, token: string | null) =>
    set({ user, token, isAuthenticated: Boolean(user && token) }),

  initializeAuth: async () => {
    try {
      const res = await authService.getCurrentSession();
      if (res.data) {
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      // Ignore session restore error
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(credentials);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true });
    try {
      const res = await authService.signup(credentials);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

}));
