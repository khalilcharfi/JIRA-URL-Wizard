import { useState, useEffect } from 'react';
import type { SettingsStorage } from '../shared/settings';

const STORAGE_KEY = 'jira-url-wizard-settings';

// Default settings
const defaultSettings: SettingsStorage = {
  urls: {
    bo: '',
    mobile: '',
    desktop: '',
    drupal7: '',
    drupal9: ''
  },
  ticketTypes: ['MOBILE', 'DESKTOP', 'BO'],
  prefixes: ['FEATURE', 'BUG', 'TASK'],
  urlStructure: ['ticket-type', 'issue-prefix', 'base-url'],
  theme: 'system',
  jiraPatterns: [],
  integrateQrImage: false,
  useMarkdownCopy: true,
  showCopiedNotification: true,
  showPreviewOnHover: true,
  enableAdvancedUrlPatterns: false,
  autoSavePatterns: false
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsStorage>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem(STORAGE_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: SettingsStorage) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    loading
  };
}; 