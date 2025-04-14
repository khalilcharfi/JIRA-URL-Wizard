import i18n from 'i18next';
import type { SettingsStorage } from "../shared/settings";
import { saveSettings, getSettings } from './storageService';

/**
 * Changes the application language and saves to settings
 * @param language The language code ('en', 'de', 'auto', etc.)
 * @returns A Promise that resolves when the language is changed and settings are saved
 */
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
 * Initializes language based on settings or browser preference
 * This is called on extension startup and ensures consistent language across sessions
 * @returns A Promise that resolves when initialization is complete
 */
export const initializeLanguage = async (): Promise<void> => {
  try {
    // First try to get the saved language preference from settings
    const settings = await getSettings();
    const languagePref = settings.language || 'auto';
    
    // Check if there's a stored language in localStorage 
    // This would have been set by previous use of the extension
    const storedLang = localStorage.getItem('i18nextLng');
    
    if (languagePref === 'auto') {
      // If set to auto, use browser language or the previously stored language
      const detectedLang = navigator.language.split('-')[0];
      await i18n.changeLanguage(detectedLang);
      localStorage.setItem('i18nextLng', detectedLang);
      console.log(`Language initialized to auto (detected: ${detectedLang})`);
    } else {
      // Use explicit language preference from settings
      await i18n.changeLanguage(languagePref);
      localStorage.setItem('i18nextLng', languagePref);
      console.log(`Language initialized to explicit preference: ${languagePref}`);
    }
  } catch (error) {
    console.error('Error initializing language:', error);
    // Fallback to browser language if there's an error
    const fallbackLanguage = navigator.language.split('-')[0];
    await i18n.changeLanguage(fallbackLanguage);
    localStorage.setItem('i18nextLng', fallbackLanguage);
    console.log(`Language initialization failed, using fallback: ${fallbackLanguage}`);
  }
}; 