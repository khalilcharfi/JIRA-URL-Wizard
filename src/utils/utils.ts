// Helper function to safely parse JSON
const parseJsonSafe = (jsonString: string | undefined, defaultValue: any): any => {
    if (!jsonString) return defaultValue;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON environment variable:", e);
        return defaultValue;
    }
};

// Default values
export const DEFAULT_THEME = 'system';
export const DEFAULT_PREFIXES = [];
export const DEFAULT_TICKET_TYPES = [];
export const DEFAULT_URLS = {};
export const DEFAULT_JIRA_PATTERNS = [];
export const DEFAULT_SAMPLE_TICKET_ID = '123';
export const DEFAULT_TOAST_TIMEOUT_MS = 3000;
