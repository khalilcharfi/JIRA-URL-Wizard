# JIRA URL Wizard: Comprehensive Documentation

## Project Overview
JIRA URL Wizard is a browser extension designed to streamline JIRA workflow by making it easier to manage and access JIRA tickets across different environments. The extension is built using modern web technologies including React, TypeScript, and TailwindCSS.

## Table of Contents
- [Architecture](#architecture)
  - [Core Components](#core-components)
  - [Key Services](#key-services)
  - [UI Components](#ui-components)
  - [State Management](#state-management)
  - [URL Handling](#url-handling)
  - [Internationalization](#internationalization)
- [Features](#features)
  - [Environment Management](#environment-management)
  - [Ticket Management](#ticket-management)
  - [Mobile Integration](#mobile-integration)
  - [User Experience](#user-experience)
  - [Security & Privacy](#security--privacy)
  - [Advanced Features](#advanced-features)
- [Module Details](#module-details)
  - [Components](#components)
  - [Services](#services)
  - [Hooks](#hooks)
  - [Utils](#utils)
  - [Background Scripts](#background-scripts)
  - [I18n](#i18n)
  - [Shared](#shared)
  - [Popup](#popup)
  - [Options](#options)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
  - [Initial Setup](#initial-setup)
  - [Generating Ticket Links](#generating-ticket-links)
  - [Using Templates](#using-templates)
  - [Mobile Access](#mobile-access)
  - [Advanced Usage](#advanced-usage)
- [Technical Specifications](#technical-specifications)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)
- [Build System](#build-system)
- [Recent Changes](#recent-changes)
- [Contributing](#contributing)

## Architecture

### Core Components
1. **Popup Interface** (`src/popup/index.tsx`)
   - Main user interface that appears when clicking the extension icon
   - Provides quick access to ticket URL generation and management
   - Includes QR code generation for mobile access

2. **Options Page** (`src/options/index.tsx`)
   - Comprehensive settings management
   - Environment configuration
   - Template customization
   - Import/export functionality

3. **Background Script** (`src/background.ts`)
   - Monitors tab URL changes to detect JIRA tickets
   - Maintains a cache of settings to improve performance
   - Handles communication between different parts of the extension

### Key Services
1. **Template Service** (`src/services/templateService.ts`)
   - Generates markdown and plain text links based on templates
   - Handles URL pattern matching and generation
   - Exports utility functions for URL manipulation

2. **Settings Service** (`src/services/settingsService.ts`)
   - Manages user configuration
   - Provides default settings
   - Handles settings validation and migration

3. **Storage Service** (`src/services/storageService.ts`)
   - Handles browser storage operations
   - Manages persistence of user settings
   - Provides caching mechanisms for improved performance

4. **Ticket Service** (`src/services/ticketService.ts`)
   - Processes and validates ticket IDs
   - Manages recent tickets list
   - Handles ticket format detection and normalization

### UI Components
1. **MarkdownLinkGenerator** (`src/components/MarkdownLinkGenerator.tsx`)
   - Generates markdown links for JIRA tickets
   - Supports customizable templates
   - Provides copy-to-clipboard functionality

2. **URLComponentBuilder** (`src/components/URLComponentBuilder.tsx`)
   - Provides drag-and-drop interface for building URL patterns
   - Uses DND Kit for drag-and-drop functionality
   - Supports custom URL structure creation

3. **MarkdownTemplateEditor** (`src/components/MarkdownTemplateEditor.tsx`)
   - Rich text editor for customizing markdown templates
   - Uses TipTap editor
   - Supports syntax highlighting and preview

### State Management
The extension uses React's state management capabilities along with custom hooks for managing application state:

1. **useSettings Hook** (`src/hooks/useSettings.ts`)
   - Manages application settings state
   - Provides functions for updating settings
   - Handles loading settings from localStorage
   - Includes default settings for first-time users

2. **React Context**
   - Used for sharing state between components
   - Avoids prop drilling in deeply nested component trees
   - Provides a centralized state management solution

3. **Local Component State**
   - Used for UI-specific state like form inputs and toggles
   - Managed with useState and useReducer hooks
   - Optimized with useMemo and useCallback for performance

### URL Handling
The extension includes sophisticated URL handling capabilities:

1. **URL Extraction** (`src/utils/urlUtils.ts`)
   - Extracts JIRA ticket IDs from URLs using configurable patterns
   - Supports regular expressions for flexible pattern matching
   - Handles different JIRA URL formats across environments

2. **URL Construction** (`src/utils/urlBuilder.ts`)
   - Builds URLs from patterns defined in urlStructure
   - Supports custom separators and components
   - Handles different URL formats and structures
   - Ensures proper URL formatting with protocols

3. **Pattern Matching**
   - Uses regular expressions for pattern matching
   - Supports custom patterns defined by users
   - Includes fallback mechanisms for pattern matching failures

### Internationalization
The extension supports multiple languages through a comprehensive i18n implementation:

1. **i18next Integration** (`src/i18n/config.ts`)
   - Uses i18next and react-i18next for internationalization
   - Supports English and German languages
   - Includes fallback mechanisms for missing translations

2. **Translation Files** (`src/i18n/assets/`)
   - Separate translation files for each supported language
   - Comprehensive coverage of UI text and messages
   - Structured organization of translation keys

3. **Language Detection**
   - Automatically detects browser language
   - Allows manual language selection
   - Persists language preference in settings

## Features

### Environment Management
- Configure multiple JIRA environments (dev, staging, production)
- Quick switching between environments
- Custom environment naming
- Environment-specific URL patterns
- Default environment selection

### Ticket Management
- Generate JIRA ticket URLs for any environment
- Save frequently accessed tickets
- Support for different JIRA ticket formats and patterns
- Bulk ticket URL generation
- Recent tickets history
- Ticket favorites management

### Mobile Integration
- QR code generation for mobile access
- Share tickets with team members
- Mobile-friendly interface
- QR code customization options

### User Experience
- Dark/Light mode support
- Internationalization (i18n) support
- Responsive design
- Keyboard shortcuts
- Customizable UI elements
- Intuitive drag-and-drop functionality

### Security & Privacy
- Local storage of JIRA configurations
- No data sent to external servers
- Secure handling of credentials
- Regular security updates

### Advanced Features
- **Custom URL Patterns**: Create and manage custom URL patterns for different JIRA instances and ticket formats
  - Regular expression support for flexible pattern matching
  - Pattern testing and validation
  - Priority-based pattern application

- **Template Variables**: Use variables in templates for dynamic content generation
  - `{ticketId}`: The JIRA ticket ID
  - `{ticketUrl}`: The full URL to the ticket
  - `{ticketTitle}`: The title of the ticket (when available)
  - `{environment}`: The current environment name

- **Bulk Operations**: Perform operations on multiple tickets at once
  - Generate links for multiple tickets
  - Apply templates to multiple tickets
  - Export multiple ticket links

- **Keyboard Shortcuts**: Improve productivity with keyboard shortcuts
  - `Ctrl+C` / `Cmd+C`: Copy current link
  - `Ctrl+R` / `Cmd+R`: Refresh from current tab
  - `Ctrl+1` through `Ctrl+9`: Switch environments
  - `Ctrl+Q` / `Cmd+Q`: Generate QR code

## Module Details

This section provides detailed documentation for each module in the JIRA URL Wizard extension.

### Components

#### InfoPopup (`src/components/InfoPopup.tsx`)
- **Purpose**: Displays informational popups and tooltips throughout the extension
- **Key Functions**:
  - `InfoPopup`: Main component that renders a popup with information
- **Dependencies**: React, TailwindCSS
- **Usage Example**:
  ```jsx
  <InfoPopup 
    title="Help" 
    content="This is a helpful message" 
    isOpen={showHelp} 
    onClose={() => setShowHelp(false)} 
  />
  ```

#### MarkdownLinkGenerator (`src/components/MarkdownLinkGenerator.tsx`)
- **Purpose**: Generates markdown-formatted links for JIRA tickets
- **Key Functions**:
  - `MarkdownLinkGenerator`: Component that generates and displays markdown links
  - `copyToClipboard`: Copies generated links to clipboard
- **Dependencies**: React, templateService
- **Implementation Details**:
  - Uses `useEffect` to regenerate links when ticket ID or environment changes
  - Includes `urlStructure` parameter for flexible URL generation
  - Provides copy functionality with visual feedback
- **Usage Example**:
  ```jsx
  <MarkdownLinkGenerator 
    ticketId="PROJ-123" 
    environment="production" 
    urlStructure={settings.urlStructure} 
  />
  ```

#### MarkdownTemplateEditor (`src/components/MarkdownTemplateEditor.tsx`)
- **Purpose**: Rich text editor for customizing markdown templates
- **Key Functions**:
  - `MarkdownTemplateEditor`: Main editor component
  - `getMarkdownFromEditor`: Converts editor content to markdown
  - `setEditorContent`: Sets editor content from markdown
- **Dependencies**: TipTap, React
- **Implementation Details**:
  - Uses TipTap editor for rich text editing
  - Supports markdown syntax highlighting
  - Provides real-time preview of templates
- **Usage Example**:
  ```jsx
  <MarkdownTemplateEditor 
    initialValue={settings.markdownTemplate} 
    onChange={(value) => updateTemplate(value)} 
  />
  ```

#### SettingsDebugView (`src/components/SettingsDebugView.tsx`)
- **Purpose**: Provides a debug view for extension settings
- **Key Functions**:
  - `SettingsDebugView`: Component that displays settings in a readable format
  - `exportSettings`: Exports settings to a JSON file
- **Dependencies**: React, settingsService
- **Usage Example**:
  ```jsx
  <SettingsDebugView settings={currentSettings} />
  ```

#### SettingsImportExport (`src/components/SettingsImportExport.tsx`)
- **Purpose**: Handles importing and exporting of extension settings
- **Key Functions**:
  - `SettingsImportExport`: Main component for import/export functionality
  - `importSettings`: Imports settings from a JSON file
  - `exportSettings`: Exports settings to a JSON file
- **Dependencies**: React, settingsService, storageService
- **Usage Example**:
  ```jsx
  <SettingsImportExport 
    onImport={(settings) => updateSettings(settings)} 
    currentSettings={settings} 
  />
  ```

#### SettingsOverlay (`src/components/SettingsOverlay.tsx`)
- **Purpose**: Provides an overlay for accessing settings
- **Key Functions**:
  - `SettingsOverlay`: Component that renders a settings overlay
- **Dependencies**: React, TailwindCSS
- **Usage Example**:
  ```jsx
  <SettingsOverlay 
    isOpen={showSettings} 
    onClose={() => setShowSettings(false)} 
  >
    <SettingsContent />
  </SettingsOverlay>
  ```

#### TemplateGenerator (`src/components/TemplateGenerator.tsx`)
- **Purpose**: Generates templates for different use cases
- **Key Functions**:
  - `TemplateGenerator`: Component that generates templates
  - `generateTemplate`: Generates a template based on selected options
- **Dependencies**: React, templateService
- **Usage Example**:
  ```jsx
  <TemplateGenerator 
    ticketId="PROJ-123" 
    onGenerate={(template) => setCurrentTemplate(template)} 
  />
  ```

#### URLComponentBuilder (`src/components/URLComponentBuilder.tsx`)
- **Purpose**: Provides a drag-and-drop interface for building URL patterns
- **Key Functions**:
  - `URLComponentBuilder`: Main component for building URL patterns
  - `addComponent`: Adds a component to the URL pattern
  - `removeComponent`: Removes a component from the URL pattern
  - `reorderComponents`: Reorders components using drag-and-drop
- **Dependencies**: React, DND Kit, TailwindCSS
- **Implementation Details**:
  - Uses DND Kit for drag-and-drop functionality
  - Supports custom URL structure creation
  - Provides real-time preview of generated URLs
- **Usage Example**:
  ```jsx
  <URLComponentBuilder 
    initialComponents={settings.urlStructure} 
    onChange={(components) => updateUrlStructure(components)} 
  />
  ```

### Services

#### i18nService (`src/services/i18nService.ts`)
- **Purpose**: Manages internationalization for the extension
- **Key Functions**:
  - `initializeLanguage`: Initializes the language based on browser settings
  - `changeLanguage`: Changes the current language
  - `getTranslation`: Gets a translation for a specific key
- **Dependencies**: i18next, react-i18next
- **Implementation Details**:
  - Uses i18next for internationalization
  - Supports English and German languages
  - Handles language detection and fallback
- **Usage Example**:
  ```javascript
  import { initializeLanguage, changeLanguage } from '../services/i18nService';

  // Initialize language
  await initializeLanguage();

  // Change language
  await changeLanguage('de');
  ```

#### settingsService (`src/services/settingsService.ts`)
- **Purpose**: Manages user configuration and settings
- **Key Functions**:
  - `getDefaultSettings`: Returns default settings
  - `validateSettings`: Validates settings object
  - `migrateSettings`: Migrates settings from older versions
- **Dependencies**: storageService
- **Implementation Details**:
  - Provides default settings for first-time users
  - Handles settings validation and migration
  - Ensures backward compatibility
- **Usage Example**:
  ```javascript
  import { getDefaultSettings, validateSettings } from '../services/settingsService';

  // Get default settings
  const defaultSettings = getDefaultSettings();

  // Validate settings
  const isValid = validateSettings(userSettings);
  ```

#### storageService (`src/services/storageService.ts`)
- **Purpose**: Handles browser storage operations
- **Key Functions**:
  - `getSettings`: Retrieves settings from storage
  - `saveSettings`: Saves settings to storage
  - `addSettingsListener`: Adds a listener for settings changes
  - `removeSettingsListener`: Removes a settings listener
- **Dependencies**: browser.storage API
- **Implementation Details**:
  - Uses browser.storage.sync for syncing settings across devices
  - Provides caching mechanisms for improved performance
  - Handles storage errors gracefully
- **Usage Example**:
  ```javascript
  import { getSettings, saveSettings } from '../services/storageService';

  // Get settings
  const settings = await getSettings();

  // Save settings
  await saveSettings({ ...settings, theme: 'dark' });
  ```

#### templateService (`src/services/templateService.ts`)
- **Purpose**: Generates markdown and plain text links based on templates
- **Key Functions**:
  - `generateMarkdownLinks`: Generates markdown-formatted links
  - `generatePlainTextLinks`: Generates plain text links
  - `parseTemplate`: Parses a template with variables
- **Dependencies**: urlUtils, urlBuilder
- **Implementation Details**:
  - Supports custom templates with variables
  - Handles URL generation for different environments
  - Exports utility functions for URL manipulation
- **Usage Example**:
  ```javascript
  import { generateMarkdownLinks, generatePlainTextLinks } from '../services/templateService';

  // Generate markdown links
  const mdLinks = generateMarkdownLinks('PROJ-123', 'production', urlStructure);

  // Generate plain text links
  const textLinks = generatePlainTextLinks('PROJ-123', 'production', urlStructure);
  ```

#### ticketService (`src/services/ticketService.ts`)
- **Purpose**: Processes and validates ticket IDs
- **Key Functions**:
  - `validateTicketId`: Validates a ticket ID format
  - `normalizeTicketId`: Normalizes a ticket ID to a standard format
  - `getRecentTickets`: Gets the list of recently used tickets
  - `addToRecentTickets`: Adds a ticket to the recent tickets list
- **Dependencies**: storageService
- **Implementation Details**:
  - Handles ticket format detection and normalization
  - Manages a list of recently used tickets
  - Supports different JIRA ticket formats
- **Usage Example**:
  ```javascript
  import { validateTicketId, getRecentTickets } from '../services/ticketService';

  // Validate ticket ID
  const isValid = validateTicketId('PROJ-123');

  // Get recent tickets
  const recentTickets = await getRecentTickets();
  ```

### Hooks

#### useSettings (`src/hooks/useSettings.ts`)
- **Purpose**: Custom React hook for managing settings state
- **Key Functions**:
  - `useSettings`: Hook that provides settings state and update function
- **Dependencies**: React, localStorage
- **Implementation Details**:
  - Manages application settings state
  - Provides functions for updating settings
  - Handles loading settings from localStorage
  - Includes default settings for first-time users
- **Usage Example**:
  ```javascript
  import { useSettings } from '../hooks/useSettings';

  function MyComponent() {
    const { settings, updateSettings, loading } = useSettings();

    if (loading) {
      return <div>Loading settings...</div>;
    }

    return (
      <div>
        <h1>Current Theme: {settings.theme}</h1>
        <button onClick={() => updateSettings({
          ...settings,
          theme: settings.theme === 'dark' ? 'light' : 'dark'
        })}>
          Toggle Theme
        </button>
      </div>
    );
  }
  ```

### Utils

#### browser-polyfill (`src/utils/browser-polyfill.ts`)
- **Purpose**: Provides browser compatibility polyfills
- **Key Functions**:
  - `getBrowser`: Returns a browser object that works across different browsers
- **Implementation Details**:
  - Handles differences between Chrome, Firefox, and Edge APIs
  - Provides a consistent interface for browser APIs
- **Usage Example**:
  ```javascript
  import { getBrowser } from '../utils/browser-polyfill';

  const browser = getBrowser();
  browser.storage.sync.get('settings');
  ```

#### config (`src/utils/config.ts`)
- **Purpose**: Provides configuration utilities
- **Key Functions**:
  - `getConfig`: Gets configuration values
  - `isDebugMode`: Checks if debug mode is enabled
- **Implementation Details**:
  - Centralizes configuration management
  - Supports environment-specific configurations
- **Usage Example**:
  ```javascript
  import { getConfig, isDebugMode } from '../utils/config';

  const apiUrl = getConfig('apiUrl');

  if (isDebugMode()) {
    console.log('Debug mode is enabled');
  }
  ```

#### debugSettings (`src/utils/debugSettings.ts`)
- **Purpose**: Utilities for debugging settings
- **Key Functions**:
  - `logSettings`: Logs settings to console
  - `validateSettingsStructure`: Validates settings structure
- **Dependencies**: config
- **Implementation Details**:
  - Only active in debug mode
  - Helps identify issues with settings
- **Usage Example**:
  ```javascript
  import { logSettings } from '../utils/debugSettings';

  // Log settings to console
  logSettings(currentSettings);
  ```

#### settings (`src/utils/settings.ts`)
- **Purpose**: Settings-related utilities
- **Key Functions**:
  - `mergeSettings`: Merges settings objects
  - `resetSettings`: Resets settings to defaults
- **Dependencies**: settingsService
- **Implementation Details**:
  - Handles settings merging and validation
  - Provides utility functions for settings management
- **Usage Example**:
  ```javascript
  import { mergeSettings, resetSettings } from '../utils/settings';

  // Merge settings
  const mergedSettings = mergeSettings(defaultSettings, userSettings);

  // Reset settings
  await resetSettings();
  ```

#### urlBuilder (`src/utils/urlBuilder.ts`)
- **Purpose**: Utilities for building URLs
- **Key Functions**:
  - `buildUrlFromPattern`: Builds a URL from a pattern
  - `formatBaseUrl`: Formats a base URL
- **Implementation Details**:
  - Builds URLs from patterns defined in urlStructure
  - Supports custom separators and components
  - Handles different URL formats and structures
  - Ensures proper URL formatting with protocols
- **Usage Example**:
  ```javascript
  import { buildUrlFromPattern } from '../utils/urlBuilder';

  const url = buildUrlFromPattern(
    'jira.example.com',
    ['baseUrl', '/', 'browse', '/', 'ticketId'],
    'PROJ-123',
    'BUG',
    'PROJ'
  );
  // Result: https://jira.example.com/browse/PROJ-123
  ```

#### urlUtils (`src/utils/urlUtils.ts`)
- **Purpose**: URL-related utility functions
- **Key Functions**:
  - `extractIssueIdFromUrl`: Extracts a JIRA issue ID from a URL
  - `getCurrentTabUrl`: Gets the current tab's URL
- **Dependencies**: browser API
- **Implementation Details**:
  - Extracts JIRA ticket IDs from URLs using configurable patterns
  - Supports regular expressions for flexible pattern matching
  - Handles different JIRA URL formats across environments
- **Usage Example**:
  ```javascript
  import { extractIssueIdFromUrl, getCurrentTabUrl } from '../utils/urlUtils';

  // Extract issue ID from URL
  const issueId = extractIssueIdFromUrl(
    'https://jira.example.com/browse/PROJ-123',
    jiraPatterns,
    prefixes
  );

  // Get current tab URL
  const currentUrl = await getCurrentTabUrl();
  ```

### Background Scripts

#### index (`src/background/index.ts`)
- **Purpose**: Main background script entry point
- **Key Functions**:
  - `setupListeners`: Sets up event listeners
  - `processUrl`: Processes a URL to extract ticket ID
- **Dependencies**: i18nService, storageService, urlUtils
- **Implementation Details**:
  - Monitors tab URL changes to detect JIRA tickets
  - Handles communication between different parts of the extension
  - Maintains a cache of settings to improve performance
- **Usage Example**:
  ```javascript
  // This script runs automatically in the background
  // No direct import is needed
  ```

#### settingsManager (`src/background/settingsManager.ts`)
- **Purpose**: Background script for managing settings
- **Key Functions**:
  - `initializeSettings`: Initializes settings
  - `handleSettingsUpdate`: Handles settings updates
- **Dependencies**: storageService, settingsService
- **Implementation Details**:
  - Manages settings in the background
  - Handles settings migration and validation
  - Provides a cache for frequently accessed settings
- **Usage Example**:
  ```javascript
  // This script runs automatically in the background
  // No direct import is needed
  ```

### I18n

#### config (`src/i18n/config.ts`)
- **Purpose**: Configuration for internationalization
- **Key Functions**:
  - `i18n`: Configured i18next instance
- **Dependencies**: i18next, react-i18next
- **Implementation Details**:
  - Uses i18next and react-i18next for internationalization
  - Supports English and German languages
  - Includes fallback mechanisms for missing translations
- **Usage Example**:
  ```javascript
  import i18n from '../i18n/config';

  // Change language
  i18n.changeLanguage('de');

  // Get translation
  const translated = i18n.t('common.save');
  ```

#### index (`src/i18n/index.ts`)
- **Purpose**: Main entry point for internationalization
- **Key Functions**:
  - `initializeI18n`: Initializes internationalization
- **Dependencies**: i18n/config
- **Implementation Details**:
  - Initializes i18next
  - Sets up language detection
  - Loads translation resources
- **Usage Example**:
  ```javascript
  import '../i18n'; // This initializes i18n
  import { useTranslation } from 'react-i18next';

  function MyComponent() {
    const { t } = useTranslation();
    return <div>{t('common.save')}</div>;
  }
  ```

#### assets/de.ts and assets/en.ts
- **Purpose**: Translation files for German and English
- **Implementation Details**:
  - Separate translation files for each supported language
  - Comprehensive coverage of UI text and messages
  - Structured organization of translation keys
- **Usage Example**:
  ```javascript
  // These files are used internally by i18next
  // No direct import is needed
  ```

### Shared

#### settings (`src/shared/settings.ts`)
- **Purpose**: Shared settings types and constants
- **Key Definitions**:
  - `JiraPattern`: Interface for JIRA pattern configuration
  - `SettingsStorage`: Interface for settings storage
  - `DEFAULT_SETTINGS`: Default settings object
- **Implementation Details**:
  - Defines types used throughout the application
  - Provides default values for settings
- **Usage Example**:
  ```javascript
  import { SettingsStorage, DEFAULT_SETTINGS } from '../shared/settings';

  // Create settings object
  const settings: SettingsStorage = {
    ...DEFAULT_SETTINGS,
    theme: 'dark'
  };
  ```

### Popup

#### index (`src/popup/index.tsx`)
- **Purpose**: Main popup UI component
- **Key Components**:
  - `PopupHeader`: Header component with ticket input and actions
  - `EnvironmentTabs`: Tabs for selecting environments
  - `UrlOutput`: Component for displaying and copying URLs
  - `QrCodeSection`: Section for generating QR codes
- **Dependencies**: React, services, components
- **Implementation Details**:
  - Main user interface that appears when clicking the extension icon
  - Provides quick access to ticket URL generation and management
  - Includes QR code generation for mobile access
- **Usage Example**:
  ```javascript
  // This component is automatically rendered when the popup is opened
  // No direct import is needed
  ```

### Options

#### index (`src/options/index.tsx`)
- **Purpose**: Main options page component
- **Key Components**:
  - `EnvironmentSettings`: Settings for environments
  - `TemplateSettings`: Settings for templates
  - `AdvancedSettings`: Advanced settings
  - `ImportExport`: Import/export functionality
- **Dependencies**: React, services, components
- **Implementation Details**:
  - Comprehensive settings management
  - Environment configuration
  - Template customization
  - Import/export functionality
- **Usage Example**:
  ```javascript
  // This component is automatically rendered when the options page is opened
  // No direct import is needed
  ```

## Installation

### From Web Stores
- Chrome Web Store: [Coming soon]
- Firefox Add-ons: [Coming soon]
- Microsoft Edge Add-ons: [Coming soon]

### Manual Installation
1. Download the latest release for your browser:
   - [Chrome Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/jira-url-wizard-chrome-v1.0.5.zip)
   - [Firefox Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/jira-url-wizard-firefox-v1.0.5.zip)
   - [Edge Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/jira-url-wizard-edge-v1.0.5.zip)
   - [Safari Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/safari-mv3-prod.zip)

2. For Chrome/Edge:
   - Go to extensions page (chrome://extensions or edge://extensions)
   - Enable "Developer mode"
   - Click "Load unpacked" and select the unzipped folder

3. For Firefox:
   - Go to about:debugging
   - Click "This Firefox"
   - Click "Load Temporary Add-on" and select the zip file

4. For Safari:
   - Follow Apple's instructions for installing developer extensions

## Usage Guide

### Initial Setup
1. Click on the JIRA URL Wizard icon in your browser toolbar
2. Go to the Options page by clicking the gear icon
3. Configure your JIRA environments:
   - Add environment names (e.g., Dev, Staging, Production)
   - Set up URL patterns for each environment
   - Configure default templates

### Generating Ticket Links
1. Click on the extension icon
2. Enter a ticket ID (e.g., PROJ-123)
3. Select the desired environment
4. Copy the generated link in markdown or plain text format

### Using Templates
1. Go to the Options page
2. Navigate to the Templates section
3. Customize markdown and plain text templates
4. Use available variables like `{ticketId}`, `{ticketUrl}`, and `{ticketTitle}`

### Mobile Access
1. Generate a ticket link
2. Click on the QR code icon
3. Scan the QR code with your mobile device

### Advanced Usage

#### Custom URL Pattern Creation
1. Go to the Options page
2. Navigate to the URL Patterns section
3. Click "Add New Pattern"
4. Define your pattern with the following components:
   - Regular expression for matching
   - Priority level
   - Description for easy identification
5. Test your pattern with sample URLs
6. Save your pattern

#### Template Customization
1. Go to the Options page
2. Navigate to the Templates section
3. Use the rich text editor to customize your templates
4. Available variables:
   ```
   {ticketId} - The JIRA ticket ID
   {ticketUrl} - The full URL to the ticket
   {ticketTitle} - The title of the ticket (when available)
   {environment} - The current environment name
   ```
5. Preview your template with sample data
6. Save your template

#### Bulk Operations
1. Click on the extension icon
2. Go to the Bulk Operations tab
3. Enter multiple ticket IDs (one per line)
4. Select the desired environment
5. Generate links for all tickets
6. Copy all links at once

## Technical Specifications

### Browser Compatibility
- Chrome: version 80 and above
- Firefox: version 74 and above
- Edge: version 80 and above (Chromium-based)
- Safari: version 14 and above

### Dependencies
- **React**: UI library for building component-based interfaces
- **TypeScript**: Typed superset of JavaScript for improved code quality
- **TailwindCSS**: Utility-first CSS framework for styling
- **i18next**: Internationalization framework
- **DND Kit**: Drag-and-drop toolkit for React
- **TipTap**: Headless editor framework for rich text editing
- **Plasmo**: Framework for building browser extensions

### Storage
- **Local Storage**: Used for settings and preferences
- **Chrome Storage Sync**: Used for syncing settings across devices
- **Chrome Storage Local**: Used for temporary data

### Permissions
- **tabs**: Access to browser tabs for URL detection
- **storage**: Access to browser storage for saving settings
- **clipboardWrite**: Access to clipboard for copying links

## Performance Considerations

### Caching Mechanisms
- Settings are cached in memory to reduce storage reads
- URL patterns are compiled once and reused
- Templates are parsed and cached for faster rendering

### Lazy Loading
- Components are loaded only when needed
- Heavy operations are deferred to avoid blocking the UI
- Resources are loaded on demand

### Memory Management
- React memo is used to prevent unnecessary re-renders
- Event listeners are properly cleaned up to prevent memory leaks
- Large data structures are optimized for memory efficiency

### Network Efficiency
- No external API calls are made by default
- All operations are performed locally
- Minimal network usage for improved performance

## Troubleshooting

### Common Issues

#### Ticket ID Not Detected
- **Cause**: URL pattern may not match the current JIRA instance
- **Solution**: Add a custom URL pattern in the Options page that matches your JIRA URL format

#### Generated Links Not Working
- **Cause**: Environment URL may be incorrect or missing
- **Solution**: Verify environment URLs in the Options page

#### Settings Not Saving
- **Cause**: Storage permission may be denied or storage may be full
- **Solution**: Check browser permissions and clear some storage space

#### Extension Not Working in Incognito
- **Cause**: Extension may not have permission to run in incognito mode
- **Solution**: Enable "Allow in incognito" in extension settings

### Debugging
- Enable debug mode in the Options page for detailed logging
- Check the browser console for error messages
- Use the "Reset Settings" option to restore default settings if needed

## Build System
The project uses:
- Plasmo framework for browser extension development
- Webpack for bundling
- PostCSS and TailwindCSS for styling
- TypeScript for type safety
- Multiple build targets (Chrome, Firefox, Edge, Safari)

### Building from Source
1. Clone the repository:
   ```
   git clone https://github.com/khalilcharfi/JIRA-URL-Wizard.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build for development:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## Code Examples

### Custom URL Pattern
```javascript
// Example of creating a custom URL pattern for JIRA
const customPattern = {
  enabled: true,
  name: "Custom JIRA Pattern",
  pattern: "([A-Z]+-\\d+)",
  priority: 10,
  description: "Matches standard JIRA ticket IDs"
};

// Add to settings
const updatedSettings = {
  ...settings,
  jiraPatterns: [...settings.jiraPatterns, customPattern]
};
updateSettings(updatedSettings);
```

### Custom Template
```javascript
// Example of creating a custom markdown template
const customTemplate = `
# {ticketId}

**Environment:** {environment}
**URL:** {ticketUrl}

## Description
Add your description here.

## Steps to Reproduce
1. Step one
2. Step two
3. Step three
`;

// Add to settings
const updatedSettings = {
  ...settings,
  markdownTemplate: customTemplate
};
updateSettings(updatedSettings);
```

### URL Building
```javascript
// Example of building a URL from components
import { buildUrlFromPattern } from '../utils/urlBuilder';

const baseUrl = "jira.example.com";
const urlStructure = ["baseUrl", "/", "browse", "/", "ticketId"];
const ticketId = "PROJ-123";
const ticketType = "BUG";
const issuePrefix = "PROJ";

const url = buildUrlFromPattern(
  baseUrl,
  urlStructure,
  ticketId,
  ticketType,
  issuePrefix
);
// Result: https://jira.example.com/browse/PROJ-123
```

### Using the Hook
```javascript
// Example of using the useSettings hook
import { useSettings } from '../hooks/useSettings';

function MyComponent() {
  const { settings, updateSettings, loading } = useSettings();

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <h1>Current Theme: {settings.theme}</h1>
      <button onClick={() => updateSettings({
        ...settings,
        theme: settings.theme === 'dark' ? 'light' : 'dark'
      })}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## Recent Changes
The recent modifications to the codebase include:

1. **MarkdownLinkGenerator.tsx**:
   - Added `urlStructure` parameter to the `generateMarkdownLinks` and `generatePlainTextLinks` function calls
   - Updated the dependency list in the `useEffect` hook to include `urlStructure`

2. **templateService.ts**:
   - Exported `urlUtils` and `UI_CONFIG` for external use
   - Enhanced template generation functionality

These changes improve URL structure handling and make utility functions more accessible throughout the application.

## Contributing
Contributions to JIRA URL Wizard are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

Please make sure to update tests as appropriate and follow the code style guidelines.

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Thanks to all contributors who have helped make this extension better
- Built with [Plasmo](https://www.plasmo.com/) framework
- Uses [DND Kit](https://dndkit.com/) for drag-and-drop functionality
- Uses [TipTap](https://tiptap.dev/) for rich text editing
