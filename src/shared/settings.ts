export interface JiraPattern {
  pattern: string
  description?: string
}

export interface SettingsStorage {
  theme: "light" | "dark" | "system"
  prefixes: string[]
  ticketTypes: string[]
  urls: Record<string, string>
  jiraPatterns: JiraPattern[]
  isDarkMode: boolean
  integrateQrImage: boolean
  useMarkdownCopy: boolean
  language: string
  urlStructure: string[]
}

export const DEFAULT_SETTINGS: SettingsStorage = {
  theme: "system",
  prefixes: [],
  ticketTypes: [],
  urls: {},
  jiraPatterns: [
    { pattern: "[A-Z]+-\\d+" } // Common JIRA pattern (e.g., ABC-123)
  ],
  isDarkMode: false, // This likely isn't needed in storage, derived from theme
  integrateQrImage: false,
  useMarkdownCopy: false,
  language: "auto",
  urlStructure: ["ticketType", ".", "issuePrefix", "-", "[0-9]+", "baseUrl"]
} 