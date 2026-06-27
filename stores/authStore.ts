import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants/config';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        set({ token, isAuthenticated: true });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
