import type { SettingsStorage } from "../shared/settings";
import { DEFAULT_SETTINGS } from "../shared/settings";

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
    const result = await chrome.storage.sync.get(SETTINGS_KEY);
    const loadedSettings = result[SETTINGS_KEY];

    // Deep merge loaded settings with defaults
    // This ensures fallbacks for missing nested properties (like urls)
    const mergedSettings = deepMerge(DEFAULT_SETTINGS, loadedSettings || {});

    // Basic validation might still be useful here, but deepMerge handles missing keys
    if (typeof mergedSettings !== 'object' || mergedSettings === null) {
        console.warn('Invalid settings structure after merge, returning defaults.');
        return DEFAULT_SETTINGS; // Should ideally not happen with deepMerge
    }

    return mergedSettings as SettingsStorage;

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

// Optional: Add functions for listening to changes if needed elsewhere
export const addSettingsListener = (
  callback: (newSettings: SettingsStorage) => void
): void => {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[SETTINGS_KEY]) {
      // Merge with defaults for safety
      const updatedSettings = { ...DEFAULT_SETTINGS, ...changes[SETTINGS_KEY].newValue };
      callback(updatedSettings);
    }
  };
  chrome.storage.onChanged.addListener(listener);
};

export const removeSettingsListener = (
  callback: (newSettings: SettingsStorage) => void
): void => {
   // Note: Removing the exact listener function reference might be tricky
   // depending on how it's implemented in the consuming component.
   // A simpler approach might be to pass the listener function itself.
   // However, for basic cases, this structure shows the intent.
  chrome.storage.onChanged.removeListener(callback as any); // Cast needed if function signature differs slightly
}; 