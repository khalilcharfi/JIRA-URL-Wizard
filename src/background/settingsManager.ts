import { DEFAULT_SETTINGS, type SettingsStorage } from '../shared/settings';
import { Storage } from '@plasmohq/storage';

// Initialize Storage
const storage = new Storage();
const STORAGE_KEY = 'settings';

/**
 * Get all settings from browser storage
 * @returns Promise that resolves to the complete settings object
 */
export const getAllSettings = async (): Promise<SettingsStorage> => {
  try {
    // Try to get settings from storage
    const storedSettings = await storage.get(STORAGE_KEY);
    
    if (storedSettings) {
      // Parse stored settings if they're a string, or use directly if object
      const parsedSettings = typeof storedSettings === 'string' 
        ? JSON.parse(storedSettings) 
        : storedSettings;
      
      // Merge with default settings to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsedSettings
      };
    }
    
    // If no settings found, return defaults
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    // On error, return default settings
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save all settings to browser storage
 * @param settings The complete settings object to save
 * @returns Promise that resolves to a boolean indicating success
 */
export const saveAllSettings = async (settings: SettingsStorage): Promise<boolean> => {
  try {
    await storage.set(STORAGE_KEY, settings);
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

/**
 * Update specific settings fields
 * @param updatedFields Partial settings object with just the fields to update
 * @returns Promise that resolves to a boolean indicating success
 */
export const updateSettings = async (updatedFields: Partial<SettingsStorage>): Promise<boolean> => {
  try {
    // Get current settings
    const currentSettings = await getAllSettings();
    
    // Merge with updated fields
    const newSettings = {
      ...currentSettings,
      ...updatedFields
    };
    
    // Save merged settings
    return await saveAllSettings(newSettings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return false;
  }
};

/**
 * Get a specific setting by key
 * @param key The setting key path (dot notation supported, e.g. "urls.bo")
 * @param defaultValue Optional default value if setting not found
 * @returns Promise that resolves to the setting value or defaultValue
 */
export const getSetting = async <T>(key: string, defaultValue?: T): Promise<T> => {
  try {
    const settings = await getAllSettings();
    
    // Handle dot notation (e.g., "urls.bo")
    if (key.includes('.')) {
      const parts = key.split('.');
      let value: any = settings;
      
      for (const part of parts) {
        if (value === undefined || value === null) {
          return defaultValue as T;
        }
        value = value[part];
      }
      
      return value !== undefined ? value : defaultValue as T;
    }
    
    // Simple key access
    const value = (settings as any)[key];
    return value !== undefined ? value : defaultValue as T;
  } catch (error) {
    console.error(`Failed to get setting "${key}":`, error);
    return defaultValue as T;
  }
};

/**
 * Quick way to check if a feature flag is enabled
 * @param flag The feature flag key
 * @param defaultValue Default value if flag not found (defaults to false)
 * @returns Promise that resolves to a boolean
 */
export const isFeatureEnabled = async (flag: keyof SettingsStorage, defaultValue = false): Promise<boolean> => {
  const value = await getSetting<boolean>(flag, defaultValue);
  return Boolean(value);
};

/**
 * Clear all settings and reset to defaults
 * @returns Promise that resolves to a boolean indicating success
 */
export const resetSettings = async (): Promise<boolean> => {
  try {
    await storage.set(STORAGE_KEY, DEFAULT_SETTINGS);
    return true;
  } catch (error) {
    console.error('Failed to reset settings:', error);
    return false;
  }
};

/**
 * Listen for settings changes from other parts of the extension
 * @param callback Function to execute when settings change
 * @returns Cleanup function to remove the listener
 */
export const onSettingsChanged = (
  callback: (newSettings: SettingsStorage, oldSettings?: SettingsStorage) => void
): (() => void) => {
  const changeListener = async (changes: { [key: string]: any }, areaName: string) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      const newSettings = changes[STORAGE_KEY].newValue;
      const oldSettings = changes[STORAGE_KEY].oldValue;
      
      callback(
        typeof newSettings === 'string' ? JSON.parse(newSettings) : newSettings,
        typeof oldSettings === 'string' ? JSON.parse(oldSettings) : oldSettings
      );
    }
  };
  
  // Add listener
  chrome.storage.onChanged.addListener(changeListener);
  
  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(changeListener);
  };
}; 