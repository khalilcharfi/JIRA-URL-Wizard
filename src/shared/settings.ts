export interface JiraPattern {
  pattern: string
  description?: string
  enabled?: boolean
}

export interface SettingsStorage {
  theme: "light" | "dark" | "system"
  prefixes: string[]
  ticketTypes: string[]
  urls: {
    mobile: string
    desktop: string
    bo: string
    drupal7: string
    drupal9: string
  }
  jiraPatterns: JiraPattern[]
  isDarkMode: boolean
  integrateQrImage: boolean
  useMarkdownCopy: boolean
  language: string
  urlStructure: string[]
  allowManualTicketInput: boolean
}

export const DEFAULT_SETTINGS: SettingsStorage = {
  theme: "system",
  prefixes: [],
  ticketTypes: [],
  urls: {
    mobile: "",
    desktop: "",
    bo: "",
    drupal7: "",
    drupal9: ""
  },
  jiraPatterns: [
    { pattern: "[A-Z]+-\\d+" } // Common JIRA pattern (e.g., ABC-123)
  ],
  isDarkMode: false, // This likely isn't needed in storage, derived from theme
  integrateQrImage: false,
  useMarkdownCopy: false,
  language: "auto",
  urlStructure: ["ticketType", ".", "issuePrefix", "-", "[0-9]+", "baseUrl"],
  allowManualTicketInput: false
}

// Add a default sample ticket ID
export const DEFAULT_SAMPLE_TICKET_ID = "EXAMPLE-123"; 