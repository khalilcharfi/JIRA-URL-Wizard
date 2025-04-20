import i18n from '../i18n/config';
import { getSettings } from './storageService';
import { Storage } from '@plasmohq/storage';
import { initReactI18next } from 'react-i18next';

// Import resources
import de from '../i18n/assets/de';
import en from '../i18n/assets/en';

// Define resources object
const resources = {
  en: {
    translation: en
  },
  de: {
    translation: de
  }
};

// Helper function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Sets the application's active language instance (for immediate UI update)
 * and updates localStorage.
 * @param language The language code ('en', 'de', 'auto', etc.)
 * @returns A Promise that resolves when the language instance is set.
 */
export const setI18nLanguage = async (language: string): Promise<void> => {
  try {
    const actualLanguage =
      language === 'auto'
        ? (navigator.language?.split('-')[0] || 'en')
        : language;
    await i18n.changeLanguage(actualLanguage);
    
    // Only try to use localStorage if it's available (not in service workers)
    if (isLocalStorageAvailable()) {
      localStorage.setItem('i18nextLng', actualLanguage); // Keep localStorage cache in sync
    }
  } catch (error) {
    // Error handled silently
    throw error; 
  }
};

/**
 * [DEPRECATED by separation of concerns - use setI18nLanguage and saveSettings]
 * Changes the application language and saves to settings
 * @param language The language code ('en', 'de', 'auto', etc.)
 * @returns A Promise that resolves when the language is changed and settings are saved
 */
/*
export const changeLanguage = async (language: string): Promise<void> => {
  try {
    // Get the actual language code to use (either specified or from browser)
    const actualLanguage = language === 'auto' 
      ? navigator.language.split('-')[0]
      : language;
    
    // Change the i18next language
    await i18n.changeLanguage(actualLanguage);
    
    // Store the detection in localStorage for persistence across sessions
    localStorage.setItem('i18nextLng', actualLanguage);
    
    // Save the language preference in settings
    const settings = await getSettings();
    
    // Update only the language field in the settings
    await saveSettings({
      ...settings,
      language
    });
    
    console.error(`Language changed to ${language} (actual: ${actualLanguage}) and saved permanently`);
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};
*/

/**
 * Initialize the i18n service
 */
export const initI18n = async (): Promise<void> => {
  try {
    await i18n.use(initReactI18next).init({
      resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });

    // Set initial language from storage or browser
    const savedLanguage = await getLanguagePreference();
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    } else {
      // Use browser language as fallback
      const browserLang = navigator.language.split('-')[0];
      if (browserLang && Object.keys(resources).includes(browserLang)) {
        await i18n.changeLanguage(browserLang);
        await saveLanguagePreference(browserLang);
      }
    }
  } catch (error) {
    // Failed to initialize i18n - handled silently
  }
};

/** @internal */
const getLanguagePreference = async (): Promise<string | null> => {
  try {
    const storage = new Storage({ area: 'sync' });
    const language = await storage.get('language');
    if (typeof language === 'string') {
      return language;
    }
    return null;
  } catch (error) {
    // Error getting language preference - handled silently
    return null;
  }
};

/**
 * Save the user's language preference
 */
export const saveLanguagePreference = async (language: string): Promise<void> => {
  try {
    const storage = new Storage({ area: 'sync' });
    await storage.set('language', language);
  } catch (error) {
    // Error saving language preference - handled silently
  }
};

/**
 * Initializes language based on settings or browser preference.
 * Uses setI18nLanguage internally.
 * @returns A Promise that resolves when initialization is complete
 */
export const initializeLanguage = async (): Promise<void> => {
  try {
    const settings = await getSettings();
    const languagePref = settings.language || 'auto';
    await setI18nLanguage(languagePref); // Use the new function
  } catch (error) {
    // Error initializing language - handled silently
    // Fallback to browser language if there's an error during init
    try {
      const fallbackLanguage = navigator.language.split('-')[0] || 'en';
      await setI18nLanguage(fallbackLanguage); // Use the new function for fallback
    } catch (fallbackError) {
      // Error setting fallback language - handled silently
    }
  }
}; 