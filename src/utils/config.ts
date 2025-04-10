import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function for safe JSON parsing
export const parseJsonSafe = (jsonString: string | undefined, defaultValue: any): any => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON environment variable:", e);
    return defaultValue;
  }
};

// Environment variables
export const DEFAULT_THEME = process.env.PLASMO_PUBLIC_DEFAULT_THEME || 'system';
export const DEFAULT_PREFIXES = parseJsonSafe(process.env.PLASMO_PUBLIC_DEFAULT_PREFIXES, []);
export const DEFAULT_TICKET_TYPES = parseJsonSafe(process.env.PLASMO_PUBLIC_DEFAULT_TICKET_TYPES, []);
export const DEFAULT_URLS = parseJsonSafe(process.env.PLASMO_PUBLIC_DEFAULT_URLS, {});
export const DEFAULT_JIRA_PATTERNS = parseJsonSafe(process.env.PLASMO_PUBLIC_DEFAULT_JIRA_PATTERNS, []);
export const DEFAULT_SAMPLE_TICKET_ID = process.env.PLASMO_PUBLIC_DEFAULT_SAMPLE_TICKET_ID || '123';
export const DEFAULT_TOAST_TIMEOUT_MS = parseInt(process.env.PLASMO_PUBLIC_TOAST_TIMEOUT_MS || '3000', 10); 