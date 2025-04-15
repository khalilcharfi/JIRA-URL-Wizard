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
    resetChanges: "Reset Changes",
    saveChanges: "Save Changes",
    savingChanges: "Saving changes...",
    import: "Import",
    export: "Export",
    pattern: "Pattern",
    enabled: "Enabled",
    remove: "Remove",
    preview: "Preview",
    hide: "Hide",
    loadingSettings: "Loading settings...",
    addItem: "Add item + Enter",
    addChanges: "Add Changes",
    savePattern: "Save Pattern",
    reset: "Reset",
    settingsSaved: "Settings saved successfully",
    settingsError: "Failed to save settings",
  },
  
  // Validation messages
  validation: {
    prefixEmpty: "Prefix cannot be empty",
    prefixAlphanumeric: "Prefix must contain only letters and numbers",
    prefixExists: "This prefix already exists",
    ticketTypeEmpty: "Ticket type cannot be empty",
    ticketTypeAlphanumeric: "Ticket type must contain only letters and numbers",
    ticketTypeExists: "This ticket type already exists"
  },
  
  // Language names
  Auto: "Auto",
  English: "English",
  Deutsch: "German",
  
  // Navigation and headers
  navigation: {
    home: "Home",
    settings: "Settings",
    help: "Help",
    about: "About",
    openSettings: "Open Settings",
    openExtensionSettings: "Open Extension Settings",
    generalSettings: "General Settings",
    advancedSettings: "Advanced Settings",
    features: "Features",
    urls: "URLs",
    advanced: "Advanced",
    back: "Back",
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
    chooseLanguage: "Choose your preferred interface language",
    baseUrls: "Base URLs",
    baseUrlsInfo: "Enter base URLs for different environments. All URLs use HTTPS protocol.",
    loading: "Loading settings...",
    languageChanged: "Language changed successfully",
    languageChangeError: "Failed to change language"
  },
  
  // URL related
  url: {
    bo: "Backend Office Tool",
    desktop: "Desktop web interface",
    mobile: "Mobile web interface",
    drupal7: "Legacy CMS system",
    drupal9: "Current CMS system",
    baseUrl: "Base URL",
    baseUrls: "Base URLs",
    environments: "Frontend Environments",
    cms: "CMS Environments",
  },
  
  // URLs descriptions 
  urls: {
    boDesc: "Backend Office Tool for administrative tasks",
    desktopDesc: "Desktop web interface",
    drupal7Desc: "Legacy CMS system for content management",
    drupal9Desc: "Current CMS system for content management",
    mobileDesc: "Mobile-optimized web interface",
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
    urlPatterns: "JIRA URL Patterns",
    urlPatternsInfo: "Define URL patterns (regex) to help identify JIRA tabs. Used for features like extracting ticket IDs.",
    generatedPattern: "Generated Pattern:",
  },
  
  // Features
  features: {
    qrIntegration: "Integrate QR Code",
    qrIntegrationDesc: "Embed your logo in the center of QR codes (if applicable)",
    markdownCopy: "Use Markdown in Copy",
    markdownCopyDesc: "Copy content as Markdown format instead of plain text (if applicable)",
    manualTicketInput: "Allow manual ticket input",
    manualTicketInputDesc: "Enable manual ticket ID input in the popup interface",
    allowManualTicketInput: "Allow manual ticket input",
    advancedConfig: "Advanced Configuration",
    advancedConfigDesc: "Enable advanced settings and configuration options",
    issuePrefixes: "Issue Prefixes",
    urlStructure: "URL Structure",
    qrIntegrationLabel: "Integrate logo within QR codes",
    markdownCopyLabel: "Use Markdown when copying",
    qrPreviewTitle: "QR Code Logo Integration Preview:",
    copyFormatPreviewTitle: "Copy Format Preview (Based on current settings):",
    logoIntegrationPreview: "Logo Integration Preview:",
    formatPreview: {
      markdown: "Markdown Format is Active",
      plainText: "Plain Text Format is Active"
    },
    toggleEffects: "Toggle Effects",
    copyPreview: "Copy Preview",
    useMarkdownFormatting: "Use Markdown formatting when copying generated content",
    ticketTypes: "Ticket Types (Optional)",
    jiraUrlPatterns: "JIRA URL Patterns"
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
    hideRules: "Hide Rules",
    reset: "Reset",
    urlPreview: "URL Preview",
    urlPattern: "URL Pattern",
    separators: "Separators",
    patterns: "Regex Patterns",
    dragComponents: "Drag components here to build your URL pattern",
    unsavedChanges: "You have unsaved changes.",
    validationRules: "Validation Rules"
  },
  
  // Validation Rules
  validationRules: {
    baseUrlRequired: {
      title: "Base URL Required",
      description: "The pattern must include a base URL component"
    },
    issuePrefixRequired: {
      title: "Issue Prefix Required",
      description: "The pattern must include an issue prefix component"
    },
    ticketNumberRequired: {
      title: "Ticket Number Required",
      description: "The pattern must include a ticket number component"
    },
    validTld: {
      title: "Valid Top-Level Domain (TLD)",
      description: "Ensures the domain part ends with a valid TLD (e.g., .com, .org). Checked in URL Preview."
    },
    noAdjacentSeparators: {
      title: "No Adjacent Separators",
      description: "The pattern cannot have two separator components next to each other"
    },
    noAdjacentRegex: {
      title: "No Adjacent Regex Patterns",
      description: "Cannot place two regex patterns next to each other"
    },
    noLeadingSymbols: {
      title: "No Leading Symbols",
      description: "The URL cannot start with symbols or dots"
    }
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
    confirmReset: "Are you sure you want to reset all settings to the last saved state (or defaults if never saved)? Any unsaved changes will be lost.",
    importSuccess: "Settings imported successfully",
    importError: "Failed to import settings",
    exportSuccess: "Settings exported successfully!",
    exportError: "Error exporting settings",
    invalidFile: "Invalid file format",
    invalidRegex: "Invalid Regex Syntax. Pattern not saved.",
    emptyPattern: "Pattern cannot be empty.",
    patternUpdated: "Pattern updated. Remember to save overall settings.",
    confirmRemovePattern: "Are you sure you want to remove this pattern?",
    patternRemoved: "Pattern removed. Remember to save overall settings.",
    patternToggled: "Pattern {{status}}. Remember to save overall settings.",
    urlChangesReset: "URL changes reset",
    urlChangesSaved: "URL changes saved successfully!",
    changesReset: "Changes reset",
    importSettingsLabel: "Import settings file",
    importSettingsTitle: "Import Settings",
    exportSettingsTitle: "Export Settings",
    emptyPrefix: "Prefix cannot be empty",
    invalidPrefix: "Prefix can only contain letters and numbers",
    prefixExists: "This prefix already exists",
    emptyTicketType: "Ticket type cannot be empty",
    invalidTicketType: "Ticket type can only contain letters and numbers",
    ticketTypeExists: "This ticket type already exists",
    settingsUpdated: "Settings updated from another source.",
    markdownCopied: "Generated Markdown copied!",
    plainTextCopied: "Generated Plain Text copied!",
    errorReadingFile: "Error reading file",
    importReviewPrompt: "Settings imported successfully! Review and click Save to apply changes.",
    patternEnabled: "enabled",
    patternDisabled: "disabled",
    errorImportingSettings: "Error importing settings:",
    addNewPattern: "Add New Pattern",
    editPatternTitle: "Edit Pattern",
    saveChanges: "Save Changes",
    cancelChanges: "Cancel",
    removePattern: "Remove Pattern",
    noUrlAvailable: "No URL available in current tab",
    noTicketIdFound: "No ticket ID found in current tab",
    errorRefreshingTicket: "Error refreshing ticket ID",
    refreshingFromTab: "Refreshing from current tab...",
    updatedFromTab: "Updated from current tab",
    qrCodeCopyFailed: "QR Code copy failed: Canvas not found!",
    qrCodeBlobFailed: "QR Code copy failed: Could not generate blob!",
    qrCodeImageCopied: "QR Code Image Copied!",
    environmentLinksCopied: "Environment links ({{format}}) copied!",
    urlCopied: "URL Copied!",
    loadingSettings: "Loading settings...",
    noPatternsDefined: "No JIRA patterns defined. Click 'Add New Pattern' to start.",
    urlBuilderInfo: "Build your custom JIRA URL structure by dragging and dropping components. The pattern defines how your JIRA ticket IDs are converted to URLs.",
    jiraPatternsInfo: "Define URL patterns (regex) to help identify JIRA tabs. Used for features like extracting ticket IDs.",
    selectEnvironment: "Select an environment.",
    enterTicketId: "Please enter a Ticket ID.",
    copyFailed: "Copy failed!",
    errorDetectingTicket: "Error detecting ticket",
    couldNotAccessTabUrl: "Could not access current tab URL",
    errorDetectingTicketFromTab: "Error detecting ticket from current tab",
    noUrlGenerated: "No URL generated",
    copyGeneratedUrl: "Copy Generated URL",
    applyTicketId: "Apply Ticket ID",
    refreshFromCurrentTab: "Refresh from Current Tab",
    copyEnvironmentLinks: "Copy Environment Links",
    showRecentTickets: "Show Recent Tickets",
    noRecentTickets: "No recent tickets",
    recentTickets: "Recent Tickets",
    manualInputDisabled: "Manual ticket ID input is disabled in settings",
    qrCodeError: "Error generating QR code",
    qrCodeClickToCopy: "Click QR Code to copy image",
    qrCodeScanToAccess: "Scan QR code to access this URL",
    qrCodeCopied: "QR code image copied!",
    openSettings: "Open Settings",
    settings: "Settings",
    dragComponentsHere: "Drag components here to build your URL pattern",
    patternStructureInvalid: "Pattern structure is invalid",
    generatedUrlInvalid: "Generated URL is invalid (check TLD, characters, etc.)",
    cannotCopyInvalidUrl: "Cannot copy invalid URL",
    addComponentsToGenerateUrl: "Add components to generate URL",
    examplePreview: "Example Preview",
    dynamicFields: "Dynamic Fields",
    separators: "Separators",
    regexPatterns: "Regex Patterns",
    dragHandle: "Drag handle",
    removeComponent: "Remove component",
    componentAlreadyInUse: "{{item}} - Already in use",
    qrCodeDisplayError: "Could not display QR code.",
    selectEnvironmentForQr: "Select an environment to generate QR code.",
    clickQrCodeToCopy: "Click QR Code to copy image",
    scanQrCodeToAccess: "Scan QR code to access this URL",
    developedBy: "Developed by Khalil Charfi",
    openExtensionSettings: "Open Extension Settings",
    noUrlAvailableInTab: "No URL available in current tab",
    errorGettingTabUrl: "Error getting current tab URL",
    errorApplyingRegex: "Error applying regex",
    errorParsingUrlForRegex: "Error parsing URL for regex generation",
    couldNotGenerateSpecificPattern: "Could not generate a specific pattern for URL, using basic origin/path match",
    regexValidationError: "Regex validation error",
    errorSavingRecentTicket: "Error saving recent ticket",
    errorInitiatingRecentTicketUpdate: "Error initiating recent ticket update",
    errorWithPrefixPattern: "Error with prefix pattern",
    errorGeneratingQrCodeBlob: "Error generating QR code blob",
    errorProcessingTabUrl: "Error processing tab URL",
    errorProcessingUrlFromPopup: "Error processing URL from popup",
    errorRefreshingSettings: "Error refreshing settings",
    errorLoadingPopupData: "Error loading popup initial data",
    errorGettingCurrentTabUrl: "Error getting current tab URL",
    errorDetectingTicketFromCurrentTab: "Error detecting ticket from current tab",
    invalidSettingsStructure: "Invalid settings structure",
    settingsMustBeValidJson: "Settings must be a valid JSON object",
    missingRequiredField: "Missing required field: {{field}}",
    themeMustBeValid: "Theme must be either \"light\", \"dark\", or \"system\"",
    prefixesMustBeArray: "Prefixes must be an array",
    ticketTypesMustBeArray: "Ticket types must be an array",
    jiraPatternsMustBeArray: "JIRA patterns must be an array",
    jiraPatternMustHavePattern: "JIRA pattern at index {{index}} must have a \"pattern\" property",
    urlStructureMustBeArray: "URL structure must be an array",
    invalidJsonFile: "The file does not contain valid JSON. Found text starting with: \"{{sample}}\"",
    ticketIdCopied: "Ticket ID copied to clipboard!",
    linkCopied: "Link copied to clipboard!",
    refreshing: "Refreshing from current tab...",
    noTicketFound: "No ticket ID found in current tab",
    refreshError: "Error refreshing ticket ID",
    noUrlInTab: "No URL available in current tab",
    noEnvironmentsConfigured: "No environment URLs have been configured. Please visit the extension settings to add URLs.",
    configurationNeeded: "Configuration Needed",
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
  
  // Options
  options: {
    title: 'Settings',
    language: {
      title: 'Language',
      auto: 'Auto',
      english: 'English',
      german: 'German',
      success: 'Language changed successfully',
      error: 'Failed to change language'
    },
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    },
    advanced: {
      title: 'Advanced Settings',
      show: 'Show Advanced Settings',
      hide: 'Hide Advanced Settings'
    },
    copy: {
      markdown: 'Copy as Markdown',
      plain: 'Copy as Plain Text'
    },
    ticket: {
      manual: 'Allow Manual Ticket Input',
      types: 'Ticket Types',
      prefixes: 'Prefixes',
      add: 'Add',
      remove: 'Remove',
      pattern: 'Pattern',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this pattern?'
    },
    qr: {
      title: 'QR Code',
      integrate: 'Integrate QR Code in URL'
    },
    importExport: {
      title: 'Import/Export Settings',
      import: 'Import',
      export: 'Export',
      success: 'Settings imported successfully',
      error: 'Failed to import settings',
      invalid: 'Invalid settings file'
    }
  },
  
  // Pattern related
  pattern: {
    edit: "Edit Pattern",
    enterRegex: "Enter Regex Directly",
    useUrlGeneration: "Use URL generation",
    generateFromUrl: "Generate from Sample URL",
    label: "Pattern",
    enable: "Enable this pattern",
    cancel: "Cancel",
    save: "Save Changes"
  }
};
