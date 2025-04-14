export default {
  // Common UI elements
  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    close: "Close",
    ok: "OK",
    yes: "Yes",
    no: "No",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    copyUrl: "Copy URL",
    copyGeneratedUrl: "Copy Generated URL",
  },
  
  // Navigation and headers
  navigation: {
    home: "Home",
    settings: "Settings",
    help: "Help",
    about: "About",
    openSettings: "Open Settings",
    openExtensionSettings: "Open Extension Settings",
  },
  
  // Settings page
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    themes: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    urlConfig: "URL Configuration",
    jiraPatterns: "JIRA Patterns",
    advanced: "Advanced Settings",
    advancedDesc: "Display advanced configuration options in the settings page",
    export: "Export Settings",
    import: "Import Settings",
    importFileLabel: "Import settings file",
    reset: "Reset to Defaults",
    saveSuccess: "Settings saved successfully",
    saveError: "Failed to save settings",
    showAdvancedLabel: "Show advanced settings",
  },
  
  // URL related
  url: {
    bo: "Backend Office Tool",
    desktop: "Desktop web interface",
    mobile: "Mobile web interface",
    drupal7: "Legacy CMS system",
    drupal9: "Current CMS system",
    baseUrl: "Base URL",
    environments: "Frontend Environments",
    cms: "CMS Environments",
  },
  
  // JIRA related
  jira: {
    title: "JIRA Integration",
    pattern: "Pattern",
    enabled: "Enabled",
    addPattern: "Add New Pattern",
    editPattern: "Edit Pattern",
    deletePattern: "Delete Pattern",
    ticketTypes: "Ticket Types (Optional)",
    issuePrefixes: "Issue Prefixes",
    addPrefix: "Add prefix + Enter",
    addTicketType: "Add ticket type + Enter",
    invalidPattern: "Invalid pattern",
    patternMatches: "Pattern matches preview",
    enterRegexDirectly: "Enter Regex Directly",
    useUrlGeneration: "Use URL generation",
    generateFromSampleUrl: "Generate from Sample URL",
    sampleJiraUrl: "Sample JIRA URL",
    enablePattern: "Enable this pattern",
    patternPlaceholder: "Enter pattern (e.g., ^https://jira\\.example\\.com/browse/PROJ-\\d+)",
    urlPlaceholder: "e.g., https://jira.example.com/browse/PROJ-123",
    noPatterns: "No JIRA patterns defined. Click 'Add New Pattern' to start.",
    validateRegex: "Please enter a valid regular expression pattern",
    enterTicketId: "Enter Ticket ID",
    manualInputDisabled: "Manual ticket ID input is disabled in settings",
    applyTicketId: "Apply Ticket ID",
    refreshFromCurrentTab: "Refresh from Current Tab",
    copyEnvironmentLinks: "Copy Environment Links",
    recentTickets: "Recent Tickets",
    noRecentTickets: "No recent tickets",
    showRecentTickets: "Show Recent Tickets",
  },
  
  // Features
  features: {
    qrIntegration: "Integrate QR Code",
    qrIntegrationDesc: "Embed your logo in the center of QR codes (if applicable)",
    markdownCopy: "Use Markdown in Copy",
    markdownCopyDesc: "Copy content as Markdown format instead of plain text (if applicable)",
    manualTicketInput: "Allow manual ticket input",
    manualTicketInputDesc: "Enable manual ticket ID input in the popup interface",
    urlStructure: "URL Structure",
    qrIntegrationLabel: "Integrate logo within QR codes",
    markdownCopyLabel: "Use Markdown when copying",
  },
  
  // Sections
  sections: {
    prefixesTitle: "Prefixes & Ticket Types",
    prefixesInfo: "Define project prefixes (e.g., PROJ) and optional ticket types (e.g., BUG). Press Enter to add.",
    urlBuilderTitle: "URL Builder",
    urlStructureTitle: "URL Structure",
    urlBuilderInfo: "Build your custom JIRA URL structure by dragging and dropping components. The pattern defines how your JIRA ticket IDs are converted to URLs.",
    urlBuilderDetailsInfo: "Build your custom JIRA URL structure by dragging and dropping components. This pattern defines how your JIRA ticket IDs will be transformed into URLs. Ensure patterns create valid URLs (correct TLDs, no invalid starting characters) and avoid placing regex patterns consecutively.",
    savePattern: "Save Pattern",
    showRules: "Show Rules",
    reset: "Reset",
    urlPreview: "URL Preview",
    urlPattern: "URL Pattern"
  },
  
  // URL Builder components
  urlBuilder: {
    dynamicFields: "Dynamic Fields",
    ticketType: "Ticket Type",
    issuePrefix: "Issue Prefix",
    baseUrl: "Base URL",
    separators: "Separators",
    hyphen: "Hyphen",
    dot: "Dot",
    underscore: "Underscore",
    slash: "Slash",
    regexPatterns: "Regex Patterns",
    numericDigits: "Any Numeric Digits (e.g., 12345)",
    alphanumericChars: "Alphanumeric Characters",
    removeComponent: "Remove component",
    dragHandle: "Drag handle",
    copyUrl: "Copy {{env}} URL",
    alreadyInUse: "{{item}} - Already in use",
    resetToLastSaved: "Reset to last saved pattern"
  },
  
  // Messages
  messages: {
    confirmDelete: "Are you sure you want to delete this item?",
    importSuccess: "Settings imported successfully",
    importError: "Failed to import settings",
    invalidFile: "Invalid file format",
  },
  
  // Credits
  credits: {
    developedBy: "Developed by Khalil Charfi"
  },
  
  // QR Code
  qrCode: {
    clickToCopy: "Click QR Code to copy image",
    scanToAccess: "Scan QR code to access this URL",
    copied: "QR code image copied!"
  },
};
