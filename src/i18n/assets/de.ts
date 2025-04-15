export default {
  // Common UI elements
  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    delete: "Löschen",
    add: "Hinzufügen",
    close: "Schließen",
    ok: "OK",
    yes: "Ja",
    no: "Nein",
    loading: "Wird geladen...",
    error: "Fehler",
    success: "Erfolg",
    copyUrl: "URL kopieren",
    copyGeneratedUrl: "Generierte URL kopieren",
    resetChanges: "Änderungen zurücksetzen",
    saveChanges: "Änderungen speichern",
    import: "Importieren",
    export: "Exportieren",
    pattern: "Muster",
    enabled: "Aktiviert",
    remove: "Entfernen",
    preview: "Vorschau",
    hide: "Ausblenden",
    loadingSettings: "Einstellungen werden geladen...",
    addItem: "Element hinzufügen + Enter",
    addChanges: "Änderungen hinzufügen",
    savePattern: "Muster speichern",
    reset: "Zurücksetzen",
  },
  
  // Validation messages
  validation: {
    prefixEmpty: "Präfix darf nicht leer sein",
    prefixAlphanumeric: "Präfix darf nur Buchstaben und Zahlen enthalten",
    prefixExists: "Dieses Präfix existiert bereits",
    ticketTypeEmpty: "Ticket-Typ darf nicht leer sein",
    ticketTypeAlphanumeric: "Ticket-Typ darf nur Buchstaben und Zahlen enthalten",
    ticketTypeExists: "Dieser Ticket-Typ existiert bereits"
  },
  
  // Language names
  Auto: "Automatisch",
  English: "Englisch",
  Deutsch: "Deutsch",
  
  // Navigation and headers
  navigation: {
    home: "Startseite",
    settings: "Einstellungen",
    help: "Hilfe",
    about: "Über",
    openSettings: "Einstellungen öffnen",
    openExtensionSettings: "Erweiterungseinstellungen öffnen",
    generalSettings: "Allgemeine Einstellungen",
    advancedSettings: "Erweiterte Einstellungen",
    features: "Funktionen",
    urls: "URLs",
    advanced: "Erweitert",
    back: "Zurück",
  },
  
  // Settings page
  settings: {
    title: "Einstellungen",
    language: "Sprache",
    theme: "Thema",
    themes: {
      light: "Hell",
      dark: "Dunkel",
      system: "System",
    },
    urlConfig: "URL-Konfiguration",
    jiraPatterns: "JIRA-Muster",
    advanced: "Erweiterte Einstellungen",
    advancedDesc: "Erweiterte Konfigurationsoptionen auf der Einstellungsseite anzeigen",
    export: "Einstellungen exportieren",
    import: "Einstellungen importieren",
    importFileLabel: "Einstellungsdatei importieren",
    reset: "Auf Standardwerte zurücksetzen",
    saveSuccess: "Einstellungen erfolgreich gespeichert",
    saveError: "Fehler beim Speichern der Einstellungen",
    showAdvancedLabel: "Erweiterte Einstellungen anzeigen",
    chooseLanguage: "Wählen Sie Ihre bevorzugte Schnittstellensprache",
    baseUrls: "Basis-URLs",
    baseUrlsInfo: "Geben Sie Basis-URLs für verschiedene Umgebungen ein. Alle URLs verwenden das HTTPS-Protokoll.",
    loading: "Einstellungen werden geladen...",
    languageChanged: "Sprache erfolgreich geändert",
    languageChangeError: "Fehler beim Ändern der Sprache"
  },
  
  // URL related
  url: {
    bo: "Backend Office Tool",
    desktop: "Desktop-Webschnittstelle",
    mobile: "Mobile Webschnittstelle",
    drupal7: "Legacy CMS-System",
    drupal9: "Aktuelles CMS-System",
    baseUrl: "Basis-URL",
    baseUrls: "Basis-URLs",
    environments: "Frontend-Umgebungen",
    cms: "CMS-Umgebungen",
  },
  
  // JIRA related
  jira: {
    title: "JIRA-Integration",
    pattern: "Muster",
    enabled: "Aktiviert",
    addPattern: "Neues Muster hinzufügen",
    editPattern: "Muster bearbeiten",
    deletePattern: "Muster löschen",
    ticketTypes: "Ticket-Typen (Optional)",
    issuePrefixes: "Problem-Präfixe",
    addPrefix: "Präfix hinzufügen + Enter",
    addTicketType: "Ticket-Typ hinzufügen + Enter",
    invalidPattern: "Ungültiges Muster",
    patternMatches: "Muster passt zur Vorschau",
    enterRegexDirectly: "Regex direkt eingeben",
    useUrlGeneration: "URL-Generierung verwenden",
    generateFromSampleUrl: "Aus Beispiel-URL generieren",
    sampleJiraUrl: "Beispiel-JIRA-URL",
    enablePattern: "Dieses Muster aktivieren",
    patternPlaceholder: "Muster eingeben (z.B. ^https://jira\\.example\\.com/browse/PROJ-\\d+)",
    urlPlaceholder: "z.B. https://jira.example.com/browse/PROJ-123",
    noPatterns: "Keine JIRA-Muster definiert. Klicken Sie auf 'Neues Muster hinzufügen', um zu beginnen.",
    validateRegex: "Bitte geben Sie ein gültiges reguläres Ausdrucksmuster ein",
    enterTicketId: "Ticket-ID eingeben",
    manualInputDisabled: "Manuelle Ticket-ID-Eingabe ist in den Einstellungen deaktiviert",
    applyTicketId: "Ticket-ID anwenden",
    refreshFromCurrentTab: "Von aktuellem Tab aktualisieren",
    copyEnvironmentLinks: "Umgebungslinks kopieren",
    recentTickets: "Kürzliche Tickets",
    noRecentTickets: "Keine kürzlichen Tickets",
    showRecentTickets: "Letzte Tickets anzeigen",
    urlPatterns: "JIRA-URL-Muster",
    urlPatternsInfo: "Definieren Sie URL-Muster (Regex), um JIRA-Tabs zu identifizieren. Wird für Funktionen wie die Extraktion von Ticket-IDs verwendet.",
    generatedPattern: "Generiertes Muster:",
  },
  
  // Features
  features: {
    qrIntegration: "QR-Code integrieren",
    qrIntegrationDesc: "Fügen Sie Ihr Logo in die Mitte von QR-Codes ein (falls zutreffend)",
    markdownCopy: "Markdown in Kopien verwenden",
    markdownCopyDesc: "Inhalte als Markdown-Format statt als Klartext kopieren (falls zutreffend)",
    manualTicketInput: "Manuelle Ticket-Eingabe erlauben",
    manualTicketInputDesc: "Manuelle Eingabe der Ticket-ID in der Popup-Oberfläche aktivieren",
    allowManualTicketInput: "Manuelle Ticket-Eingabe erlauben",
    advancedConfig: "Erweiterte Konfiguration",
    advancedConfigDesc: "Erweiterte Einstellungen und Konfigurationsoptionen aktivieren",
    issuePrefixes: "Problem-Präfixe",
    urlStructure: "URL-Struktur",
    qrIntegrationLabel: "Logo in QR-Codes integrieren",
    markdownCopyLabel: "Markdown beim Kopieren verwenden",
    qrPreviewTitle: "QR-Code-Logo-Integrationsvorschau:",
    copyFormatPreviewTitle: "Kopierformat-Vorschau (Basierend auf aktuellen Einstellungen):",
    logoIntegrationPreview: "Logo-Integrationsvorschau:",
    formatPreview: {
      markdown: "Markdown-Format ist aktiv",
      plainText: "Klartext-Format ist aktiv"
    },
    toggleEffects: "Effekte umschalten",
    copyPreview: "Vorschau kopieren",
    useMarkdownFormatting: "Markdown-Formatierung beim Kopieren generierter Inhalte verwenden",
    ticketTypes: "Ticket-Typen (Optional)",
    jiraUrlPatterns: "JIRA-URL-Muster"
  },
  
  // Sections
  sections: {
    prefixesTitle: "Präfixe & Ticket-Typen",
    prefixesInfo: "Definieren Sie Projektpräfixe (z.B. PROJ) und optionale Ticket-Typen (z.B. BUG). Drücken Sie Enter zum Hinzufügen.",
    urlBuilderTitle: "URL-Builder",
    urlStructureTitle: "URL-Struktur",
    urlBuilderInfo: "Erstellen Sie Ihre benutzerdefinierte JIRA-URL-Struktur durch Ziehen und Ablegen von Komponenten. Das Muster definiert, wie Ihre JIRA-Ticket-IDs in URLs umgewandelt werden.",
    urlBuilderDetailsInfo: "Erstellen Sie Ihre benutzerdefinierte JIRA-URL-Struktur durch Ziehen und Ablegen von Komponenten. Dieses Muster definiert, wie Ihre JIRA-Ticket-IDs in URLs umgewandelt werden. Stellen Sie sicher, dass Muster gültige URLs erzeugen (korrekte TLDs, keine ungültigen Startzeichen) und vermeiden Sie, Regex-Muster nacheinander zu platzieren.",
    savePattern: "Muster speichern",
    showRules: "Regeln anzeigen",
    hideRules: "Regeln ausblenden",
    reset: "Zurücksetzen",
    urlPreview: "URL-Vorschau",
    urlPattern: "URL-Muster",
    separators: "Trennzeichen",
    patterns: "Regex-Muster",
    dragComponents: "Ziehen Sie Komponenten hierher, um Ihr URL-Muster zu erstellen",
    unsavedChanges: "Sie haben ungespeicherte Änderungen.",
    validationRules: "Validierungsregeln"
  },
  
  // Validation Rules
  validationRules: {
    baseUrlRequired: {
      title: "Basis-URL erforderlich",
      description: "Das Muster muss eine Basis-URL-Komponente enthalten"
    },
    issuePrefixRequired: {
      title: "Problem-Präfix erforderlich",
      description: "Das Muster muss eine Problem-Präfix-Komponente enthalten"
    },
    ticketNumberRequired: {
      title: "Ticket-Nummer erforderlich",
      description: "Das Muster muss eine Ticket-Nummer-Komponente enthalten"
    },
    validTld: {
      title: "Gültige Top-Level-Domain (TLD)",
      description: "Stellt sicher, dass der Domain-Teil mit einer gültigen TLD endet (z.B. .com, .org). Wird in der URL-Vorschau überprüft."
    },
    noAdjacentSeparators: {
      title: "Keine benachbarten Trennzeichen",
      description: "Das Muster darf keine zwei Trennzeichen-Komponenten nebeneinander haben"
    },
    noAdjacentRegex: {
      title: "Keine benachbarten Regex-Muster",
      description: "Es können nicht zwei Regex-Muster nebeneinander platziert werden"
    },
    noLeadingSymbols: {
      title: "Keine führenden Symbole",
      description: "Die URL darf nicht mit Symbolen oder Punkten beginnen"
    }
  },
  
  // Messages
  messages: {
    confirmDelete: "Möchten Sie dieses Element wirklich löschen?",
    confirmReset: "Möchten Sie wirklich alle Einstellungen auf den letzten gespeicherten Stand zurücksetzen (oder auf die Standardeinstellungen, falls noch nie gespeichert)? Alle nicht gespeicherten Änderungen gehen verloren.",
    importSuccess: "Einstellungen erfolgreich importiert",
    importError: "Fehler beim Importieren der Einstellungen",
    exportSuccess: "Einstellungen erfolgreich exportiert!",
    exportError: "Fehler beim Exportieren der Einstellungen",
    invalidFile: "Ungültiges Dateiformat",
    invalidRegex: "Ungültige Regex-Syntax. Muster nicht gespeichert.",
    emptyPattern: "Muster darf nicht leer sein.",
    patternUpdated: "Muster aktualisiert. Denken Sie daran, die Gesamteinstellungen zu speichern.",
    confirmRemovePattern: "Möchten Sie dieses Muster wirklich entfernen?",
    patternRemoved: "Muster entfernt. Denken Sie daran, die Gesamteinstellungen zu speichern.",
    patternToggled: "Muster {{status}}. Denken Sie daran, die Gesamteinstellungen zu speichern.",
    urlChangesReset: "URL-Änderungen zurückgesetzt",
    urlChangesSaved: "URL-Änderungen erfolgreich gespeichert!",
    changesReset: "Änderungen zurückgesetzt",
    importSettingsLabel: "Einstellungsdatei importieren",
    importSettingsTitle: "Einstellungen importieren",
    exportSettingsTitle: "Einstellungen exportieren",
    emptyPrefix: "Präfix darf nicht leer sein",
    invalidPrefix: "Präfix darf nur Buchstaben und Zahlen enthalten",
    prefixExists: "Dieses Präfix existiert bereits",
    emptyTicketType: "Tickettyp darf nicht leer sein",
    invalidTicketType: "Tickettyp darf nur Buchstaben und Zahlen enthalten",
    ticketTypeExists: "Dieser Tickettyp existiert bereits",
    settingsUpdated: "Einstellungen aus einer anderen Quelle aktualisiert.",
    markdownCopied: "Generiertes Markdown kopiert!",
    plainTextCopied: "Generierter Klartext kopiert!",
    errorReadingFile: "Fehler beim Lesen der Datei",
    importReviewPrompt: "Einstellungen erfolgreich importiert! Überprüfen Sie die Änderungen und klicken Sie auf Speichern, um sie zu übernehmen.",
    patternEnabled: "aktiviert",
    patternDisabled: "deaktiviert",
    errorImportingSettings: "Fehler beim Importieren der Einstellungen:",
    addNewPattern: "Neues Muster hinzufügen",
    editPatternTitle: "Muster bearbeiten",
    saveChanges: "Änderungen speichern",
    cancelChanges: "Abbrechen",
    removePattern: "Muster entfernen",
    noUrlAvailable: "Keine URL im aktuellen Tab verfügbar",
    noTicketIdFound: "Keine Ticket-ID im aktuellen Tab gefunden",
    errorRefreshingTicket: "Fehler beim Aktualisieren der Ticket-ID",
    refreshingFromTab: "Aktualisiere vom aktuellen Tab...",
    updatedFromTab: "Vom aktuellen Tab aktualisiert",
    qrCodeCopyFailed: "QR-Code-Kopie fehlgeschlagen: Canvas nicht gefunden!",
    qrCodeBlobFailed: "QR-Code-Kopie fehlgeschlagen: Konnte keinen Blob generieren!",
    qrCodeImageCopied: "QR-Code-Bild kopiert!",
    environmentLinksCopied: "Umgebungslinks ({{format}}) kopiert!",
    urlCopied: "URL kopiert!",
    loadingSettings: "Lade Einstellungen...",
    noPatternsDefined: "Keine JIRA-Muster definiert. Klicken Sie auf 'Neues Muster hinzufügen', um zu beginnen.",
    urlBuilderInfo: "Erstellen Sie Ihre benutzerdefinierte JIRA-URL-Struktur durch Ziehen und Ablegen von Komponenten. Das Muster definiert, wie Ihre JIRA-Ticket-IDs in URLs umgewandelt werden.",
    jiraPatternsInfo: "Definieren Sie URL-Muster (Regex), um JIRA-Tabs zu identifizieren. Wird für Funktionen wie die Extraktion von Ticket-IDs verwendet.",
    selectEnvironment: "Wählen Sie eine Umgebung.",
    copyFailed: "Kopieren fehlgeschlagen!",
    errorDetectingTicket: "Fehler beim Erkennen des Tickets",
    couldNotAccessTabUrl: "Konnte nicht auf die aktuelle Tab-URL zugreifen",
    errorDetectingTicketFromTab: "Fehler beim Erkennen des Tickets aus dem aktuellen Tab",
    noUrlGenerated: "Keine URL generiert",
    copyGeneratedUrl: "Generierte URL kopieren",
    applyTicketId: "Ticket-ID anwenden",
    refreshFromCurrentTab: "Von aktuellem Tab aktualisieren",
    copyEnvironmentLinks: "Umgebungslinks kopieren",
    showRecentTickets: "Letzte Tickets anzeigen",
    noRecentTickets: "Keine kürzlichen Tickets",
    recentTickets: "Kürzliche Tickets",
    manualInputDisabled: "Manuelle Ticket-ID-Eingabe ist in den Einstellungen deaktiviert",
    qrCodeError: "Fehler beim Generieren des QR-Codes",
    qrCodeClickToCopy: "Klicken Sie auf den QR-Code, um das Bild zu kopieren",
    qrCodeScanToAccess: "Scannen Sie den QR-Code, um auf diese URL zuzugreifen",
    qrCodeCopied: "QR-Code-Bild kopiert!",
    openSettings: "Einstellungen öffnen",
    settings: "Einstellungen",
    dragComponentsHere: "Ziehen Sie Komponenten hierher, um Ihr URL-Muster zu erstellen",
    patternStructureInvalid: "Musterstruktur ist ungültig",
    generatedUrlInvalid: "Generierte URL ist ungültig (überprüfen Sie TLD, Zeichen usw.)",
    copyUrl: "{{env}}-URL kopieren",
    cannotCopyInvalidUrl: "Ungültige URL kann nicht kopiert werden",
    addComponentsToGenerateUrl: "Fügen Sie Komponenten hinzu, um eine URL zu generieren",
    examplePreview: "Beispielvorschau",
    dynamicFields: "Dynamische Felder",
    separators: "Trennzeichen",
    regexPatterns: "Regex-Muster",
    dragHandle: "Ziehgriff",
    removeComponent: "Komponente entfernen",
    componentAlreadyInUse: "{{item}} - Bereits in Verwendung",
    qrCodeDisplayError: "QR-Code konnte nicht angezeigt werden.",
    selectEnvironmentForQr: "Wählen Sie eine Umgebung, um einen QR-Code zu generieren.",
    clickQrCodeToCopy: "Klicken Sie auf den QR-Code, um das Bild zu kopieren",
    scanQrCodeToAccess: "Scannen Sie den QR-Code, um auf diese URL zuzugreifen",
    developedBy: "Entwickelt von Khalil Charfi",
    openExtensionSettings: "Erweiterungseinstellungen öffnen",
    noUrlAvailableInTab: "Keine URL im aktuellen Tab verfügbar",
    errorGettingTabUrl: "Fehler beim Abrufen der Tab-URL",
    errorApplyingRegex: "Fehler beim Anwenden des Regex",
    errorParsingUrlForRegex: "Fehler beim Parsen der URL für die Regex-Generierung",
    couldNotGenerateSpecificPattern: "Konnte kein spezifisches Muster für die URL generieren, verwende grundlegende Ursprung/Pfad-Übereinstimmung",
    regexValidationError: "Regex-Validierungsfehler",
    errorSavingRecentTicket: "Fehler beim Speichern des letzten Tickets",
    errorInitiatingRecentTicketUpdate: "Fehler beim Initiieren der Ticket-Aktualisierung",
    errorWithPrefixPattern: "Fehler mit dem Präfix-Muster",
    errorGeneratingQrCodeBlob: "Fehler beim Generieren des QR-Code-Blobs",
    errorProcessingTabUrl: "Fehler beim Verarbeiten der Tab-URL",
    errorProcessingUrlFromPopup: "Fehler beim Verarbeiten der URL aus dem Popup",
    errorRefreshingSettings: "Fehler beim Aktualisieren der Einstellungen",
    errorLoadingPopupData: "Fehler beim Laden der Popup-Initialdaten",
    errorGettingCurrentTabUrl: "Fehler beim Abrufen der aktuellen Tab-URL",
    errorDetectingTicketFromCurrentTab: "Fehler beim Erkennen des Tickets aus dem aktuellen Tab",
    invalidSettingsStructure: "Ungültige Einstellungsstruktur",
    settingsMustBeValidJson: "Einstellungen müssen ein gültiges JSON-Objekt sein",
    missingRequiredField: "Erforderliches Feld fehlt: {{field}}",
    themeMustBeValid: "Das Theme muss entweder \"light\", \"dark\" oder \"system\" sein",
    prefixesMustBeArray: "Präfixe müssen ein Array sein",
    ticketTypesMustBeArray: "Ticket-Typen müssen ein Array sein",
    jiraPatternsMustBeArray: "JIRA-Muster müssen ein Array sein",
    jiraPatternMustHavePattern: "JIRA-Muster an Index {{index}} muss eine \"pattern\"-Eigenschaft haben",
    urlStructureMustBeArray: "URL-Struktur muss ein Array sein",
    invalidJsonFile: "Die Datei enthält kein gültiges JSON. Gefundener Text beginnt mit: \"{{sample}}\"",
    enterTicketId: "Bitte geben Sie eine Ticket-ID ein.",
    ticketIdCopied: "Ticket-ID in die Zwischenablage kopiert!",
    linkCopied: "Link in die Zwischenablage kopiert!",
    refreshing: "Aktualisierung von aktuellem Tab...",
    noTicketFound: "Keine Ticket-ID im aktuellen Tab gefunden",
    refreshError: "Fehler beim Aktualisieren der Ticket-ID",
    noUrlInTab: "Keine URL im aktuellen Tab verfügbar",
    noEnvironmentsConfigured: "Es wurden keine Umgebungs-URLs konfiguriert. Bitte besuchen Sie die Erweiterungseinstellungen, um URLs hinzuzufügen.",
    configurationNeeded: "Konfiguration erforderlich",
  },
  
  // URL Builder components
  urlBuilder: {
    dynamicFields: "Dynamische Felder",
    ticketType: "Ticket-Typ",
    issuePrefix: "Problem-Präfix",
    baseUrl: "Basis-URL",
    separators: "Trennzeichen",
    hyphen: "Bindestrich",
    dot: "Punkt",
    underscore: "Unterstrich",
    slash: "Schrägstrich",
    regexPatterns: "Regex-Muster",
    numericDigits: "Beliebige Ziffern (z.B. 12345)",
    alphanumericChars: "Alphanumerische Zeichen",
    removeComponent: "Komponente entfernen",
    dragHandle: "Ziehgriff",
    copyUrl: "{{env}}-URL kopieren",
    alreadyInUse: "{{item}} - Bereits in Verwendung",
    resetToLastSaved: "Auf letztes gespeichertes Muster zurücksetzen"
  },
  
  // Credits
  credits: {
    developedBy: "Entwickelt von Khalil Charfi"
  },
  
  // QR Code
  qrCode: {
    clickToCopy: "Klicken Sie auf den QR-Code, um das Bild zu kopieren",
    scanToAccess: "Scannen Sie den QR-Code, um auf diese URL zuzugreifen",
    copied: "QR-Code-Bild kopiert!"
  },
  
  // Options page
  options: {
    title: 'Einstellungen',
    language: {
      title: 'Sprache',
      auto: 'Automatisch',
      english: 'Englisch',
      german: 'Deutsch',
      success: 'Sprache erfolgreich geändert',
      error: 'Sprache konnte nicht geändert werden'
    },
    theme: {
      title: 'Design',
      light: 'Hell',
      dark: 'Dunkel',
      system: 'System'
    },
    advanced: {
      title: 'Erweiterte Einstellungen',
      show: 'Erweiterte Einstellungen anzeigen',
      hide: 'Erweiterte Einstellungen ausblenden'
    },
    copy: {
      markdown: 'Als Markdown kopieren',
      plain: 'Als Klartext kopieren'
    },
    ticket: {
      manual: 'Manuelle Ticket-Eingabe erlauben',
      types: 'Ticket-Typen',
      prefixes: 'Präfixe',
      add: 'Hinzufügen',
      remove: 'Entfernen',
      pattern: 'Muster',
      save: 'Speichern',
      cancel: 'Abbrechen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      confirmDelete: 'Möchten Sie dieses Muster wirklich löschen?'
    },
    qr: {
      title: 'QR-Code',
      integrate: 'QR-Code in URL integrieren'
    },
    importExport: {
      title: 'Einstellungen importieren/exportieren',
      import: 'Importieren',
      export: 'Exportieren',
      success: 'Einstellungen erfolgreich importiert',
      error: 'Einstellungen konnten nicht importiert werden',
      invalid: 'Ungültige Einstellungsdatei'
    }
  },
  
  // Pattern related
  pattern: {
    edit: "Muster bearbeiten",
    enterRegex: "Regex direkt eingeben",
    useUrlGeneration: "URL-Generierung verwenden",
    generateFromUrl: "Aus Beispiel-URL generieren",
    label: "Muster",
    enable: "Dieses Muster aktivieren",
    cancel: "Abbrechen",
    save: "Änderungen speichern"
  },
  
  urls: {
    boDesc: "Backend Office Tool für administrative Aufgaben",
    drupal7Desc: "Altes CMS-System für die Inhaltsverwaltung",
    mobileDesc: "Mobil optimierte Web-Oberfläche",
    desktopDesc: "Desktop-Webschnittstelle",
    drupal9Desc: "Aktuelles CMS-System für die Inhaltsverwaltung"
  }
};
