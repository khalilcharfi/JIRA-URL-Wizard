import 'src/style.css'
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react"
import InfoPopup from "~src/components/InfoPopup";
import URLComponentBuilder from "~src/components/URLComponentBuilder";
import { DEFAULT_TOAST_TIMEOUT_MS } from "~src/utils/config";
// Import the shared settings definitions
import { DEFAULT_SETTINGS } from "~src/shared/settings"
import type { SettingsStorage, JiraPattern } from "~src/shared/settings"
import { QRCode } from 'react-qrcode-logo';
// Add import for marked
import { marked } from 'marked';
// Import the MarkdownRenderer component
import MarkdownRenderer from "../components/MarkdownRenderer";
// Import the new storage service
import {
  getSettings,
  saveSettings,
  addSettingsListener,
  removeSettingsListener
} from "../services/storageService";
// Add i18n imports
import { useTranslation } from 'react-i18next';
import { changeLanguage, initializeLanguage } from '../services/i18nService';
import '../i18n'; // ensure i18n is initialized
import { 
  LightThemeIcon, 
  DarkThemeIcon, 
  SystemThemeIcon, 
  LanguageIcon, 
  QRIcon, 
  MarkdownIcon, 
  ManualTicketIcon, 
  AdvancedSettingsIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  PencilIcon, 
  XIcon, 
  EyeIcon, 
  SettingsIcon,
  UploadIcon,
  DownloadIcon,
  SaveIcon,
  RefreshIcon,
  MarkdownCopyIcon,
  SunIcon,
  ErrorIcon,
  CheckIcon,
  QRCodeIcon,
} from '../assets/imageAssets'

// First, let's update the JiraPattern type to include the enabled property
interface CustomJiraPattern extends JiraPattern {
  enabled?: boolean;
}

// We'll use i18n to get the translated language names
// This is just for initialization, the actual values will come from i18n
const AVAILABLE_LANGUAGES = {
  auto: "Auto",
  en: "English",
  de: "Deutsch"
}

// --- Helper Component Definitions (Before CustomTagInput) --- 

const InputGroup: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = "" }) => (
  <div className={`mb-5 options-section__input-group ${className}`}>
    {children}
  </div>
)

const Label: React.FC<{
  id: string
  htmlFor?: string
  children: React.ReactNode
  className?: string
}> = ({ id, htmlFor, children, className = "" }) => (
  <label
    id={id}
    htmlFor={htmlFor}
    className={`block text-sm font-medium mb-1.5 options-section__label text-gray-600 dark:text-gray-300 ${className}`}>
    {children}
  </label>
)

// --- Reusable CustomTagInput component --- 
interface CustomTagInputProps {
  id: string;
  label: string;
  tags: string[];
  onAddTag: (tag: string) => boolean;
  onRemoveTag: (index: number) => void;
  placeholder?: string;
}

// Remove React.forwardRef wrapper, manage state internally
const CustomTagInput: React.FC<CustomTagInputProps> = ({ 
  id,
  label,
  tags,
  onAddTag,
  onRemoveTag,
  placeholder
}) => {
  // Internal state for the input value
  const [internalInputValue, setInternalInputValue] = useState('');
  // Internal ref for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = internalInputValue.trim();
      if (trimmedValue) {
        const success = onAddTag(trimmedValue);
        if (success) {
          setInternalInputValue(''); // Clear input on successful add
          // Refocus might not be strictly needed now, but can be helpful
          // inputRef.current?.focus(); 
        }
      }
    } else if (e.key === 'Backspace' && internalInputValue === '' && tags.length > 0) {
      onRemoveTag(tags.length - 1); // Remove the last tag
      // Refocus might not be strictly needed now, but can be helpful
      // inputRef.current?.focus(); 
    }
  };

  return (
    <InputGroup>
      <Label id={`${id}-label`} htmlFor={id}>{label}</Label>
      <div
        role="list"
        className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors duration-150"
        aria-labelledby={`${id}-label`}
      >
        {tags.map((tag, index) => (
          <div
            key={`${id}-tag-${index}`}
            role="listitem"
            className="flex items-center bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm ring-1 ring-inset ring-blue-200/80 dark:bg-blue-900/70 dark:text-blue-200 dark:ring-blue-700/30 transition-colors duration-150"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(index)}
              className="ml-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100 rounded-full p-0.5 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:ring-offset-blue-100 dark:focus:ring-blue-400 dark:focus:ring-offset-blue-900/70 transition-colors duration-150"
              aria-label={`Remove ${tag}`}
              title={`Remove ${tag}`}
            >
              <XIcon size={12} strokeWidth={2.5} />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={internalInputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none py-0.5 px-1"
          placeholder={placeholder || "Add item + Enter"}
        />
      </div>
    </InputGroup>
  );
};

// --- Reusable DebouncedTextInput component --- 
interface DebouncedTextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onBlur'> {
  initialValue: string;
  onSave: (value: string) => void;
}

const DebouncedTextInput: React.FC<DebouncedTextInputProps> = ({ 
  initialValue,
  onSave,
  ...restProps 
}) => {
  const [internalValue, setInternalValue] = useState(initialValue);

  // Update internal state on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  // Call the save callback when the input loses focus
  const handleBlur = () => {
    // Only call onSave if the value has actually changed from the initial one 
    // passed in during the last render, to avoid unnecessary state updates
    // (This check might be optional depending on desired behavior)
    if (internalValue !== initialValue) { 
      onSave(internalValue);
    }
  };

  // Effect to reset internal state if the initialValue prop changes from outside
  // This happens when settings are reset or imported
  useEffect(() => {
    setInternalValue(initialValue);
  }, [initialValue]);

  return (
    <input 
      type="text"
      {...restProps}
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur} 
      className={`w-full p-2 rounded-md options-section__input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500 border transition-colors duration-150 focus:outline-none focus:ring-1 ${restProps.className || ""}`}
    />
  );
};

const Toggle: React.FC<{
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}> = ({ id, checked, onCheckedChange, disabled, className, ...props }) => {
  return (
    <div className={`inline-flex ${className || ''}`}>
    <label
      htmlFor={id}
        className="relative inline-block w-10 h-5 cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
          {...props}
        />
        <div 
          className={`w-10 h-5 rounded-full transition-colors ${
            checked 
              ? 'bg-blue-600 dark:bg-blue-500' 
              : 'bg-gray-200 dark:bg-gray-600'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div 
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`} 
          />
        </div>
    </label>
    </div>
  );
};

interface PatternEditorFormProps {
  patternData: CustomJiraPattern | null;
  setPatternData: React.Dispatch<React.SetStateAction<CustomJiraPattern | null>>;
  isCurrentPatternValid: boolean;
  isPreviewMatch: boolean;
  handleSavePattern: () => void;
  handleCancelEditPattern: () => void;
  index: number;
}

const PatternEditorForm: React.FC<PatternEditorFormProps> = ({
  patternData,
  setPatternData,
  isCurrentPatternValid,
  isPreviewMatch,
  handleSavePattern,
  handleCancelEditPattern,
  index
}) => {
  const { t } = useTranslation(); // Add translation hook
  const [isGeneratingFromUrl, setIsGeneratingFromUrl] = useState(false);
  const [sampleUrl, setSampleUrl] = useState("");

  // Helper function to generate regex from a URL
  const generateRegexFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const origin = urlObj.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Case 1: /browse/KEY-123 format
      const browseMatch = path.match(/^(.*?\/browse\/)([A-Z][A-Z0-9]+)-\d+$/i);
      if (browseMatch) {
        const basePath = browseMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const projectKey = browseMatch[2];
        return `^${origin}${basePath}${projectKey}-\\d+(?:[?#]|$)`;
      }

      // Case 2: URLs with selectedIssue=KEY-123 in query params
      const selectedIssue = searchParams.get('selectedIssue');
      if (selectedIssue) {
        const issueMatch = selectedIssue.match(/^([A-Z][A-Z0-9]+)-\d+$/i);
        if (issueMatch) {
          const projectKey = issueMatch[1];
          const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return `^${origin}${escapedPath}(?:\\?.*)?(?:&|\\?)selectedIssue=${projectKey}-\\d+`;
        }
      }

      // Fallback to a less specific pattern
      console.warn("Could not generate a specific pattern for URL, using basic origin/path match:", url);
      return `^${origin}${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`;

    } catch (e) {
      console.error("Error parsing URL for regex generation:", e);
      return null;
    }
  };

  // Handle toggle between direct regex input and URL generation
  const handleModeToggle = () => {
    setIsGeneratingFromUrl(!isGeneratingFromUrl);
    // Reset pattern data when switching modes
    if (patternData) {
      setPatternData({ 
        pattern: "", 
        enabled: patternData.enabled !== false
      });
      setSampleUrl("");
    }
  };

  // Handle URL input change when in URL generation mode
  const handleUrlInputChange = (newValue: string) => {
    setSampleUrl(newValue);
    if (!newValue.trim()) {
      setPatternData({ 
        pattern: "", 
        enabled: patternData?.enabled !== false
      });
      return;
    }

    const generatedPattern = generateRegexFromUrl(newValue);
    if (generatedPattern) {
      setPatternData({ 
        pattern: generatedPattern, 
        enabled: patternData?.enabled !== false
      });
    }
  };

  return (
    <div className="p-4 pt-2">
      {/* Toggle Switch for pattern input mode */}
      <div className="flex items-center mb-4">
        <label htmlFor={`generate-mode-toggle-${index}`} className="text-sm font-medium mr-3 text-gray-600 dark:text-gray-300 cursor-pointer">
          {t('pattern.enterRegex')}
        </label>
      <button
        type="button"
          id={`generate-mode-toggle-${index}`}
          role="switch"
          aria-checked={isGeneratingFromUrl}
          onClick={handleModeToggle}
          className={`${
            isGeneratingFromUrl ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
        >
          <span className="sr-only">{t('pattern.useUrlGeneration')}</span>
          <span
            aria-hidden="true"
            className={`${
              isGeneratingFromUrl ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </button>
        <label htmlFor={`generate-mode-toggle-${index}`} className="text-sm font-medium ml-3 text-gray-600 dark:text-gray-300 cursor-pointer">
          {t('pattern.generateFromUrl')}
        </label>
      </div>

      {isGeneratingFromUrl ? (
        // URL Input for generating pattern
        <div className="mb-3">
          <label
            htmlFor={`url-input-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sample JIRA URL
          </label>
          <input
            id={`url-input-${index}`}
            type="url"
            className="block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-blue-500 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={sampleUrl}
            onChange={(e) => handleUrlInputChange(e.target.value)}
            placeholder="e.g., https://jira.example.com/browse/PROJ-123"
            autoFocus
          />
        </div>
      ) : (
        // Direct Regex Input
        <div className="mb-3">
          <label
            htmlFor={`pattern-input-${index}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pattern
          </label>
          <div className="relative">
            <input
              id={`pattern-input-${index}`}
              type="text"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm text-sm font-mono 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                ${!isCurrentPatternValid 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700' 
                  : isPreviewMatch
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              value={patternData?.pattern || ""}
              onChange={(e) => 
                setPatternData((prev) => ({ 
                  ...(prev || { pattern: "" }), 
                  pattern: e.target.value 
                }))
              }
              placeholder="Enter pattern (e.g., ^https://jira\.example\.com/browse/PROJ-\d+)"
              autoFocus
            />
            {/* Visual validation indicator */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {!isCurrentPatternValid && (
                <span className="text-red-500 dark:text-red-400">
                  <ErrorIcon />
                </span>
              )}
              {isCurrentPatternValid && isPreviewMatch && (
                <span className="text-green-500 dark:text-green-400">
                  <CheckIcon />
                </span>
              )}
    </div>
  </div>
          {!isCurrentPatternValid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Please enter a valid regular expression pattern
            </p>
          )}
        </div>
      )}

      {/* Generated Pattern Display (only in URL mode) */}
      {isGeneratingFromUrl && patternData?.pattern && (
        <div className="mt-2 p-2 mb-3 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-700">
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Generated Pattern:</p>
          <code className="block text-sm font-mono text-green-700 dark:text-green-400 break-all select-all">
            {patternData.pattern}
          </code>
        </div>
      )}

      <div className="flex items-center mb-4">
        <input
          id={`pattern-enabled-${index}`}
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
          checked={patternData?.enabled !== false}
          onChange={(e) => setPatternData(prev => ({ ...(prev || { pattern: "" }), enabled: e.target.checked }))}
        />
        <label
          htmlFor={`pattern-enabled-${index}`}
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          {t('pattern.enable')}
        </label>
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm border focus:ring-blue-500 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus:ring-offset-gray-900 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          onClick={handleCancelEditPattern}>
          {t('pattern.cancel')}
        </button>
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${!isCurrentPatternValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSavePattern}
          disabled={!patternData?.pattern || !isCurrentPatternValid}>
          {index === -1 ? t('jira.addPattern') : t('pattern.save')}
        </button>
      </div>
    </div>
  );
};

// Move getUrlDescription outside the component
const getUrlDescription = (key: string, t: (key: string) => string): string => {
  const descriptions: Record<string, string> = {
    bo: t('urls.boDesc'),
    desktop: t('urls.desktopDesc'),
    mobile: t('urls.mobileDesc'),
    drupal7: t('urls.drupal7Desc'),
    drupal9: t('urls.drupal9Desc'),
  };
  
  return descriptions[key] || "";
};

type UrlKey = 'mobile' | 'desktop' | 'bo' | 'drupal7' | 'drupal9';

const IndexOptions = () => {
  const { t } = useTranslation(); // Add translation hook at the top level
  
  // Use standard useState for managing settings
  const [settings, setSettings] = useState<SettingsStorage>(DEFAULT_SETTINGS);
  const [tempSettings, setTempSettings] = useState<SettingsStorage>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [editingPatternIndex, setEditingPatternIndex] = useState<number | null>(null);
  const [editingPatternData, setEditingPatternData] = useState<CustomJiraPattern | null>(null);
  const [isCurrentPatternValid, setIsCurrentPatternValid] = useState(true);
  const [isPreviewMatch, setIsPreviewMatch] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [baseUrlChanges, setBaseUrlChanges] = useState<boolean>(false);
  const [showPreviewDemo, setShowPreviewDemo] = useState(false);

  // Effect to load settings initially
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // First initialize language from storage
    initializeLanguage().then(() => {
      // Then load settings
      getSettings().then((loadedSettings) => {
        if (isMounted) {
          // Ensure the loaded settings match the required structure
          const validatedSettings: SettingsStorage = {
            ...DEFAULT_SETTINGS,
            ...loadedSettings,
            urls: {
              mobile: loadedSettings.urls?.mobile || DEFAULT_SETTINGS.urls.mobile,
              desktop: loadedSettings.urls?.desktop || DEFAULT_SETTINGS.urls.desktop,
              bo: loadedSettings.urls?.bo || DEFAULT_SETTINGS.urls.bo,
              drupal7: loadedSettings.urls?.drupal7 || DEFAULT_SETTINGS.urls.drupal7,
              drupal9: loadedSettings.urls?.drupal9 || DEFAULT_SETTINGS.urls.drupal9,
            }
          };
          
          setSettings(validatedSettings);
          setTempSettings(validatedSettings);
          setSelectedLanguage(
            validatedSettings.language || navigator.language.split("-")[0] || "auto"
          );
          setIsLoading(false);
        }
      }).catch(error => {
        console.error("Failed to load initial settings:", error);
        if (isMounted) {
          setSettings(DEFAULT_SETTINGS);
          setTempSettings(DEFAULT_SETTINGS);
          setSelectedLanguage("auto");
          setIsLoading(false);
        }
      });
    }).catch(error => {
      console.error("Failed to initialize language:", error);
      if (isMounted) {
        getSettings().then((loadedSettings) => {
          if (isMounted) {
            // Ensure the loaded settings match the required structure
            const validatedSettings: SettingsStorage = {
              ...DEFAULT_SETTINGS,
              ...loadedSettings,
              urls: {
                mobile: loadedSettings.urls?.mobile || DEFAULT_SETTINGS.urls.mobile,
                desktop: loadedSettings.urls?.desktop || DEFAULT_SETTINGS.urls.desktop,
                bo: loadedSettings.urls?.bo || DEFAULT_SETTINGS.urls.bo,
                drupal7: loadedSettings.urls?.drupal7 || DEFAULT_SETTINGS.urls.drupal7,
                drupal9: loadedSettings.urls?.drupal9 || DEFAULT_SETTINGS.urls.drupal9,
              }
            };
            setSettings(validatedSettings);
            setTempSettings(validatedSettings);
            setSelectedLanguage("auto");
            setIsLoading(false);
          }
        }).catch(() => {
          if (isMounted) {
            setSettings(DEFAULT_SETTINGS);
            setTempSettings(DEFAULT_SETTINGS);
            setSelectedLanguage("auto");
            setIsLoading(false);
          }
        });
      }
    });

    return () => { isMounted = false; };
  }, []);

  // Effect to listen for external changes to settings
  useEffect(() => {
    const handleExternalChange = (newSettings: SettingsStorage) => {
      console.log("Settings changed externally, updating options page state.");
      setSettings(newSettings); // Update the 'saved' state
      // Decide if you want to overwrite tempSettings or just notify user
      // For simplicity, let's update tempSettings too, assuming external changes should be reflected
      setTempSettings(newSettings);
      setSelectedLanguage(
        newSettings.language || navigator.language.split("-")[0] || "auto"
      );
      // Maybe show a toast? showToast("Settings updated from another source.", "info");
    };

    addSettingsListener(handleExternalChange);

    // Return a cleanup function to remove the listener
    return () => {
      // Correctly remove the specific listener function
      // Note: This requires removeSettingsListener to handle function references correctly
      // If storageService doesn't manage listener references, this might need adjustment
      const listenerToRemove = handleExternalChange as any;
      removeSettingsListener(listenerToRemove);
    };
  }, []); // Empty dependency array to run only on mount/unmount

  const isDirty = useMemo(() => {
    // Only compare if settings have loaded
    if (isLoading) return false;
    return JSON.stringify(settings) !== JSON.stringify(tempSettings);
  }, [settings, tempSettings, isLoading]);

  const showToast = useCallback((message: string, type: string) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), DEFAULT_TOAST_TIMEOUT_MS);
  }, []);

  const addPrefix = (prefixToAdd: string) => {
    const trimmedPrefix = prefixToAdd.trim();
    if (trimmedPrefix === "") {
      showToast(t('validation.prefixEmpty'), "error");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(trimmedPrefix)) {
      showToast(t('validation.prefixAlphanumeric'), "error");
      return false;
    }
    if (!tempSettings.prefixes.includes(trimmedPrefix)) {
      setTempSettings((prev) => ({
        ...prev,
        prefixes: [...prev.prefixes, trimmedPrefix]
      }));
      return true;
    } else {
      showToast(t('validation.prefixExists'), "error");
      return false;
    }
  };

  const removePrefix = (indexToRemove: number) => {
    setTempSettings((prev) => ({
      ...prev,
      prefixes: prev.prefixes.filter((_, index) => index !== indexToRemove)
    }));
  };

  const addTicketType = (typeToAdd: string) => {
    const trimmedType = typeToAdd.trim();
    if (trimmedType === "") {
      showToast(t('validation.ticketTypeEmpty'), "error");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(trimmedType)) {
      showToast(t('validation.ticketTypeAlphanumeric'), "error");
      return false;
    }
    if (!tempSettings.ticketTypes.includes(trimmedType)) {
      setTempSettings((prev) => ({
        ...prev,
        ticketTypes: [...prev.ticketTypes, trimmedType]
      }));
      return true;
    } else {
      showToast(t('validation.ticketTypeExists'), "error");
      return false;
    }
  };

  const removeTicketType = (indexToRemove: number) => {
    setTempSettings((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleUrlChange = (key: UrlKey, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const cleanValue = value.replace(/^(https?:\/\/)/, '');

    setTempSettings((prev) => {
      const newUrls = { ...prev.urls, [key]: cleanValue };
      return {
        ...prev,
        urls: newUrls
      };
    });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text');
    if (pastedText.match(/^https?:\/\//)) {
      const match = pastedText.match(/^https?:\/\/(.+)/);
      if (match && match[1]) {
        event.preventDefault();
        const input = event.currentTarget;
        const key = input.id.replace('base-url-input-', '') as UrlKey;
        const strippedValue = match[1];
        const currentCursorPos = input.selectionStart || 0;
        
        setTempSettings((prev) => {
          const currentVal = prev.urls[key] || '';
          const textBeforeCursor = currentVal.substring(0, currentCursorPos);
          const textAfterCursor = currentVal.substring(currentCursorPos);
          const newValue = textBeforeCursor + strippedValue + textAfterCursor;
          const cleanValue = newValue.replace(/^(https?:\/\/)/, '');

          return {
            ...prev,
            urls: {
              ...prev.urls,
              [key]: cleanValue
            }
          };
        });
        
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = currentCursorPos + strippedValue.length;
        }, 0);
      }
    }
  };

  const handleSettingChange = useCallback(
    (key: keyof SettingsStorage, value: any) => {
      setTempSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleThemeChange = useCallback(
    (newTheme: SettingsStorage["theme"]) => {
      handleSettingChange("theme", newTheme);
    },
    [handleSettingChange]
  );

  useEffect(() => {
    const applyThemeClass = () => {
      const theme = tempSettings.theme;
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (theme === "dark" || (theme === "system" && prefersDark)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyThemeClass();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemThemeListener = (e: MediaQueryListEvent) => {
      if (tempSettings.theme === "system") {
        applyThemeClass();
      }
    };

    if (tempSettings.theme === "system") {
      mediaQuery.addEventListener("change", systemThemeListener);
    }

    return () => {
      mediaQuery.removeEventListener("change", systemThemeListener);
    };
  }, [tempSettings.theme]);

  const handleLanguageChange = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const lang = event.target.value;
      setSelectedLanguage(lang);
      handleSettingChange("language", lang);
      
      try {
        await changeLanguage(lang);
        showToast(t('settings.languageChanged'), "success");
      } catch (error) {
        console.error("Error changing language:", error);
        showToast(t('settings.languageChangeError'), "error");
      }
    },
    [t, showToast, handleSettingChange]
  );

  const savePreferences = useCallback(async () => { // Make async
    try {
      await saveSettings(tempSettings); // Use the new service function
      setSettings(tempSettings); // Update the local 'saved' state
      showToast(t('common.settingsSaved'), "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast(t('common.settingsError'), "error");
    }
  }, [tempSettings, showToast]);

  const resetChanges = useCallback(() => {
    if (
      window.confirm(t('common.confirmReset'))
    ) {
      // Use the current 'saved' state (settings) for reset
      setTempSettings(settings);
      setSelectedLanguage(
        settings.language === "auto"
          ? navigator.language.split("-")[0]
          : settings.language
      );
      showToast(t('common.changesReset'), "info");
    }
  }, [settings, showToast]); // Depend on the actual saved settings state

  const handleExport = useCallback(() => {
    try {
      const settingsToExport = {
        exportedAt: new Date().toISOString(),
        integrateQrImage: settings?.integrateQrImage ?? DEFAULT_SETTINGS.integrateQrImage,
        // Determine isDarkMode based on *current* document state, not potentially stale settings
        isDarkMode: document.documentElement.classList.contains('dark'),
        jiraPatterns: (settings?.jiraPatterns ?? DEFAULT_SETTINGS.jiraPatterns).map(pattern => ({
          // Ensure enabled is exported if present, default to true otherwise
          enabled: (pattern as CustomJiraPattern).enabled !== false,
          pattern: pattern.pattern
        })),
        language: settings?.language ?? DEFAULT_SETTINGS.language,
        prefixes: settings?.prefixes ?? DEFAULT_SETTINGS.prefixes,
        theme: settings?.theme ?? DEFAULT_SETTINGS.theme,
        ticketTypes: settings?.ticketTypes ?? DEFAULT_SETTINGS.ticketTypes,
        urlStructure: settings?.urlStructure ?? DEFAULT_SETTINGS.urlStructure,
        urls: settings?.urls ?? DEFAULT_SETTINGS.urls,
        useMarkdownCopy: settings?.useMarkdownCopy ?? DEFAULT_SETTINGS.useMarkdownCopy
      };

      const jsonString = JSON.stringify(settingsToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jira-url-wizard-settings.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(t('common.settingsExported'), "success");
    } catch (error) {
      console.error("Error exporting settings:", error);
      showToast(t('common.settingsExportError'), "error");
    }
  }, [settings, showToast]);

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== "string") {
            throw new Error("Failed to read file content.");
          }
          const importedData = JSON.parse(text);

          if (!importedData || typeof importedData !== "object") {
            throw new Error("Invalid file format.");
          }

          // Validate and merge imported data carefully
          const newSettings: SettingsStorage = { ...DEFAULT_SETTINGS }; // Start with defaults

          // Merge fields from importedData if they exist and have the correct type
          if (["light", "dark", "system"].includes(importedData.theme)) {
            newSettings.theme = importedData.theme;
          }
          if (Array.isArray(importedData.prefixes) && importedData.prefixes.every((p:any) => typeof p === 'string')) {
            newSettings.prefixes = importedData.prefixes;
          }
          if (Array.isArray(importedData.ticketTypes) && importedData.ticketTypes.every((t:any) => typeof t === 'string')) {
            newSettings.ticketTypes = importedData.ticketTypes;
          }
          if (typeof importedData.urls === 'object' && importedData.urls !== null) {
            // Further validation for URL values might be needed
            newSettings.urls = importedData.urls;
          }
          if (Array.isArray(importedData.jiraPatterns) && importedData.jiraPatterns.every((jp:any) => typeof jp === 'object' && jp !== null && typeof jp.pattern === 'string')) {
            // Ensure 'enabled' defaults to true if missing
            newSettings.jiraPatterns = importedData.jiraPatterns.map((jp: any) => ({
              pattern: jp.pattern,
              enabled: jp.enabled !== false // Default to true if undefined or true
            }));
          }
          if (typeof importedData.integrateQrImage === "boolean") {
            newSettings.integrateQrImage = importedData.integrateQrImage;
          }
          if (typeof importedData.useMarkdownCopy === "boolean") {
            newSettings.useMarkdownCopy = importedData.useMarkdownCopy;
          }
          if (Array.isArray(importedData.urlStructure) && importedData.urlStructure.every((u:any) => typeof u === 'string')) {
            newSettings.urlStructure = importedData.urlStructure;
          }
           if (Object.keys(AVAILABLE_LANGUAGES).includes(importedData.language)) {
             newSettings.language = importedData.language;
           }

          // Apply the merged settings to the temporary state
          setTempSettings(newSettings);

          // Update theme immediately
          const theme = newSettings.theme;
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          document.documentElement.classList.toggle(
            "dark",
            theme === "dark" || (theme === "system" && prefersDark)
          );

          // Update language selection
          setSelectedLanguage(
            newSettings.language === "auto"
              ? navigator.language.split("-")[0] || "auto"
              : newSettings.language
          );

          showToast(
            "Settings imported successfully! Review and click Save to apply changes.",
            "info"
          );
        } catch (error) {
          console.error("Error importing settings:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          showToast(t('common.settingsImportError', { error: errorMessage }), "error");
        } finally {
          event.target.value = ""; // Clear the file input
        }
      };
      reader.onerror = () => {
        showToast("Error reading file", "error");
        event.target.value = ""; // Clear the file input
      };
      reader.readAsText(file);
    },
    [showToast, t] // Removed tempSettings dependency as we now start from defaults
  );

  const sampleUrl = useMemo(() => {
    const samplePrefix = tempSettings.prefixes?.[0] || "PREFIX"
    const sampleType = tempSettings.ticketTypes?.[0]
    const sampleBaseUrl =
      Object.values(tempSettings.urls || {})[0] ||
      "https://your-jira.example.com"
    const sampleTicketId = "123"
    const formattedSampleId = sampleType
      ? `${samplePrefix}-${sampleType}-${sampleTicketId}`
      : `${samplePrefix}-${sampleTicketId}`
    return `${sampleBaseUrl.startsWith("http") ? sampleBaseUrl : `https://${sampleBaseUrl}`}/${formattedSampleId}`
  }, [tempSettings.prefixes, tempSettings.ticketTypes, tempSettings.urls])

  useEffect(() => {
    if (editingPatternData) {
      const pattern = editingPatternData.pattern

      if (!pattern) {
        setIsCurrentPatternValid(true)
        setIsPreviewMatch(false)
        return
      }
      try {
        const generatedRegex = new RegExp(pattern)
        setIsCurrentPatternValid(true)
        setIsPreviewMatch(generatedRegex.test(sampleUrl))
      } catch (e) {
        console.error("Regex validation error:", e)
        setIsCurrentPatternValid(false)
        setIsPreviewMatch(false)
      }
    } else {
      setIsCurrentPatternValid(true)
      setIsPreviewMatch(false)
    }
  }, [editingPatternData, sampleUrl])

  const handleEditPattern = (index: number | null) => {
    if (index === null) {
      setEditingPatternIndex(-1)
      setEditingPatternData({ pattern: "", enabled: true })
    } else {
      setEditingPatternIndex(index)
      const pattern = tempSettings.jiraPatterns[index] as CustomJiraPattern
      setEditingPatternData({
        pattern: pattern.pattern || "",
        enabled: pattern.enabled !== false
      })
    }
  }

  const handleCancelEditPattern = () => {
    setEditingPatternIndex(null)
    setEditingPatternData(null)
    setIsCurrentPatternValid(true)
    setIsPreviewMatch(false)
  }

  const handleSavePattern = (index?: number) => {
    if (editingPatternIndex === null || !editingPatternData) return;

    const newPattern = editingPatternData.pattern.trim();

    if (!newPattern) {
      showToast(t('common.patternCannotBeEmpty'), "error");
      return;
    }

    try {
      new RegExp(newPattern);
    } catch (e) {
      showToast(t('common.invalidRegexSyntax'), "error");
      return;
    }

    setTempSettings((prev) => {
      const updatedPatterns = [...(prev.jiraPatterns || [])] as CustomJiraPattern[];
      const newPatternData: CustomJiraPattern = { 
        pattern: newPattern,
        enabled: editingPatternData.enabled !== false 
      };

      if (editingPatternIndex === -1) {
        updatedPatterns.push(newPatternData);
      } else {
        updatedPatterns[editingPatternIndex] = newPatternData;
      }
      return { ...prev, jiraPatterns: updatedPatterns };
    });

    handleCancelEditPattern();
    showToast(t('common.patternUpdated'), "info");
  };

  const handleRemovePattern = (indexToRemove: number) => {
    const patternToRemove = tempSettings.jiraPatterns[indexToRemove]?.pattern
    const confirmationMessage = `Are you sure you want to remove this pattern?\n\n${patternToRemove}`
    if (window.confirm(confirmationMessage)) {
      setTempSettings((prev) => ({
        ...prev,
        jiraPatterns: prev.jiraPatterns.filter(
          (_, index) => index !== indexToRemove
        )
      }))
      if (editingPatternIndex === indexToRemove) {
        handleCancelEditPattern()
      }
      showToast(t('common.patternRemoved'), "info")
    }
  }

  const handleTogglePattern = (index: number, enabled: boolean) => {
    setTempSettings(prev => {
      const updatedPatterns = [...prev.jiraPatterns] as CustomJiraPattern[];
      updatedPatterns[index] = {
        ...updatedPatterns[index],
        enabled
      };
      return {
        ...prev,
        jiraPatterns: updatedPatterns
      };
    });
    
    showToast(t('common.patternStatus', { status: enabled ? t('common.enabled') : t('common.disabled') }), "info");
  };

  console.log(
    "Current Pattern:",
    editingPatternData?.pattern,
    "Is Button Disabled:",
    !editingPatternData?.pattern.trim()
  )

  // Add resetBaseUrlChanges and saveBaseUrlChanges functions
  const resetBaseUrlChanges = useCallback(() => {
    if (settings?.urls) {
      setTempSettings(prev => ({ ...prev, urls: { ...settings.urls } }));
      setBaseUrlChanges(false);
      showToast("URL changes reset", "info");
    }
  }, [settings, showToast]);

  const saveBaseUrlChanges = useCallback(() => {
    setSettings(tempSettings);
    setBaseUrlChanges(false);
    showToast("URL changes saved successfully!", "success");
  }, [tempSettings, setSettings, showToast]);

  // Add the generateMarkdownOutput function inside IndexOptions, before the return statement
  const generateMarkdownOutput = useCallback((): string => {
    // Use saved settings for all relevant parts
    const { urls, prefixes, ticketTypes, urlStructure } = settings;
    const examplePrefix = prefixes[0] || 'PROJECT'; // Use first prefix or fallback

    // Helper to construct URL and shorten link text
    const createLink = (key: string, path: string = '', query: string = '', linkTextPrefix: string = '') => {
        const baseUrlValue = urls[key];
        if (!baseUrlValue) return `${linkTextPrefix} → N/A (URL not configured)`;
        
        const fullUrl = `https://${baseUrlValue}${path}${query}`;
        return `${linkTextPrefix} → ${fullUrl}`;
    };

    // Build Markdown String section by section using the helper
    let markdown = `🌐 Frontend Environments\n\n`;
    markdown += createLink('bo', '', '', 'Back Office Tool') + '\n\n';
    markdown += createLink('mobile', '', '', 'Mobile Version') + '\n\n';
    markdown += createLink('desktop', '', '', 'Desktop Version') + '\n\n';
    
    markdown += `📝 CMS Environments\n\n`;
    markdown += `⏳ Drupal 7\n\n`; // Added emoji
    markdown += createLink('drupal7', '', '', 'Base CMS') + '\n\n';
    markdown += createLink('drupal7', '/fahrradversicherung', '?deviceoutput=desktop', 'Desktop View') + '\n\n';
    markdown += createLink('drupal7', '/fahrradversicherung', '?deviceoutput=mobile', 'Mobile View') + '\n\n';
    
    markdown += `✨ Drupal 9\n\n`; // Added emoji
    markdown += createLink('drupal9', '/fahrradversicherung', '', 'Desktop View') + '\n\n';
    markdown += createLink('drupal9', '/fahrradversicherung', '', 'Mobile View') + '\n\n';

    // Placeholder for URL structure part - This function doesn't seem to use urlStructure or ticketTypes currently
    // If needed, add logic here to incorporate urlStructure and ticketTypes

    return markdown;
  }, [settings.urls, settings.prefixes, settings.ticketTypes, settings.urlStructure]); // Depend on saved settings

  const generatePlainTextOutput = useCallback((): string => {
    // Use saved settings for all relevant parts
    const { urls, prefixes, ticketTypes, urlStructure } = settings; 

    // Helper to construct URL for plain text
    const createPlainTextLine = (key: string, labelPrefix: string, path: string = '', query: string = '') => {
        const baseUrlValue = urls[key];
        if (!baseUrlValue) return `${labelPrefix} → N/A (URL not configured)`;
        
        const fullUrl = `https://${baseUrlValue}${path}${query}`;
        return `${labelPrefix} → ${fullUrl}`;
    };

    let text = `🌐 Frontend Environments\n\n`;
    text += createPlainTextLine('bo', 'Back Office Tool') + '\n\n';
    text += createPlainTextLine('mobile', 'Mobile Version') + '\n\n';
    text += createPlainTextLine('desktop', 'Desktop Version') + '\n\n';
    
    text += `📝 CMS Environments\n\n`;
    text += `⏳ Drupal 7\n\n`; // Added emoji
    text += createPlainTextLine('drupal7', 'Base CMS') + '\n\n';
    text += createPlainTextLine('drupal7', 'Desktop View', '/fahrradversicherung', '?deviceoutput=desktop') + '\n\n';
    text += createPlainTextLine('drupal7', 'Mobile View', '/fahrradversicherung', '?deviceoutput=mobile') + '\n\n';
    
    text += `✨ Drupal 9\n\n`; // Added emoji
    text += createPlainTextLine('drupal9', 'Desktop View', '/fahrradversicherung') + '\n\n';
    text += createPlainTextLine('drupal9', 'Mobile View', '/fahrradversicherung') + '\n\n';

    // Placeholder for URL structure part - This function doesn't seem to use urlStructure or ticketTypes currently
    // If needed, add logic here to incorporate urlStructure and ticketTypes

    return text;
  }, [settings.urls, settings.prefixes, settings.ticketTypes, settings.urlStructure]); // Depend on saved settings

  // Use the isLoading state for the loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading settings...
      </div>
    );
  }

  const Section: React.FC<{
    id: string
    children: React.ReactNode
    className?: string
  }> = ({ id, children, className = "" }) => (
    <section
      id={id}
      className={`p-5 rounded-lg shadow-md options-section bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {children}
    </section>
  )

  const SectionHeading: React.FC<{
    id: string
    children: React.ReactNode
    infoText?: string
  }> = ({ id, children, infoText }) => (
    <h2
      id={id}
      className={`text-xl font-semibold mb-5 flex items-center gap-2 options-section__heading text-gray-800 dark:text-gray-200`}>
      {children}
      {infoText && <InfoPopup text={infoText} darkMode={document.documentElement.classList.contains('dark')} />}
    </h2>
  )

  const Button: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: "primary" | "secondary" | "danger" | "ghost"
      size?: "sm" | "md"
    }
  > = ({
    children,
    variant = "secondary",
    size = "md",
    className = "",
    ...props
  }) => {
    const baseStyle =
      "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
    const sizeStyle = size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2 text-sm"
    let variantStyle = ""
    switch (variant) {
      case "primary":
        variantStyle = `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`
        break
      case "danger":
        variantStyle = `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
        break
      case "ghost":
        variantStyle = `focus:ring-blue-500 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-offset-white dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800`
        break
      case "secondary":
      default:
        variantStyle = `border focus:ring-blue-500 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus:ring-offset-gray-900`
        break
    }
    return (
      <button
        className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
        {...props}>
        {children}
      </button>
    )
  }

  // Update the usage of getUrlDescription to pass the t function
  const urlDescription = (key: UrlKey) => getUrlDescription(key, t);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {toast && (
        <div
          id="options-toast"
          role="alert"
          aria-live="assertive"
          className={`fixed left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center options-toast mt-16 ${
            toast.type === "success" 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : toast.type === "error" 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
          }`}>
          <span id="options-toast-message">{toast.message}</span>
        </div>
      )}

      <header className="sticky top-0 z-50 flex-shrink-0 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto p-3 md:p-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2 options-header__title-group">
            <SettingsIcon className="w-5 h-5 text-blue-500 options-header__icon" />
            <h1
              id="options-title"
              className="text-xl font-bold options-header__title">
              {t('settings.title')}
            </h1>
          </div>
          <div className="flex flex-wrap items-center space-x-1 options-header__actions">
            <input
              type="file"
              id="options-header-import-input"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
              className="options-header__import-input"
              aria-label={t('settings.importFileLabel')}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                document.getElementById("options-header-import-input")?.click()
              }
              title={t('settings.import')}>
              <UploadIcon size={16} />
              <span>{t('common.import')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              id="options-header-export-button"
              onClick={handleExport}
              title={t('settings.export')}
              aria-label={t('settings.export')}>
              <DownloadIcon size={16} />
              <span>{t('common.export')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-10">
          <div className="grid grid-cols-1 gap-10">
            <Section id="general-settings-section">
              <SectionHeading id="general-settings-heading">
                <SettingsIcon className="text-gray-600 dark:text-gray-400" />
                {t('navigation.generalSettings')}
              </SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                <InputGroup className="flex flex-col">
                  <Label id="theme-label" className="flex items-center gap-2">
                    <SunIcon />
                    {t('settings.theme')}
                  </Label>
                  <div
                    className={`flex space-x-1 rounded-lg p-1 bg-gray-200/50 dark:bg-gray-700/50`}>
                    {(["light", "dark", "system"] as const).map(
                      (themeOption) => (
                        <Button
                          key={themeOption}
                          variant={
                            tempSettings.theme === themeOption
                              ? "primary"
                              : "ghost"
                          }
                          size="sm"
                          className={`flex-1 capitalize transition-all duration-150 ${tempSettings.theme === themeOption ? "shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-100"}`}
                          onClick={() => handleThemeChange(themeOption)}>
                          {themeOption === "light" && (
                            <LightThemeIcon className="mr-1" />
                          )}
                          {themeOption === "dark" && (
                            <DarkThemeIcon className="mr-1" />
                          )}
                          {themeOption === "system" && (
                            <SystemThemeIcon className="mr-1" />
                          )}
                          {t(`settings.themes.${themeOption}`)}
                        </Button>
                      )
                    )}
                  </div>
                </InputGroup>

                <InputGroup className="flex flex-col">
                  <Label id="language-label" htmlFor="language-select" className="flex items-center gap-2">
                    <LanguageIcon />
                    {t('settings.language')}
                  </Label>
                  <div className="relative">
                    <select
                      id="language-select"
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      className={`w-full p-2 pr-10 rounded-md appearance-none options-section__input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500 border transition-colors duration-150 focus:outline-none focus:ring-1`}>
                      {Object.entries(AVAILABLE_LANGUAGES).map(
                        ([code, name]) => (
                          <option key={code} value={code}>
                            {code === 'auto' ? t('Auto') : code === 'en' ? t('English') : t('Deutsch')}
                          </option>
                        )
                      )}
                    </select>
                    <div
                      className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400`}>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('settings.chooseLanguage')}</p>
                </InputGroup>

                <div className="mb-5 options-section__input-group md:col-span-2 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="integrate-logo-qr" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                        <QRCodeIcon className="mr-2 text-gray-500 dark:text-gray-400" />
                        {t('features.qrIntegrationLabel')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{t('features.qrIntegrationDesc')}</p>
                    </div>
                    <Toggle
                      id="integrate-logo-qr"
                      checked={tempSettings.integrateQrImage}
                      onCheckedChange={(checked) => handleSettingChange("integrateQrImage", checked)}
                      aria-label={t('features.qrIntegrationLabel')}
                    />
                  </div>
                </div>

                <div className="mb-5 options-section__input-group md:col-span-2 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="use-markdown-copy" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                        <MarkdownCopyIcon className="mr-2 text-gray-500 dark:text-gray-400" />
                        {t('features.useMarkdownFormatting')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{t('features.markdownCopyDesc')}</p>
                    </div>
                    <Toggle
                      id="use-markdown-copy"
                      checked={tempSettings.useMarkdownCopy}
                      onCheckedChange={(checked) => handleSettingChange("useMarkdownCopy", checked)}
                      aria-label={t('features.markdownCopyLabel')}
                    />
                  </div>
                </div>

                <div className="mb-5 options-section__input-group md:col-span-2 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="allow-manual-ticket-input" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                        <ManualTicketIcon className="mr-2 text-gray-500 dark:text-gray-400" />
                        {t('features.allowManualTicketInput')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{t('features.manualTicketInputDesc')}</p>
                    </div>
                    <Toggle
                      id="allow-manual-ticket-input"
                      checked={tempSettings.allowManualTicketInput}
                      onCheckedChange={(checked) => handleSettingChange("allowManualTicketInput", checked)}
                      aria-label="Allow manual ticket input"
                    />
                  </div>
                </div>

                <div className="mb-5 options-section__input-group md:col-span-2 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="show-advanced-settings" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                        <AdvancedSettingsIcon className="mr-2 text-gray-500 dark:text-gray-400" />
                        {t('features.advancedConfig')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{t('features.advancedConfigDesc')}</p>
                    </div>
                    <Toggle
                      id="show-advanced-settings"
                      checked={tempSettings.showAdvancedSettings}
                      onCheckedChange={(checked) => handleSettingChange("showAdvancedSettings", checked)}
                      aria-label="Show advanced settings"
                    />
                  </div>
                </div>

                {/* Preview Demo Button */}
                <div className="md:col-span-2 pt-3 border-t border-gray-100 dark:border-gray-700 hidden">
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPreviewDemo(prev => !prev)} // Toggle the preview state
                    className="w-full justify-center"
                    aria-expanded={showPreviewDemo} // Add aria-expanded for accessibility
                  >
                    <EyeIcon className="mr-2" />
                    {showPreviewDemo ? 'Hide' : 'Preview'} {t('features.toggleEffects')}
                  </Button>
                </div>
              </div> 
              {/* End of grid */}

              {/* Preview Demo Section (Conditional) */}
              {showPreviewDemo && (
                <div className="mt-4 p-4 rounded-md border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                  <div className="space-y-4">
                    {/* QR Code Logo Demo - Updated with react-qrcode-logo */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">{t('features.qrCodePreview')}</h5>
                      <div className="flex flex-col items-center justify-center p-4 rounded border bg-white dark:bg-gray-800 dark:border-gray-600 min-h-[150px]">
                        <QRCode 
                          value="https://example-jira.com/browse/EXAMPLE-123" // Sample QR value
                          size={100} // Adjust size as needed
                          qrStyle="dots"
                          eyeRadius={5}
                          // Conditional logo props
                          logoImage={tempSettings.integrateQrImage 
                            ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23007bff'/%3E%3Ctext x='50' y='55' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-weight='bold'%3ELOGO%3C/text%3E%3C/svg%3E" // Simple SVG placeholder logo
                            : undefined}
                          logoWidth={tempSettings.integrateQrImage ? 25 : undefined}
                          logoHeight={tempSettings.integrateQrImage ? 25 : undefined}
                          logoOpacity={tempSettings.integrateQrImage ? 1 : undefined}
                          logoPadding={tempSettings.integrateQrImage ? 2 : 0}
                          logoPaddingStyle={tempSettings.integrateQrImage ? 'circle' : 'square'}
                          removeQrCodeBehindLogo={tempSettings.integrateQrImage}
                          />
                        <p className={`mt-3 text-center text-xs font-medium ${tempSettings.integrateQrImage ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                         {t('features.logoIntegrationPreview')}: {tempSettings.integrateQrImage ? t('common.on') : t('common.off')}
                       </p>
                      </div>
                    </div>

                    {/* Markdown/Plain Text Copy Demo - Updated to show only active mode */}
                    <div>
                      <h5 className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">{t('features.copyFormatPreview')}</h5>
                      <div className="text-xs">
                        {tempSettings.useMarkdownCopy ? (
                          // Show Markdown Preview when active
                          <div className={`p-2 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30`}>
                             <p className={`font-semibold mb-1 text-blue-800 dark:text-blue-300`}>
                               {t('features.markdownFormatActive')}
                             </p>
                            {/* Use MarkdownRenderer with generated markdown */}
                            <MarkdownRenderer 
                              markdownText={generateMarkdownOutput()} 
                              className="prose prose-sm dark:prose-invert max-w-none text-[11px] leading-snug"
                            />
                            <div className="mt-2 text-right">
                               <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(generateMarkdownOutput());
                                    showToast(t('common.markdownCopied'), "success");
                                  }}
                                  className="text-xs"
                               >
                                 {t('common.copyPreview')}
                               </Button>
                             </div>
                          </div>
                        ) : (
                          // Show Plain Text Preview when active
                          <div className={`p-2 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30`}>
                            <p className={`font-semibold mb-1 text-blue-800 dark:text-blue-300`}>
                              {t('features.plainTextFormatActive')}
                            </p>
                            <pre className="whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 text-[11px] leading-relaxed">
                              {generatePlainTextOutput()}
                            </pre>
                            <div className="mt-2 text-right">
                               <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatePlainTextOutput());
                                    showToast(t('common.plainTextCopied'), "success");
                                  }}
                                  className="text-xs"
                               >
                                 Copy Preview
                               </Button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <Section id="prefixes-section">
              <SectionHeading
                id="prefixes-heading"
                infoText={t('sections.prefixesInfo')}>
                {t('sections.prefixesTitle')}
              </SectionHeading>
              <CustomTagInput
                id="prefix-new-input"
                label={t('features.issuePrefixes')}
                tags={tempSettings.prefixes}
                onAddTag={addPrefix}
                onRemoveTag={removePrefix}
                placeholder={t('jira.addPrefix')}
              />
              <CustomTagInput
                id="ticket-type-new-input"
                label={t('features.ticketTypes')}
                tags={tempSettings.ticketTypes}
                onAddTag={addTicketType}
                onRemoveTag={removeTicketType}
                placeholder={t('jira.addTicketType')}
              />
            </Section>

            <Section id="base-urls-section">
              <SectionHeading
                id="base-urls-heading"
                infoText={t('settings.baseUrlsInfo')}>
                {t('url.baseUrls')}
              </SectionHeading>
              
              <div className="space-y-4">
                {(Object.keys(tempSettings.urls) as UrlKey[]).map((key) => (
                  <div key={key} className="flex flex-col space-y-1">
                    <InputGroup className="relative">
                      <Label
                        id={`base-url-label-${key}`}
                        htmlFor={`base-url-input-${key}`}
                        className="font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Label>
                      
                      <div className="flex rounded-md overflow-hidden">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                          https://
                        </span>
                        <input
                          type="text"
                          id={`base-url-input-${key}`}
                          value={tempSettings.urls[key] || ''}
                          onChange={(e) => handleUrlChange(key, e)}
                          placeholder="my-env.example.com"
                          className={`flex-1 min-w-0 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 p-2 options-section__input bg-white text-gray-900 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500 border transition-colors duration-150 focus:outline-none focus:ring-1`}
                          aria-describedby={`url-description-${key}`}
                          onPaste={handlePaste}
                        />
                      </div>
                      
                      <p id={`url-description-${key}`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {urlDescription(key)}
                      </p>
                    </InputGroup>
                  </div>
                ))}
              </div>
        
            </Section>

            <details
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                open={advancedSettingsOpen}
                onToggle={(e) => setAdvancedSettingsOpen(e.currentTarget.open)}
                style={{ display: tempSettings.showAdvancedSettings ? 'block' : 'none' }}
            >
                <summary className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer flex items-center justify-between">
                    <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{t('settings.advanced')}</span>
                    {advancedSettingsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </summary>
                <div className="p-4 space-y-6">

                <section id="jira-patterns-section" className="mb-10">
                        <div
                            id="jira-patterns-header"
                            className="flex flex-wrap justify-between items-center gap-3 mb-5 options-section__header">
                            <h3
                                id="jira-patterns-heading"
                                className="text-lg font-medium options-section__heading flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span>{t('jira.urlPatterns')}</span>
                                <InfoPopup
                                    text={t('jira.urlPatternsInfo')}
                                    darkMode={document.documentElement.classList.contains('dark')}
                                />
                            </h3>
                            {editingPatternIndex === null && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    id="jira-patterns-add-new-button"
                                    onClick={() => handleEditPattern(null)}>
                                    {t('jira.addPattern')}
                                </Button>
                            )}
                        </div>

                        {editingPatternIndex === -1 && (
                            <div
                                id="jira-patterns-add-form"
                            className="rounded-md border mb-6 options-form bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                            <div className="flex justify-between items-center p-4 pb-2">
                                <h4
                                    id="jira-patterns-add-form-heading"
                                className="text-md font-semibold options-form__heading">
                                    {t('jira.addPattern')}
                                </h4>
                              {/* Added visual indicator for form state */}
                              {!isCurrentPatternValid && (
                                <span className="text-xs text-red-500 dark:text-red-400 animate-pulse">
                                  Invalid pattern
                                </span>
                              )}
                              {isCurrentPatternValid && isPreviewMatch && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  {t('common.patternMatchesPreview')}
                                </span>
                                        )}
                                    </div>
                            <PatternEditorForm
                              patternData={editingPatternData}
                              setPatternData={setEditingPatternData}
                              isCurrentPatternValid={isCurrentPatternValid}
                              isPreviewMatch={isPreviewMatch}
                              handleSavePattern={handleSavePattern}
                              handleCancelEditPattern={handleCancelEditPattern}
                              index={-1}
                            />
                            </div>
                        )}

                        <div className="space-y-3 text-sm">
                            {tempSettings.jiraPatterns?.length > 0 ? (
                                (tempSettings.jiraPatterns as CustomJiraPattern[]).map((jp, index) => (
                                    <div
                                        key={`pattern-${index}`}
                                        className={`rounded-md border mb-3 options-form ${
                                          editingPatternIndex === index 
                                            ? 'options-form--editing bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                        }`}>
                                        
                                        {editingPatternIndex === index ? (
                                          <>
                                            <div className="flex justify-between items-center p-4 pb-2">
                                              <h4 className="text-md font-semibold options-form__heading">
                                                {t('pattern.edit')}
                                              </h4>
                                              {/* Added visual indicators for form state */}
                                              {!isCurrentPatternValid && (
                                                <span className="text-xs text-red-500 dark:text-red-400 animate-pulse">
                                                  Invalid pattern
                                                </span>
                                              )}
                                              {isCurrentPatternValid && isPreviewMatch && (
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                  {t('common.patternMatchesPreview')}
                                                </span>
                                                    )}
                                                </div>
                                            <PatternEditorForm
                                              patternData={editingPatternData}
                                              setPatternData={setEditingPatternData}
                                              isCurrentPatternValid={isCurrentPatternValid}
                                              isPreviewMatch={isPreviewMatch}
                                              handleSavePattern={() => handleSavePattern(index)}
                                              handleCancelEditPattern={handleCancelEditPattern}
                                              index={index}
                                            />
                                          </>
                                        ) : (
                                            <div
                                                id={`pattern-readonly-view-${index}`}
                                                className="flex justify-between items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                                                <div
                                                    id={`pattern-readonly-view-text-container-${index}`}
                                                    className="flex-1 min-w-0 flex items-center">
                                                    <Toggle 
                                                      id={`pattern-toggle-${index}`}
                                                      checked={jp.enabled !== false}
                                                      onCheckedChange={(checked) => handleTogglePattern(index, checked)}
                                                      disabled={editingPatternIndex !== null}
                                                      aria-label={`Enable or disable pattern ${jp.pattern}`}
                                                      className="mr-3"
                                                    />
                                                    <p
                                                        id={`pattern-readonly-view-text-${index}`}
                                                        className={`font-mono text-sm break-all ${
                                                          jp.enabled !== false 
                                                            ? 'text-gray-700 dark:text-gray-300' 
                                                            : 'text-gray-400 dark:text-gray-500'
                                                        }`}>
                                                        {jp.pattern}
                                                    </p>
                                                </div>
                                                <div
                                                    id={`pattern-readonly-view-actions-${index}`}
                                                    className="flex gap-1 flex-shrink-0 opacity-70 group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        id={`pattern-readonly-edit-button-${index}`}
                                                        onClick={() => handleEditPattern(index)}
                                                        disabled={editingPatternIndex !== null}
                                                        title={t('pattern.edit')}
                                                        aria-label={t('pattern.edit')}>
                                                        <PencilIcon />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        id={`pattern-readonly-remove-button-${index}`}
                                                        onClick={() => handleRemovePattern(index)}
                                                        disabled={editingPatternIndex !== null}
                                                        title="Remove Pattern"
                                                        aria-label="Remove Pattern"
                                                        className="focus:ring-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800/30 dark:hover:text-red-400">
                                                        <XIcon size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : editingPatternIndex === -1 ? null : (
                                <p
                                    id="jira-patterns-empty-message"
                                    className="text-gray-500 dark:text-gray-400 text-center py-4 options-list-item__empty-message">
                                    {t('jira.noPatterns')}
                                </p>
                            )}
                        </div>
                    </section>
                    <section id="url-structure" className="mb-10">
                        <div id="url-structure-header" className="flex flex-wrap justify-between items-center gap-3 mb-5 options-section__header border-t border-gray-100 dark:border-gray-700 pt-3">
                        <h3 id="jira-patterns-heading" className="text-lg font-medium options-section__heading flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span>{t('sections.urlBuilderTitle')}</span>
                                <InfoPopup
                                    text={t('sections.urlBuilderInfo')}
                                    darkMode={document.documentElement.classList.contains('dark')}
                                />
                            </h3>
                        </div>
                        <URLComponentBuilder
                            prefixes={tempSettings.prefixes}
                            ticketTypes={tempSettings.ticketTypes}
                            urls={tempSettings.urls}
                            urlStructure={tempSettings.urlStructure}
                            onSavePattern={(pattern) => {
                                setTempSettings(prev => ({
                                    ...prev,
                                    urlStructure: pattern
                                }));
                            }}
                        />
                    </section>
                </div>
            </details>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 z-50 flex-shrink-0 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto p-3 md:p-4 flex justify-end space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetChanges}
            disabled={!isDirty || isLoading} // Disable if loading
            >
            {t('common.resetChanges')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={savePreferences}
            disabled={!isDirty || isLoading} // Disable if loading
            >
            {t('common.saveChanges')}
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default IndexOptions