import i18n from '../i18n/config';
import type { SettingsStorage } from "../shared/settings";
import { saveSettings, getSettings } from './storageService';

// Helper function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
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
        ? navigator.language.split('-')[0]
        : language;
    await i18n.changeLanguage(actualLanguage);
    
    // Only try to use localStorage if it's available (not in service workers)
    if (isLocalStorageAvailable()) {
      localStorage.setItem('i18nextLng', actualLanguage); // Keep localStorage cache in sync
    }
    
    console.log(
      `i18n language instance set to: ${actualLanguage} (preference: ${language})`
    );
  } catch (error) {
    console.error('Error setting i18n language instance:', error);
    // Decide on error handling: maybe try fallback?
    // For now, just re-throw or log.
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
    
    console.log(`Language changed to ${language} (actual: ${actualLanguage}) and saved permanently`);
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};
*/

/**
 * Gets the current language set in i18next
 * @returns The current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

/**
 * Gets the current language preference from settings
 * @returns A Promise that resolves with the language preference ('en', 'de', 'auto')
 */
export const getLanguagePreference = async (): Promise<string> => {
  try {
    const settings = await getSettings();
    return settings.language || 'auto';
  } catch (error) {
    console.error('Error getting language preference:', error);
    return 'auto'; // Default fallback
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
    console.log(`Language initialized based on preference: ${languagePref}`);

  } catch (error) {
    console.error('Error initializing language:', error);
    // Fallback to browser language if there's an error during init
    try {
      const fallbackLanguage = navigator.language.split('-')[0] || 'en';
      await setI18nLanguage(fallbackLanguage); // Use the new function for fallback
      console.log(`Language initialization failed, using fallback: ${fallbackLanguage}`);
    } catch (fallbackError) {
       console.error('Error setting fallback language:', fallbackError);
    }
  }
}; 