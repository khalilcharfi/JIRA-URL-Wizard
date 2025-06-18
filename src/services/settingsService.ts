import { DEFAULT_SETTINGS, type SettingsStorage } from '../shared/settings';

const STORAGE_KEY = 'jira-url-wizard-settings';

/**
 * Get all settings from storage
 * @returns The complete settings object
 */
export const getAllSettings = (): SettingsStorage => {
  try {
    // Try to get settings from localStorage
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    
    if (storedSettings) {
      // Parse stored settings
      const parsedSettings = JSON.parse(storedSettings) as SettingsStorage;
      
      // Merge with default settings to ensure all properties exist
      // This ensures backward compatibility if new settings were added
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
 * Save all settings to storage
 * @param settings The complete settings object to save
 * @returns Boolean indicating success
 */
export const saveAllSettings = (settings: SettingsStorage): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

/**
 * Update specific settings fields
 * @param updatedFields Partial settings object with just the fields to update
 * @returns Boolean indicating success
 */
export const updateSettings = (updatedFields: Partial<SettingsStorage>): boolean => {
  try {
    // Get current settings
    const currentSettings = getAllSettings();
    
    // Merge with updated fields
    const newSettings = {
      ...currentSettings,
      ...updatedFields
    };
    
    // Save merged settings
    return saveAllSettings(newSettings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return false;
  }
};

/**
 * Get a specific setting by key
 * @param key The setting key path (dot notation supported, e.g. "urls.bo")
 * @param defaultValue Optional default value if setting not found
 * @returns The setting value or defaultValue
 */
export const getSetting = <T>(key: string, defaultValue?: T): T => {
  try {
    const settings = getAllSettings();
    
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