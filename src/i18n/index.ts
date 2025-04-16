import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './assets/en';
import deTranslation from './assets/de';

// Check if we're in a browser environment where localStorage is available
const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// the translations
const resources = {
  en: {
    translation: enTranslation
  },
  de: {
    translation: deTranslation
  }
};

// Configure detection options based on environment
const detectionOptions = isStorageAvailable() 
  ? {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    } 
  : {
      order: ['navigator', 'htmlTag'],
      caches: [] // No caching when localStorage is unavailable
    };

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // options for language detection
    detection: detectionOptions,
  });

export default i18n; 