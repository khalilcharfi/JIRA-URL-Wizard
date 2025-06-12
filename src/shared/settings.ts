export interface JiraPattern {
  pattern: string
  description?: string
  enabled?: boolean
}

export interface SettingsStorage {
  urls: {
    bo: string;
    mobile: string;
    desktop: string;
    drupal7: string;
    drupal9: string;
  };
  ticketTypes: string[];
  prefixes: string[];
  urlStructure: string[];
  theme?: 'light' | 'dark' | 'system';
  jiraPatterns?: JiraPattern[];
  integrateQrImage?: boolean;
  useMarkdownCopy?: boolean;
  showCopiedNotification?: boolean;
  showPreviewOnHover?: boolean;
  enableAdvancedUrlPatterns?: boolean;
  autoSavePatterns?: boolean;
  language?: string;
  allowManualTicketInput?: boolean;
  showAdvancedSettings?: boolean;
  markdownTemplate?: string;
  ticketPrefix?: string;  // Current ticket prefix for URL generation
  drupal7Prefix?: string; // Drupal 7 environment prefix
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
  ticketPrefix: "",
  drupal7Prefix: "ffmfvk-2822",
  markdownTemplate: `🌐💻 Frontend Environments
- **🛠️ Back Office Tool** → [{URL_BO}]({URL_BO})
- **📱 Mobile Version** → [{URL_MOBILE}]({URL_MOBILE})
- **🖥️ Desktop Version** → [{URL_DESKTOP}]({URL_DESKTOP})
---
📝📚 CMS Environments
💧7️⃣ ## **Drupal 7**
- **Base CMS** → [{URL_DRUPAL7}]({URL_DRUPAL7})
- **Desktop View** → [{URL_DRUPAL7}?deviceoutput=desktop]({URL_DRUPAL7}?deviceoutput=desktop)
- **Mobile View** → [{URL_DRUPAL7}?deviceoutput=mobile]({URL_DRUPAL7}?deviceoutput=mobile)
💧9️⃣ ## **Drupal 9**
- **Desktop View** → [{URL_DRUPAL9}?deviceoutput=desktop]({URL_DRUPAL9}?deviceoutput=desktop)
- **Mobile View** → [{URL_DRUPAL9}?deviceoutput=mobile]({URL_DRUPAL9}?deviceoutput=mobile)
`,
}

// Add a default sample ticket ID
export const DEFAULT_SAMPLE_TICKET_ID = "EXAMPLE-123"; 