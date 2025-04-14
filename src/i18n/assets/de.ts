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
  },
  
  // Navigation and headers
  navigation: {
    home: "Startseite",
    settings: "Einstellungen",
    help: "Hilfe",
    about: "Über",
    openSettings: "Einstellungen öffnen",
    openExtensionSettings: "Erweiterungseinstellungen öffnen",
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
  },
  
  // URL related
  url: {
    bo: "Backend Office Tool",
    desktop: "Desktop-Webschnittstelle",
    mobile: "Mobile Webschnittstelle",
    drupal7: "Legacy CMS-System",
    drupal9: "Aktuelles CMS-System",
    baseUrl: "Basis-URL",
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
  },
  
  // Features
  features: {
    qrIntegration: "QR-Code integrieren",
    qrIntegrationDesc: "Fügen Sie Ihr Logo in die Mitte von QR-Codes ein (falls zutreffend)",
    markdownCopy: "Markdown in Kopien verwenden",
    markdownCopyDesc: "Inhalte als Markdown-Format statt als Klartext kopieren (falls zutreffend)",
    manualTicketInput: "Manuelle Ticket-Eingabe erlauben",
    manualTicketInputDesc: "Manuelle Eingabe der Ticket-ID in der Popup-Oberfläche aktivieren",
    urlStructure: "URL-Struktur",
    qrIntegrationLabel: "Logo in QR-Codes integrieren",
    markdownCopyLabel: "Markdown beim Kopieren verwenden",
  },
  
  // Sections
  sections: {
    prefixesTitle: "Präfixe & Ticket-Typen",
    prefixesInfo: "Definieren Sie Projekt-Präfixe (z.B. PROJ) und optionale Ticket-Typen (z.B. BUG). Drücken Sie Enter zum Hinzufügen.",
    urlBuilderTitle: "URL-Builder",
    urlStructureTitle: "URL-Struktur",
    urlBuilderInfo: "Erstellen Sie Ihre benutzerdefinierte JIRA-URL-Struktur durch Drag & Drop von Komponenten. Das Muster definiert, wie Ihre JIRA-Ticket-IDs in URLs umgewandelt werden.",
    urlBuilderDetailsInfo: "Erstellen Sie Ihre benutzerdefinierte JIRA-URL-Struktur durch Drag & Drop von Komponenten. Dieses Muster definiert, wie Ihre JIRA-Ticket-IDs in URLs umgewandelt werden. Stellen Sie sicher, dass die Muster gültige URLs erzeugen (korrekte TLDs, keine ungültigen Startzeichen) und vermeiden Sie die Platzierung von Regex-Mustern nacheinander.",
    savePattern: "Muster speichern",
    showRules: "Regeln anzeigen",
    reset: "Zurücksetzen",
    urlPreview: "URL-Vorschau",
    urlPattern: "URL-Muster"
  },
  
  // Messages
  messages: {
    confirmDelete: "Sind Sie sicher, dass Sie dieses Element löschen möchten?",
    importSuccess: "Einstellungen erfolgreich importiert",
    importError: "Fehler beim Importieren der Einstellungen",
    invalidFile: "Ungültiges Dateiformat",
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
};
