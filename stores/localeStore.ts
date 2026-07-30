import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage, resolveDeviceLanguage } from '@/i18n';

export type LocaleMode = 'system' | SupportedLanguage;

const STORAGE_KEY = 'locale_mode';

interface LocaleState {
  mode: LocaleMode;
  hydrated: boolean;
  resolvedLanguage: SupportedLanguage;
  setMode: (mode: LocaleMode) => void;
}

const resolveLanguage = (mode: LocaleMode): SupportedLanguage =>
  mode === 'system' ? resolveDeviceLanguage() : mode;

export const useLocaleStore = create<LocaleState>((set) => ({
  mode: 'system',
  hydrated: false,
  resolvedLanguage: resolveLanguage('system'),
  setMode: (mode) => {
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
    set({ mode, resolvedLanguage: resolveLanguage(mode) });
  },
}));

AsyncStorage.getItem(STORAGE_KEY)
  .then((stored) => {
    const mode = (stored as LocaleMode) ?? 'system';
    useLocaleStore.setState({ mode, resolvedLanguage: resolveLanguage(mode), hydrated: true });
  })
  .catch(() => {
    useLocaleStore.setState({ hydrated: true });
  });
