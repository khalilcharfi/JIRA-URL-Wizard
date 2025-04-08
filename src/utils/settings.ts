export interface JiraPattern {
    pattern: string;
}

export interface Settings {
    theme: 'light' | 'dark';
    language: string;
    prefixes: string[];
    ticketTypes: string[];
    urls: Record<string, string>;
    jiraPatterns: JiraPattern[];
    integrateQrImage: boolean;
    useMarkdownCopy: boolean;
    urlStructure: string[];
    exportedAt?: string;
}

export const defaultSettings: Settings = {
    theme: 'light',
    language: 'en',
    prefixes: [],
    ticketTypes: [],
    urls: {},
    jiraPatterns: [{ pattern: '[A-Z]+-[0-9]+' }],
    integrateQrImage: false,
    useMarkdownCopy: false,
    urlStructure: ['ticketType', '.', 'issuePrefix', '-', '[0-9]+', 'baseUrl'],
};

const requiredFields: (keyof Settings)[] = [
    'theme',
    'language',
    'prefixes',
    'ticketTypes',
    'urls',
    'jiraPatterns',
    'integrateQrImage',
    'useMarkdownCopy',
    'urlStructure'
];

export const validateSettingsStructure = (settings: unknown): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if it's an object
    if (!settings || typeof settings !== 'object') {
        return { isValid: false, errors: ['Settings must be a valid JSON object'] };
    }

    // Check for required fields
    for (const field of requiredFields) {
        if (!(field in settings)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate theme
    if ('theme' in settings && !['light', 'dark'].includes((settings as any).theme)) {
        errors.push('Theme must be either "light" or "dark"');
    }

    // Validate arrays
    if ('prefixes' in settings && !Array.isArray((settings as any).prefixes)) {
        errors.push('Prefixes must be an array');
    }
    if ('ticketTypes' in settings && !Array.isArray((settings as any).ticketTypes)) {
        errors.push('Ticket types must be an array');
    }
    if ('jiraPatterns' in settings) {
        const patterns = (settings as any).jiraPatterns;
        if (!Array.isArray(patterns)) {
            errors.push('JIRA patterns must be an array');
        } else {
            patterns.forEach((pattern: any, index: number) => {
                if (!pattern || typeof pattern !== 'object' || !('pattern' in pattern)) {
                    errors.push(`JIRA pattern at index ${index} must have a "pattern" property`);
                }
            });
        }
    }
    if ('urlStructure' in settings && !Array.isArray((settings as any).urlStructure)) {
        errors.push('URL structure must be an array');
    }

    // Validate urls object
    if ('urls' in settings) {
        const urls = (settings as any).urls;
        if (typeof urls !== 'object' || urls === null) {
            errors.push('URLs must be an object');
        } else {
            Object.entries(urls).forEach(([key, value]) => {
                if (typeof value !== 'string') {
                    errors.push(`URL value for key "${key}" must be a string`);
                }
            });
        }
    }

    // Validate boolean fields
    if ('integrateQrImage' in settings && typeof (settings as any).integrateQrImage !== 'boolean') {
        errors.push('integrateQrImage must be a boolean');
    }
    if ('useMarkdownCopy' in settings && typeof (settings as any).useMarkdownCopy !== 'boolean') {
        errors.push('useMarkdownCopy must be a boolean');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const exportSettings = (settings: Settings): string => {
    const settingsToExport = {
        ...settings,
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(settingsToExport, null, 2);
};

export const importSettings = (jsonString: string): Settings => {
    try {
        // Try to parse the JSON string
        let importedSettings;
        try {
            importedSettings = JSON.parse(jsonString);
        } catch (parseError) {
            // Handle JSON parsing errors with a user-friendly message
            const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
            const sample = jsonString.slice(0, 20).replace(/\n/g, ' ').trim() + '...';
            throw new Error(`The file does not contain valid JSON. Found text starting with: "${sample}"`);
        }

        // Validate the structure of the parsed settings
        const validation = validateSettingsStructure(importedSettings);
        
        if (!validation.isValid) {
            console.error('Invalid settings structure:', validation.errors);
            throw new Error('Invalid settings structure: ' + validation.errors.join(', '));
        }

        // Merge with default settings and ensure proper types
        return {
            ...defaultSettings,
            ...importedSettings,
            prefixes: Array.isArray(importedSettings.prefixes) ? importedSettings.prefixes : defaultSettings.prefixes,
            ticketTypes: Array.isArray(importedSettings.ticketTypes) ? importedSettings.ticketTypes : defaultSettings.ticketTypes,
            jiraPatterns: Array.isArray(importedSettings.jiraPatterns) ? importedSettings.jiraPatterns : defaultSettings.jiraPatterns,
            urlStructure: Array.isArray(importedSettings.urlStructure) ? importedSettings.urlStructure : defaultSettings.urlStructure,
            urls: importedSettings.urls && typeof importedSettings.urls === 'object' ? importedSettings.urls : defaultSettings.urls,
        };
    } catch (error) {
        console.error('Error importing settings:', error);
        throw error;
    }
}; 