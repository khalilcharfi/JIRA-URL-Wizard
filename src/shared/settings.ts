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
  showAdvancedSettings: boolean
}

// Import the environment variable
const SHOW_ADVANCED_SETTINGS = process.env.PLASMO_PUBLIC_SHOW_ADVANCED_SETTINGS === "true"

export const DEFAULT_SETTINGS: SettingsStorage = {
  theme: "system",
  prefixes: ["JIRA", "CHECK", "CHECK24", "CHECK24-"],
  ticketTypes: ["Task", "Bug", "Story", "Epic", "Sub-task"],
  urls: {
    mobile: "https://jira.check24.de/browse",
    desktop: "https://jira.check24.de/browse",
    bo: "https://jira.check24.de/browse",
    drupal7: "https://jira.check24.de/browse",
    drupal9: "https://jira.check24.de/browse",
  },
  jiraPatterns: [],
  isDarkMode: false,
  integrateQrImage: false,
  useMarkdownCopy: false,
  language: "en",
  urlStructure: ["ticketType", ".", "issuePrefix", "-", "[0-9]+", "baseUrl"],
  allowManualTicketInput: true,
  showAdvancedSettings: SHOW_ADVANCED_SETTINGS,
}

// Add a default sample ticket ID
export const DEFAULT_SAMPLE_TICKET_ID = "EXAMPLE-123"; 