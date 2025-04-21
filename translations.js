// Global variables
let currentLang = 'en'; // Default language

// Language translations
const translations = {
    en: {
        title: "JIRA URL Wizard Privacy Policy",
        lastUpdated: "Last updated: April 10, 2024",
        introText: "<strong>JIRA URL Wizard</strong> is designed to simplify working across multiple JIRA environments. We prioritize your privacy and security - all data is stored locally on your device, and no information is sent to external servers.",
        quickNav: "Quick Navigation",
        backToTop: "↑ Back to Top",
        nav: {
            introduction: "Introduction",
            features: "Key Features",
            information: "Information We Collect",
            permissions: "Permissions Usage",
            storage: "Data Storage & Security",
            rights: "Your Rights & Controls",
            retention: "Data Retention",
            changes: "Policy Changes",
            compliance: "Legal Compliance"
        },
        introduction: {
            title: "Introduction",
            p1: "JIRA URL Wizard (\"we\", \"our\", or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension. We take your privacy seriously and are transparent about our data practices.",
            p2: "Our extension is designed to help developers, testers, and project managers easily navigate between different JIRA environments without manually changing URLs."
        },
        features: {
            title: "Key Features",
            switching: {
                title: "Quick Environment Switching",
                desc: "Instantly switch between development, staging, and production JIRA environments with a single click."
            },
            config: {
                title: "Custom Environment Configuration",
                desc: "Create and customize JIRA environment configurations to match your organization's specific setup."
            },
            organization: {
                title: "Ticket Organization",
                desc: "Save and organize tickets for quick access across all your JIRA instances."
            },
            detection: {
                title: "Automatic Ticket Detection",
                desc: "Extract ticket information automatically from any JIRA page you're viewing."
            }
        },
        information: {
            title: "Information We Collect",
            intro: "JIRA URL Wizard collects and stores the following information locally on your device:",
            config: {
                title: "Configuration Data",
                items: [
                    "JIRA environment configurations (URLs, names, authentication details)",
                    "Custom environment settings and preferences",
                    "User interface preferences (theme, layout, etc.)"
                ]
            },
            ticket: {
                title: "Ticket Data",
                items: [
                    "Saved ticket information (ticket IDs, descriptions)",
                    "Ticket categorization and organization",
                    "Quick access ticket lists"
                ]
            },
            usage: {
                title: "Usage Data",
                items: [
                    "Extension settings and preferences",
                    "Last accessed environments",
                    "User-defined shortcuts and hotkeys"
                ]
            },
            privacy: {
                title: "Your Privacy is Our Priority:",
                desc: "All data is stored locally in your browser's storage and is not transmitted to any external servers. We have no access to your JIRA credentials or ticket information."
            }
        },
        permissions: {
            title: "Permissions Usage",
            intro: "JIRA URL Wizard requires the following permissions to provide its functionality. Here's why each permission is needed:",
            purpose: "Purpose:",
            usage: "Usage:",
            dataHandling: "Data Handling:",
            storage: {
                name: "storage",
                purpose: "To save your environments and preferences",
                usage: "This permission allows the extension to:",
                items: [
                    "Save your JIRA environment configurations for quick switching",
                    "Store your favorite tickets for easy access",
                    "Remember your preferences and settings",
                    "Maintain your quick access lists"
                ],
                dataHandling: "All data is stored locally using Chrome's storage API. No data is sent to external servers."
            },
            tabs: {
                name: "tabs",
                purpose: "To detect JIRA tabs and enable quick switching",
                usage: "This permission enables the extension to:",
                items: [
                    "Detect when you're viewing a JIRA ticket",
                    "Extract the current ticket ID for quick environment switching",
                    "Generate the appropriate URLs for different environments",
                    "Switch between development, staging, and production views"
                ],
                dataHandling: "The extension only reads the URL and title of tabs that are JIRA-related. No other tab information is accessed or stored."
            },
            activeTab: {
                name: "activeTab",
                purpose: "To read current tab information when needed",
                usage: "This permission allows the extension to:",
                items: [
                    "Read the current tab's URL when you click the extension icon",
                    "Generate environment-specific links based on your current ticket",
                    "Enable quick environment switching for your current view"
                ],
                dataHandling: "The extension only accesses the active tab when you explicitly interact with it. No background monitoring occurs."
            }
        },
        storage: {
            title: "Data Storage and Security",
            intro: "All data collected by JIRA URL Wizard is stored locally on your device using Chrome's storage API. We prioritize your security with these measures:",
            measures: [
                "All data is encrypted using Chrome's built-in storage encryption",
                "No data is transmitted to external servers - everything stays on your device",
                "No tracking or analytics services are used",
                "Regular security audits of our codebase",
                "Secure handling of sensitive information"
            ],
            highlight: {
                title: "Enterprise-Ready:",
                desc: "Our local-only approach to data storage makes JIRA URL Wizard suitable for enterprise environments with strict security requirements."
            }
        },
        rights: {
            title: "Your Rights and Controls",
            intro: "You have complete control over your data in JIRA URL Wizard:",
            controls: [
                "Access your stored configurations through the extension's options page",
                "Delete any or all of your stored data at any time",
                "Export your configurations for backup or sharing with team members",
                "Import configurations from other devices or team members",
                "Reset all settings to default with a single click"
            ]
        },
        retention: {
            title: "Data Retention",
            intro: "Since all data is stored locally on your device, it remains available until you:",
            conditions: [
                "Explicitly delete it through the extension's options",
                "Uninstall the JIRA URL Wizard extension",
                "Clear your browser's extension data storage"
            ],
            conclusion: "We have no access to your data and therefore no ability to delete or retain it on our servers."
        },
        changes: {
            title: "Changes to this Privacy Policy",
            p1: "We may update our Privacy Policy from time to time. When we do, we will post the new Privacy Policy on this page and update the \"Last Updated\" date.",
            p2: "Significant changes will be notified to users through a notification in the extension. We encourage you to review this Privacy Policy periodically for any changes."
        },
        compliance: {
            title: "Legal Compliance",
            p1: "JIRA URL Wizard is designed to comply with applicable data protection regulations, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).",
            p2: "Our local-only approach to data handling ensures that we respect your privacy rights by default. Since we never collect or process your data on our servers, many traditional privacy concerns are inherently addressed."
        },
        footer: {
            copyright: "&copy; <span id=\"copyright-year\"></span> JIRA URL Wizard",
            github: "View on GitHub"
        },
        browserButtons: {
            title: "Download JIRA URL Wizard",
            chrome: "Chrome",
            firefox: "Firefox",
            edge: "Edge",
            safari: "Safari",
            firefoxAlert: "Firefox extension coming soon!",
            edgeAlert: "Edge extension coming soon!",
            safariAlert: "Safari extension coming soon!"
        },
        settings: {
            button: "Erweiterungseinstellungen verwalten",
            info: "Zugriff auf den Speicher und die Konfiguration Ihrer Erweiterung"
        },
        download: {
            title: "Download for Your Browser",
            settingsButton: "Extension Settings",
            settingsInfo: "Configure your extension settings and preferences",
            versionFormat: "{version} • {date}",
            comingSoon: "Coming Soon"
        },
        modal: {
            title: "Extension Settings",
            close: "Close",
            intro: "To access the extension settings, please use one of the following methods based on your browser:",
            chrome: {
                title: "Chrome",
                steps: [
                    "Click the extensions icon (puzzle piece) in the browser toolbar",
                    "Find \"JIRA URL Wizard\" in the list",
                    "Click the three dots (⋮) next to the extension",
                    "Select \"Options\" or \"Extension options\""
                ]
            }
        }
    },
    de: {
        title: "JIRA URL Wizard Datenschutzrichtlinie",
        lastUpdated: "Zuletzt aktualisiert: 10. April 2024",
        introText: "<strong>JIRA URL Wizard</strong> wurde entwickelt, um die Arbeit mit mehreren JIRA-Umgebungen zu vereinfachen. Wir priorisieren Ihre Privatsphäre und Sicherheit - alle Daten werden lokal auf Ihrem Gerät gespeichert, und keine Informationen werden an externe Server gesendet.",
        quickNav: "Schnellnavigation",
        backToTop: "↑ Zurück nach oben",
        nav: {
            introduction: "Einführung",
            features: "Hauptfunktionen",
            information: "Gesammelte Informationen",
            permissions: "Berechtigungen",
            storage: "Datenspeicherung & Sicherheit",
            rights: "Ihre Rechte & Kontrollen",
            retention: "Datenspeicherung",
            changes: "Änderungen der Richtlinie",
            compliance: "Rechtliche Konformität"
        },
        introduction: {
            title: "Einführung",
            p1: "JIRA URL Wizard (\"wir\", \"unser\" oder \"uns\") setzt sich für den Schutz Ihrer Privatsphäre ein. Diese Datenschutzrichtlinie erläutert, wie wir Ihre Informationen sammeln, verwenden und schützen, wenn Sie unsere Chrome-Erweiterung nutzen. Wir nehmen Ihre Privatsphäre ernst und sind transparent bezüglich unserer Datenpraktiken.",
            p2: "Unsere Erweiterung wurde entwickelt, um Entwicklern, Testern und Projektmanagern zu helfen, einfach zwischen verschiedenen JIRA-Umgebungen zu navigieren, ohne URLs manuell zu ändern."
        },
        settings: {
            button: "Manage Extension Settings",
            info: "Access your extension storage and configuration"
        }
    }
};

// Helper function to get nested values
function getValue(obj, path) {
    const keys = path.split('.');
    return keys.reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
}

// Function to format date based on language
function formatDate(dateString, lang) {
    const date = moment(dateString);
    if (lang === 'en') {
        return date.format('MMMM D, YYYY');
    } else if (lang === 'de') {
        return date.format('D. MMMM YYYY');
    } else {
        return date.format('L');
    }
}

// Function to apply translations
function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getValue(translations[lang], key);
        if (text) {
            if (/<[a-z][\s\S]*>/i.test(text)) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        }
    });

    const listElements = document.querySelectorAll('[data-i18n-list]');
    listElements.forEach(el => {
        const key = el.getAttribute('data-i18n-list');
        const items = getValue(translations[lang], key);

        if (items && Array.isArray(items)) {
            el.innerHTML = '';
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                el.appendChild(li);
            });
        }
    });

    // Update browser buttons if they exist
    if (typeof renderBrowserButtons === 'function') {
        renderBrowserButtons();
    }
} 