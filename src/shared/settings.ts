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
  prefixes: [],
  ticketTypes: [],
  urls: {
    mobile: "",
    desktop: "",
    bo: "",
    drupal7: "",
    drupal9: "",
  },
  jiraPatterns: [],
  integrateQrImage: false,
  useMarkdownCopy: false,
  language: "en",
  urlStructure: ["ticketType", ".", "issuePrefix", "-", "[0-9]+", "baseUrl"],
  allowManualTicketInput: true,
  showAdvancedSettings: SHOW_ADVANCED_SETTINGS,
}

// Add a default sample ticket ID
export const DEFAULT_SAMPLE_TICKET_ID = "EXAMPLE-123"; 