import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './assets/en';
import de from './assets/de';

// Check if we're in a browser environment where localStorage and window are available
const isStorageAvailable = (): boolean => {
  try {
    // Check if window exists (will throw in service workers)
    if (typeof window === 'undefined') return false;
    
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
    translation: en
  },
  de: {
    translation: de
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n; 