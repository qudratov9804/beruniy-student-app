import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'uz';

export const resolveDeviceLanguage = (): SupportedLanguage => {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLanguageCode ?? '')
    ? (deviceLanguageCode as SupportedLanguage)
    : DEFAULT_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: resolveDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
