import { getAllSettings } from '../services/settingsService';
import { getAllSettings as getAllBackgroundSettings } from '../background/settingsManager';

/**
 * Log all current settings to the console
 * This is useful for debugging
 */
export const debugSettings = async (): Promise<void> => {
  try {
    console.group('Current Settings (foreground)');
    console.log(getAllSettings());
    console.groupEnd();
    
    console.group('Current Settings (background)');
    console.log(await getAllBackgroundSettings());
    console.groupEnd();
  } catch (error) {
    console.error('Error debugging settings:', error);
  }
};

/**
 * Get a formatted string of all current settings
 * Useful for displaying in a debug UI
 */
export const getSettingsDebugString = (): string => {
  try {
    const settings = getAllSettings();
    return JSON.stringify(settings, null, 2);
  } catch (error) {
    console.error('Error getting settings debug string:', error);
    return 'Error getting settings';
  }
};

/**
 * Create a downloadable settings file
 */
export const downloadSettingsAsJson = (): void => {
  try {
    const settings = getAllSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `jira-url-wizard-settings-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Error downloading settings:', error);
  }
};

/**
 * Format settings for display in UI
 * Adds categories and readable labels
 */
export const formatSettingsForDisplay = (): { category: string, settings: { key: string, label: string, value: any }[] }[] => {
  const settings = getAllSettings();
  
  return [
    {
      category: 'URLs',
      settings: [
        { key: 'urls.bo', label: 'Back Office URL', value: settings.urls.bo },
        { key: 'urls.mobile', label: 'Mobile URL', value: settings.urls.mobile },
        { key: 'urls.desktop', label: 'Desktop URL', value: settings.urls.desktop },
        { key: 'urls.drupal7', label: 'Drupal 7 URL', value: settings.urls.drupal7 },
        { key: 'urls.drupal9', label: 'Drupal 9 URL', value: settings.urls.drupal9 }
      ]
    },
    {
      category: 'Ticket',
      settings: [
        { key: 'ticketPrefix', label: 'Ticket Prefix', value: settings.ticketPrefix },
        { key: 'ticketTypes', label: 'Ticket Types', value: settings.ticketTypes.join(', ') },
        { key: 'prefixes', label: 'Prefixes', value: settings.prefixes.join(', ') },
        { key: 'allowManualTicketInput', label: 'Allow Manual Ticket Input', value: settings.allowManualTicketInput },
      ]
    },
    {
      category: 'URL Structure',
      settings: [
        { key: 'urlStructure', label: 'URL Structure Pattern', value: settings.urlStructure.join(' + ') },
        { key: 'enableAdvancedUrlPatterns', label: 'Enable Advanced URL Patterns', value: settings.enableAdvancedUrlPatterns },
      ]
    },
    {
      category: 'Appearance',
      settings: [
        { key: 'theme', label: 'Theme', value: settings.theme },
        { key: 'showCopiedNotification', label: 'Show Copied Notification', value: settings.showCopiedNotification },
        { key: 'showPreviewOnHover', label: 'Show Preview on Hover', value: settings.showPreviewOnHover },
        { key: 'language', label: 'Language', value: settings.language },
      ]
    },
    {
      category: 'Features',
      settings: [
        { key: 'integrateQrImage', label: 'Integrate QR Image', value: settings.integrateQrImage },
        { key: 'useMarkdownCopy', label: 'Use Markdown Copy', value: settings.useMarkdownCopy },
        { key: 'autoSavePatterns', label: 'Auto Save Patterns', value: settings.autoSavePatterns },
        { key: 'showAdvancedSettings', label: 'Show Advanced Settings', value: settings.showAdvancedSettings },
      ]
    }
  ];
}; 