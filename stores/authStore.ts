import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants/config';
import type { User } from '@/types';

const storage = {
  get: (key: string) => {
    if (Platform.OS === 'web') {
      try { return Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null); }
      catch { return Promise.resolve(null); }
    }
    return SecureStore.getItemAsync(key);
  },
  set: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); }
      catch {}
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  del: (key: string) => {
    if (Platform.OS === 'web') {
      try { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); }
      catch {}
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPin: boolean;
  isBiometricEnabled: boolean;
  setUser: (user: User) => void;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  removePin: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  hasPin: false,
  isBiometricEnabled: false,

  setUser: (user) => set({ user }),

  setAuth: async (user, token) => {
    await storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: async () => {
    await storage.del(STORAGE_KEYS.ACCESS_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const [token, pin, biometric] = await Promise.all([
        storage.get(STORAGE_KEYS.ACCESS_TOKEN),
        storage.get(STORAGE_KEYS.PIN),
        storage.get(STORAGE_KEYS.BIOMETRIC_ENABLED),
      ]);
      if (token) {
        set({
          token,
          isAuthenticated: true,
          hasPin: !!pin,
          isBiometricEnabled: biometric === 'true',
        });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  setupPin: async (pin: string) => {
    await storage.set(STORAGE_KEYS.PIN, pin);
    set({ hasPin: true });
  },

  verifyPin: async (pin: string) => {
    const stored = await storage.get(STORAGE_KEYS.PIN);
    return stored === pin;
  },

  removePin: async () => {
    await storage.del(STORAGE_KEYS.PIN);
    await storage.del(STORAGE_KEYS.BIOMETRIC_ENABLED);
    set({ hasPin: false, isBiometricEnabled: false });
  },

  enableBiometric: async () => {
    await storage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    set({ isBiometricEnabled: true });
  },

  disableBiometric: async () => {
    await storage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
    set({ isBiometricEnabled: false });
  },
}));
