import type { Settings as SettingsStorage } from "../utils/settings";
import { defaultSettings as DEFAULT_SETTINGS } from "../utils/settings";

const SETTINGS_KEY = "jiraUrlWizardSettings";

/**
 * Deeply merges two objects. Used for merging loaded settings with defaults.
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Retrieves the settings from chrome.storage.sync.
 * Performs a deep merge with default settings to ensure all keys are present and fallbacks are used.
 */
export const getSettings = async (): Promise<SettingsStorage> => {
  try {
    // Define expected structure for the storage result
    const result: { [key: string]: Partial<SettingsStorage> | undefined } = 
      await chrome.storage.sync.get(SETTINGS_KEY);
      
    const loadedSettings = result[SETTINGS_KEY] || {}; // Use empty object if undefined

    // Deep merge loaded settings with defaults
    const mergedSettings: SettingsStorage = deepMerge(DEFAULT_SETTINGS, loadedSettings);

    // Validate required fields after merge (optional but good practice)
    if (!mergedSettings.urls || typeof mergedSettings.urls !== 'object') {
      console.warn('Settings validation failed: urls object missing or invalid after merge. Using default URLs.');
      mergedSettings.urls = DEFAULT_SETTINGS.urls;
    } else {
      // Ensure all required URL keys exist, using defaults if necessary
      for (const key of Object.keys(DEFAULT_SETTINGS.urls) as Array<keyof SettingsStorage['urls']>) {
        if (typeof mergedSettings.urls[key] !== 'string') {
          console.warn(`Settings validation: Missing or invalid URL for ${key}. Using default.`);
          mergedSettings.urls[key] = DEFAULT_SETTINGS.urls[key];
        }
      }
    }
    
    // Validate other potentially complex fields if needed
    if (!Array.isArray(mergedSettings.jiraPatterns)) {
      console.warn('Settings validation failed: jiraPatterns missing or invalid. Using default.');
      mergedSettings.jiraPatterns = DEFAULT_SETTINGS.jiraPatterns;
    }
    // ... add more validations as needed ...

    return mergedSettings; // Now guaranteed to conform better to SettingsStorage

  } catch (error) {
    console.error("Error getting settings from storage:", error);
    return DEFAULT_SETTINGS; // Return default settings on error
  }
};

/**
 * Saves the provided settings object to chrome.storage.sync.
 */
export const saveSettings = async (settings: SettingsStorage): Promise<void> => {
  try {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
  } catch (error) {
    console.error("Error saving settings to storage:", error);
    // Optional: Re-throw or handle the error as needed
    throw error; // Re-throwing allows the caller to know about the failure
  }
};

/**
 * Adds a listener for changes to the settings.
 */
export const addSettingsListener = (
  callback: (newSettings: SettingsStorage) => void
): void => {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[SETTINGS_KEY]) {
      // Use deepMerge for consistency with getSettings
      const updatedSettings = deepMerge(DEFAULT_SETTINGS, changes[SETTINGS_KEY].newValue || {});
      callback(updatedSettings);
    }
  };
  chrome.storage.onChanged.addListener(listener);
};

/**
 * Removes a listener for changes to the settings.
 */
export const removeSettingsListener = (
  callback: (newSettings: SettingsStorage) => void
): void => {
   // Keep the listener function reference passed directly for removal
  chrome.storage.onChanged.removeListener(callback as any); // Keep cast for now, might need refinement if listener signature causes issues
}; 