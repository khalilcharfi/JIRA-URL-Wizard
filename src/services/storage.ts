import { Storage } from "@plasmohq/storage";

// Define the structure for a JIRA pattern
export interface JiraPattern {
  pattern: string;
  description?: string;
}

// Define the structure for URLs
export interface Urls {
  bo: string;
  mobile: string;
  desktop: string;
  drupal7: string;
  drupal9: string;
}

// Define the structure for all settings
export interface Settings {
  theme: "light" | "dark";
  language: string;
  prefixes: string[];
  ticketTypes: string[];
  urls: Urls;
  jiraPatterns: JiraPattern[];
  integrateQrImage: boolean;
  useMarkdownCopy: boolean;
  urlStructure: string[];
  exportedAt: string;
}

// --- Constants ---

const STORAGE_KEY = "appSettings";

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  language: "en",
  prefixes: ["FFMFVK"],
  ticketTypes: [],
  urls: {
    bo: "https://bo.fahrradversicherung.check24-int.de",
    mobile: "https://m.fahrradversicherung.check24-int.de",
    desktop: "https://desktop.fahrradversicherung.check24-int.de",
    drupal7: "https://cms1.sach.vv.check24-int.de/fahrradversicherung",
    drupal9: "https://cms2.sach.vv.check24-int.de/fahrradversicherung",
  },
  jiraPatterns: [
    {
      pattern:
        "^https://example-jira\\.example\\.com/jira/software/c/projects/EXAMPLE/.*selectedIssue=EXAMPLE-\\d+",
    },
    {
      pattern: "^https://example-jira\\.example\\.com/browse/EXAMPLE-\\d+",
    },
  ],
  integrateQrImage: false,
  useMarkdownCopy: false,
  urlStructure: [
    "ticketType",
    ".",
    "issuePrefix",
    "-",
    "[0-9]+",
    "baseUrl",
  ],
  exportedAt: new Date().toISOString(),
};

// Fallback settings (used when stored settings are corrupted or missing)
// You might want to keep this identical to DEFAULT_SETTINGS or customize it
export const FALLBACK_SETTINGS: Settings = {
  ...DEFAULT_SETTINGS,
  // Optionally override specific fallback values here if needed
  exportedAt: new Date().toISOString(), // Ensure fallback has a current timestamp
};

// --- Plasmo Storage Instance ---

const storage = new Storage({
  area: "local", // Use local storage area
});

// --- Validation Helper ---

// Helper function to validate settings structure and types
function validateSettings(settings: any): settings is Settings {
  if (typeof settings !== "object" || settings === null) return false;

  const checkString = (val: any) => typeof val === "string";
  const checkBoolean = (val: any) => typeof val === "boolean";
  const checkStringArray = (val: any) =>
    Array.isArray(val) && val.every(checkString);
  const checkJiraPatternArray = (val: any) =>
    Array.isArray(val) &&
    val.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        checkString(item.pattern) &&
        (item.description === undefined || checkString(item.description))
    );

  try {
    return (
      (settings.theme === "light" || settings.theme === "dark") &&
      checkString(settings.language) &&
      checkStringArray(settings.prefixes) &&
      checkStringArray(settings.ticketTypes) &&
      typeof settings.urls === "object" &&
      settings.urls !== null &&
      checkString(settings.urls.bo) &&
      checkString(settings.urls.mobile) &&
      checkString(settings.urls.desktop) &&
      checkString(settings.urls.drupal7) &&
      checkString(settings.urls.drupal9) &&
      checkJiraPatternArray(settings.jiraPatterns) &&
      checkBoolean(settings.integrateQrImage) &&
      checkBoolean(settings.useMarkdownCopy) &&
      checkStringArray(settings.urlStructure) &&
      checkString(settings.exportedAt)
    );
  } catch (e) {
    console.error("Settings validation failed:", e);
    return false;
  }
}

// --- Core Storage Functions ---

/**
 * Gets all settings from storage.
 * If settings are missing or invalid, returns fallback settings and saves them.
 */
export async function getSettings(): Promise<Settings> {
  const result = await storage.get<Settings>(STORAGE_KEY);

  if (validateSettings(result)) {
    return result;
  } else {
    console.warn(
      "Invalid or missing settings detected in storage, using fallback settings."
    );
    // Save fallback settings to storage to correct the state
    await storage.set(STORAGE_KEY, FALLBACK_SETTINGS);
    return FALLBACK_SETTINGS;
  }
}

/**
 * Saves the entire settings object to storage after validation.
 * Throws an error if the provided settings are invalid.
 */
export async function saveSettings(settings: Settings): Promise<void> {
  if (validateSettings(settings)) {
    await storage.set(STORAGE_KEY, settings);
  } else {
    console.error("Attempted to save invalid settings:", settings);
    throw new Error("Invalid settings object provided.");
  }
}

// --- Specific Setting Accessors ---

/**
 * Gets a specific setting value by key.
 * Uses the main getSettings function which includes fallback logic.
 */
export async function getSetting<K extends keyof Settings>(
  key: K
): Promise<Settings[K]> {
  const settings = await getSettings();
  return settings[key];
}

/**
 * Updates a specific setting value by key.
 * Fetches current settings, updates the key, validates, and saves.
 */
export async function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  const settings = await getSettings();
  const updatedSettings = { ...settings, [key]: value };
  // saveSettings includes validation
  await saveSettings(updatedSettings);
}

// --- Convenience Wrappers for Settings ---

// Example: JIRA Patterns
export const getJiraPatterns = (): Promise<JiraPattern[]> =>
  getSetting("jiraPatterns");
export const saveJiraPatterns = (patterns: JiraPattern[]): Promise<void> =>
  updateSetting("jiraPatterns", patterns);

export async function addJiraPattern(pattern: JiraPattern): Promise<void> {
  const patterns = await getJiraPatterns();
  await saveJiraPatterns([...patterns, pattern]);
}

export async function updateJiraPattern(
  index: number,
  pattern: JiraPattern
): Promise<void> {
  const patterns = await getJiraPatterns();
  if (index >= 0 && index < patterns.length) {
    const updatedPatterns = [...patterns];
    updatedPatterns[index] = pattern;
    await saveJiraPatterns(updatedPatterns);
  }
}

export async function removeJiraPattern(index: number): Promise<void> {
  const patterns = await getJiraPatterns();
  if (index >= 0 && index < patterns.length) {
    const updatedPatterns = patterns.filter((_, i) => i !== index);
    await saveJiraPatterns(updatedPatterns);
  }
}

// Example: URLs
export const getUrls = (): Promise<Urls> => getSetting("urls");
export const updateUrls = (urls: Urls): Promise<void> => updateSetting("urls", urls);

// Example: Theme
export const getTheme = (): Promise<"light" | "dark"> => getSetting("theme");
export const updateTheme = (theme: "light" | "dark"): Promise<void> =>
  updateSetting("theme", theme);

// ... Add similar convenience wrappers for other settings as needed ...
// getPrefixes, updatePrefixes, getTicketTypes, updateTicketTypes, etc.

// --- Utility Functions Using Settings ---

/**
 * Checks if a URL matches any of the stored JIRA patterns.
 * Returns the matching JiraPattern object or null if no match.
 */
export async function checkUrlMatch(url: string): Promise<JiraPattern | null> {
  if (!url) return null;
  const patterns = await getJiraPatterns();
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.pattern);
      if (regex.test(url)) {
        return pattern;
      }
    } catch (e) {
      console.error(`Invalid regex pattern skipped: ${pattern.pattern}`, e);
    }
  }
  return null;
} 