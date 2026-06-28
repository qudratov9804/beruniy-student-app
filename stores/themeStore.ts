import { create } from 'zustand';
import { Platform } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const safeGet = (key: string): string | null => {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return null;
};

const safeSet = (key: string, value: string) => {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {}
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: (safeGet('theme_mode') as ThemeMode) ?? 'system',
  setMode: (mode) => {
    safeSet('theme_mode', mode);
    set({ mode });
  },
}));
