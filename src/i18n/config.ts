import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './assets/en';
import de from './assets/de';

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