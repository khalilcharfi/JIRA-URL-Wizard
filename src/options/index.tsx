import 'src/style.css'
import {
  ChevronDown,
  ChevronUp,
  Download,
  Languages,
  Pencil,
  RefreshCw,
  Save,
  Settings,
  Upload,
  X
} from "lucide-react"
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react"
import InfoPopup from "~src/components/InfoPopup";
import URLComponentBuilder from "~src/components/URLComponentBuilder";
import {DEFAULT_TOAST_TIMEOUT_MS} from "~src/utils/utils";
// Import the shared settings definitions
import { DEFAULT_SETTINGS } from "~src/shared/settings"
import type { SettingsStorage, JiraPattern } from "~src/shared/settings"

// First, let's update the JiraPattern type to include the enabled property
interface CustomJiraPattern extends JiraPattern {
  enabled?: boolean;
}

// Custom hook for chrome.storage.sync - Ensure this is defined and uncommented
function useStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    // Load initial value
    chrome.storage.sync.get(key).then((result) => {
      setValue(result[key] ?? defaultValue)
    })

    // Listen for changes
    const listener = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes[key]) {
        setValue(changes[key].newValue ?? defaultValue)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [key, defaultValue])

  const setStorageValue = useCallback(
    (newValue: T) => {
      chrome.storage.sync.set({ [key]: newValue }).then(() => {
        setValue(newValue)
      })
    },
    [key]
  )

  return [value, setStorageValue]
}

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
              <X size={12} strokeWidth={2.5} />
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
  Button: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: "primary" | "secondary" | "danger" | "ghost";
      size?: "sm" | "md";
    }
  >;
}

const PatternEditorForm: React.FC<PatternEditorFormProps> = ({
  patternData,
  setPatternData,
  isCurrentPatternValid,
  isPreviewMatch,
  handleSavePattern,
  handleCancelEditPattern,
  index,
  Button
}) => {
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
          Enter Regex Directly
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
          <span className="sr-only">Use URL generation</span>
          <span
            aria-hidden="true"
            className={`${
              isGeneratingFromUrl ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </button>
        <label htmlFor={`generate-mode-toggle-${index}`} className="text-sm font-medium ml-3 text-gray-600 dark:text-gray-300 cursor-pointer">
          Generate from Sample URL
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </span>
              )}
              {isCurrentPatternValid && isPreviewMatch && (
                <span className="text-green-500 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
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
          Enable this pattern
        </label>
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCancelEditPattern}
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSavePattern}
          disabled={!patternData?.pattern || !isCurrentPatternValid}
          className={!isCurrentPatternValid ? 'opacity-50 cursor-not-allowed' : ''}>
          {index === -1 ? 'Add Pattern' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

// Add the getUrlDescription helper function before the IndexOptions component
function getUrlDescription(key: string): string {
  const descriptions: Record<string, string> = {
    bo: "Backend Office Tool",
    desktop: "Desktop web interface",
    mobile: "Mobile web interface",
    drupal7: "Legacy CMS system",
    drupal9: "Current CMS system",
    // Add more descriptions as needed
  };
  
  return descriptions[key] || "";
}

const IndexOptions = () => {
  const [settings, setSettings] = useStorage<SettingsStorage>(
    "jiraUrlWizardSettings",
    DEFAULT_SETTINGS
  )

  const [tempSettings, setTempSettings] =
    useState<SettingsStorage>(DEFAULT_SETTINGS)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const browserLang = navigator.language.split("-")[0]
    return browserLang || "auto"
  })

  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  )

  const [editingPatternIndex, setEditingPatternIndex] = useState<number | null>(
    null
  )
  const [editingPatternData, setEditingPatternData] = useState<CustomJiraPattern | null>(null)
  const [isCurrentPatternValid, setIsCurrentPatternValid] = useState(true)
  const [isPreviewMatch, setIsPreviewMatch] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
  const [baseUrlChanges, setBaseUrlChanges] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setTempSettings(settings)
      setSelectedLanguage(
        settings.language || navigator.language.split("-")[0] || "auto"
      )
    }
  }, [settings])

  const isDirty = useMemo(() => {
    if (!settings) return false
    return JSON.stringify(settings) !== JSON.stringify(tempSettings)
  }, [settings, tempSettings])

  const showToast = useCallback((message: string, type: string) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), DEFAULT_TOAST_TIMEOUT_MS)
  }, [])

  const addPrefix = (prefixToAdd: string) => {
    const trimmedPrefix = prefixToAdd.trim();
    if (trimmedPrefix === "") {
      showToast("Prefix cannot be empty", "error");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(trimmedPrefix)) {
      showToast("Prefix can only contain letters and numbers", "error");
      return false;
    }
    if (!tempSettings.prefixes.includes(trimmedPrefix)) {
      setTempSettings((prev) => ({
        ...prev,
        prefixes: [...prev.prefixes, trimmedPrefix]
      }));
      return true;
    } else {
      showToast("This prefix already exists", "error");
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
      showToast("Ticket type cannot be empty", "error");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(trimmedType)) {
      showToast("Ticket type can only contain letters and numbers", "error");
      return false;
    }
    if (!tempSettings.ticketTypes.includes(trimmedType)) {
      setTempSettings((prev) => ({
        ...prev,
        ticketTypes: [...prev.ticketTypes, trimmedType]
      }));
      return true;
    } else {
      showToast("This ticket type already exists", "error");
      return false;
    }
  };

  const removeTicketType = (indexToRemove: number) => {
    setTempSettings((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleUrlChange = useCallback((key: string, value: string) => {
    // Strip out http:// or https:// if present
    const cleanValue = value.replace(/^(https?:\/\/)/, '');
    
    setTempSettings((prev) => {
      const newUrls = { ...prev.urls, [key]: cleanValue };
      // Check if any URL value has changed
      const hasChanged = Object.entries(newUrls).some(
        ([k, v]) => v !== (settings?.urls || {})[k]
      );
      setBaseUrlChanges(hasChanged);
      return { ...prev, urls: newUrls };
    });
  }, [settings]);

  // Add a custom paste handler for the URL inputs
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    // Get pasted content
    const pastedText = event.clipboardData.getData('text');
    // Check if it contains a protocol
    if (pastedText.match(/^https?:\/\//)) {
      // Extract the URL without the protocol
      const match = pastedText.match(/^https?:\/\/(.+)/);
      if (match && match[1]) {
        // Get the input element
        const input = event.currentTarget;
        // Stop the default paste operation
        event.preventDefault();
        // Insert the stripped URL at cursor position
        const cursorPos = input.selectionStart || 0;
        const textBeforeCursor = input.value.substring(0, cursorPos);
        const textAfterCursor = input.value.substring(cursorPos);
        const newValue = textBeforeCursor + match[1] + textAfterCursor;
        
        // Set the value - need to use a custom method due to using DebouncedTextInput
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, "value"
        )?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(input, newValue);
          // Trigger an input event to update internal state
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  };

  const handleSettingChange = useCallback(
    (key: keyof SettingsStorage, value: any) => {
      setTempSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleThemeChange = useCallback(
    (newTheme: SettingsStorage["theme"]) => {
      handleSettingChange("theme", newTheme)
    },
    [handleSettingChange]
  )

  useEffect(() => {
    const applyThemeClass = () => {
      const theme = tempSettings.theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches

      if (theme === "dark" || (theme === "system" && prefersDark)) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    applyThemeClass()

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const systemThemeListener = (e: MediaQueryListEvent) => {
      if (tempSettings.theme === "system") {
        applyThemeClass()
      }
    }

    if (tempSettings.theme === "system") {
      mediaQuery.addEventListener("change", systemThemeListener)
    }

    return () => {
      mediaQuery.removeEventListener("change", systemThemeListener)
    }
  }, [tempSettings.theme])

  const handleLanguageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const lang = event.target.value
      setSelectedLanguage(lang)
      setTempSettings((prev) => ({ ...prev, language: lang }))
    },
    []
  )

  const savePreferences = useCallback(() => {
    setSettings(tempSettings)
    showToast("Settings saved successfully!", "success")
  }, [tempSettings, setSettings, showToast])

  const resetChanges = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to the last saved state (or defaults if never saved)? Any unsaved changes will be lost."
      )
    ) {
      const currentSettings = settings || DEFAULT_SETTINGS
      setTempSettings(currentSettings)
      setSelectedLanguage(
        currentSettings.language === "auto"
          ? navigator.language.split("-")[0]
          : currentSettings.language
      )
      showToast("Changes reset", "info")
    }
  }, [settings, showToast])

  const handleExport = useCallback(() => {
    try {
      const settingsToExport = {
        theme: settings?.theme ?? DEFAULT_SETTINGS.theme,
        prefixes: settings?.prefixes ?? DEFAULT_SETTINGS.prefixes,
        ticketTypes: settings?.ticketTypes ?? DEFAULT_SETTINGS.ticketTypes,
        urls: settings?.urls ?? DEFAULT_SETTINGS.urls,
        jiraPatterns: settings?.jiraPatterns ?? DEFAULT_SETTINGS.jiraPatterns,
        integrateQrImage:
          settings?.integrateQrImage ?? DEFAULT_SETTINGS.integrateQrImage,
        useMarkdownCopy:
          settings?.useMarkdownCopy ?? DEFAULT_SETTINGS.useMarkdownCopy,
        exportedAt: new Date().toISOString()
      }

      const jsonString = JSON.stringify(settingsToExport, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "jira-url-wizard-settings.json"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast("Settings exported successfully!", "success")
    } catch (error) {
      console.error("Error exporting settings:", error)
      showToast("Error exporting settings", "error")
    }
  }, [settings, showToast])

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result
          if (typeof text !== "string") {
            throw new Error("Failed to read file content.")
          }
          const importedData = JSON.parse(text)

          if (!importedData || typeof importedData !== "object") {
            throw new Error("Invalid file format.")
          }

          const importedSettings: Partial<SettingsStorage> = {}
          if (["light", "dark", "system"].includes(importedData.theme)) {
            importedSettings.theme = importedData.theme
          } else {
            importedSettings.theme = tempSettings.theme
          }
          if (importedData.issuePrefix)
            importedSettings.prefixes = importedData.issuePrefix
          else if (importedData.prefixes)
            importedSettings.prefixes = importedData.prefixes
          if (importedData.ticketTypes)
            importedSettings.ticketTypes = importedData.ticketTypes
          if (importedData.baseUrls)
            importedSettings.urls = importedData.baseUrls
          else if (importedData.urls) importedSettings.urls = importedData.urls
          if (importedData.jiraPatterns)
            importedSettings.jiraPatterns = importedData.jiraPatterns
          if (typeof importedData.integrateQrImage === "boolean")
            importedSettings.integrateQrImage = importedData.integrateQrImage
          if (typeof importedData.useMarkdownCopy === "boolean")
            importedSettings.useMarkdownCopy = importedData.useMarkdownCopy

          const newSettings: SettingsStorage = {
            ...DEFAULT_SETTINGS,
            ...tempSettings,
            ...importedSettings
          }

          setTempSettings(newSettings)
          const theme = newSettings.theme
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
          document.documentElement.classList.toggle(
            "dark",
            theme === "dark" || (theme === "system" && prefersDark)
          )
          setSelectedLanguage(navigator.language.split("-")[0] || "auto")

          showToast(
            "Settings imported successfully! Review and click Save to apply changes.",
            "info"
          )
        } catch (error) {
          console.error("Error importing settings:", error)
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          showToast(`Error importing settings: ${errorMessage}`, "error")
        } finally {
          event.target.value = ""
        }
      }
      reader.onerror = () => {
        showToast("Error reading file", "error")
        event.target.value = ""
      }
      reader.readAsText(file)
    },
    [tempSettings, showToast]
  )

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
      showToast("Pattern cannot be empty.", "error");
      return;
    }

    try {
      new RegExp(newPattern);
    } catch (e) {
      showToast("Invalid Regex Syntax. Pattern not saved.", "error");
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
    showToast("Pattern updated. Remember to save overall settings.", "info");
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
      showToast("Pattern removed. Remember to save overall settings.", "info")
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
    
    showToast("Pattern " + (enabled ? "enabled" : "disabled") + ". Remember to save overall settings.", "info");
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

  if (!settings || !tempSettings) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading settings...
      </div>
    )
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {toast && (
        <div
          id="options-toast"
          role="alert"
          aria-live="assertive"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center options-toast options-toast--${toast.type} ${toast.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : toast.type === "error" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"}`}>
          <span id="options-toast-message">{toast.message}</span>
        </div>
      )}

      <header className="sticky top-0 z-10 flex-shrink-0 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto p-3 md:p-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2 options-header__title-group">
            <Settings className="w-5 h-5 text-blue-500 options-header__icon" />
            <h1
              id="options-title"
              className="text-xl font-bold options-header__title">
              {"Settings"}
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
              aria-label="Import settings file"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                document.getElementById("options-header-import-input")?.click()
              }
              title="Import Settings">
              <Upload size={16} />
              <span>Import</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              id="options-header-export-button"
              onClick={handleExport}
              title="Export Settings"
              aria-label="Export Settings">
              <Download size={16} />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-10">
          <div className="grid grid-cols-1 gap-10">
            <Section id="general-settings-section">
              <SectionHeading id="general-settings-heading">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                General Settings
              </SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                <InputGroup className="flex flex-col">
                  <Label id="theme-label" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"></circle>
                      <path d="M12 2v2"></path>
                      <path d="M12 20v2"></path>
                      <path d="m4.93 4.93 1.41 1.41"></path>
                      <path d="m17.66 17.66 1.41 1.41"></path>
                      <path d="M2 12h2"></path>
                      <path d="M20 12h2"></path>
                      <path d="m6.34 17.66-1.41 1.41"></path>
                      <path d="m19.07 4.93-1.41 1.41"></path>
                    </svg>
                    Theme
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <circle cx="12" cy="12" r="4"></circle>
                              <path d="M12 2v2"></path>
                              <path d="M12 20v2"></path>
                              <path d="m4.93 4.93 1.41 1.41"></path>
                              <path d="m17.66 17.66 1.41 1.41"></path>
                              <path d="M2 12h2"></path>
                              <path d="M20 12h2"></path>
                              <path d="m6.34 17.66-1.41 1.41"></path>
                              <path d="m19.07 4.93-1.41 1.41"></path>
                            </svg>
                          )}
                          {themeOption === "dark" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                            </svg>
                          )}
                          {themeOption === "system" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                              <line x1="8" x2="16" y1="21" y2="21"></line>
                              <line x1="12" x2="12" y1="17" y2="21"></line>
                            </svg>
                          )}
                          {themeOption}
                        </Button>
                      )
                    )}
                  </div>
                </InputGroup>

                <InputGroup className="flex flex-col">
                  <Label id="language-label" htmlFor="language-select" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 8 6 6"></path>
                      <path d="m4 14 6-6 2-3"></path>
                      <path d="M2 5h12"></path>
                      <path d="M7 2h1"></path>
                      <path d="m22 22-5-10-5 10"></path>
                      <path d="M14 18h6"></path>
                    </svg>
                    Language
                  </Label>
                  <div className="relative">
                    <select
                      id="language-select"
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      disabled
                      className={`w-full p-2 pr-10 rounded-md appearance-none options-section__input bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500 border transition-colors duration-150 focus:outline-none focus:ring-1`}>
                      {Object.entries(AVAILABLE_LANGUAGES).map(
                        ([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        )
                      )}
                    </select>
                    <div
                      className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose your preferred interface language</p>
                </InputGroup>

                <div className="mb-5 options-section__input-group md:col-span-2 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="integrate-logo-qr" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500 dark:text-gray-400">
                          <path d="M9 14.5a4 4 0 1 0 0-9 4 4 0 0 0 0 9Z"></path>
                          <path d="M9 5.5V9"></path>
                          <path d="M6.5 7.5h5"></path>
                          <rect width="13" height="13" x="8" y="8" rx="2"></rect>
                          <path d="m22 14-4-4"></path>
                        </svg>
                        Integrate logo image within generated QR codes
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">Embed your logo in the center of QR codes (if applicable)</p>
                    </div>
                    <Toggle
                      id="integrate-logo-qr"
                      checked={tempSettings.integrateQrImage}
                      onCheckedChange={(checked) => handleSettingChange("integrateQrImage", checked)}
                      aria-label="Integrate logo within QR codes"
                    />
                  </div>
                </div>

                <div className="mb-5 options-section__input-group md:col-span-2 pt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="use-markdown-copy" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500 dark:text-gray-400">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                          <path d="M8 11h8"></path>
                          <path d="M8 15h5"></path>
                        </svg>
                        Use Markdown formatting when copying generated content
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">Copy content as Markdown format instead of plain text (if applicable)</p>
                    </div>
                    <Toggle
                      id="use-markdown-copy"
                      checked={tempSettings.useMarkdownCopy}
                      onCheckedChange={(checked) => handleSettingChange("useMarkdownCopy", checked)}
                      aria-label="Use Markdown when copying"
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section id="prefixes-section">
              <SectionHeading
                id="prefixes-heading"
                infoText="Define project prefixes (e.g., PROJ) and optional ticket types (e.g., BUG). Press Enter to add.">
                Prefixes & Ticket Types
              </SectionHeading>
              <CustomTagInput
                id="prefix-new-input"
                label="Issue Prefixes"
                tags={tempSettings.prefixes}
                onAddTag={addPrefix}
                onRemoveTag={removePrefix}
                placeholder="Add prefix + Enter"
              />
              <CustomTagInput
                id="ticket-type-new-input"
                label="Ticket Types (Optional)"
                tags={tempSettings.ticketTypes}
                onAddTag={addTicketType}
                onRemoveTag={removeTicketType}
                placeholder="Add ticket type + Enter"
              />
            </Section>

            <Section id="base-urls-section">
              <SectionHeading
                id="base-urls-heading"
                infoText="Enter base URLs for different environments. All URLs use HTTPS protocol.">
                Base URLs
              </SectionHeading>
              
              <div className="space-y-4">
                {Object.entries(tempSettings.urls).map(([key, value]) => (
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
                        <DebouncedTextInput
                          id={`base-url-input-${key}`}
                          initialValue={value}
                          onSave={(newValue) => handleUrlChange(key, newValue)}
                          placeholder="my-env.example.com"
                          className="flex-1 min-w-0 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500"
                          aria-describedby={`url-description-${key}`}
                          onPaste={handlePaste}
                        />
          
                      </div>
                      
                      <p id={`url-description-${key}`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getUrlDescription(key)}
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
            >
                <summary className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer flex items-center justify-between">
                    <span className="font-medium text-lg text-gray-900 dark:text-gray-100">Advanced Settings</span>
                    {advancedSettingsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </summary>
                <div className="p-4 space-y-6">

                <section id="jira-patterns-section" className="mb-10">
                        <div
                            id="jira-patterns-header"
                            className="flex flex-wrap justify-between items-center gap-3 mb-5 options-section__header">
                            <h3
                                id="jira-patterns-heading"
                                className="text-lg font-medium options-section__heading flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span>JIRA URL Patterns</span>
                                <InfoPopup
                                    text="Define URL patterns (regex) to help identify JIRA tabs. Used for features like extracting ticket IDs."
                                    darkMode={document.documentElement.classList.contains('dark')}
                                />
                            </h3>
                            {editingPatternIndex === null && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    id="jira-patterns-add-new-button"
                                    onClick={() => handleEditPattern(null)}>
                                    Add New Pattern
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
                                Add New Pattern
                              </h4>
                              {/* Added visual indicator for form state */}
                              {!isCurrentPatternValid && (
                                <span className="text-xs text-red-500 dark:text-red-400 animate-pulse">
                                  Invalid pattern
                                </span>
                              )}
                              {isCurrentPatternValid && isPreviewMatch && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  Pattern matches preview
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
                              Button={Button}
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
                                                Edit Pattern
                                              </h4>
                                              {/* Added visual indicators for form state */}
                                              {!isCurrentPatternValid && (
                                                <span className="text-xs text-red-500 dark:text-red-400 animate-pulse">
                                                  Invalid pattern
                                                </span>
                                              )}
                                              {isCurrentPatternValid && isPreviewMatch && (
                                                <span className="text-xs text-green-600 dark:text-green-400">
                                                  Pattern matches preview
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
                                              Button={Button}
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
                                                        title="Edit Pattern"
                                                        aria-label="Edit Pattern">
                                                        <Pencil size={16} />
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
                                                        <X size={16} />
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
                                    No JIRA patterns defined. Click 'Add New Pattern' to
                                    start.
                                </p>
                            )}
                        </div>
                    </section>
                    <section id="url-structure" className="mb-10">
                        <div id="url-structure-header" className="flex flex-wrap justify-between items-center gap-3 mb-5 options-section__header border-t border-gray-100 dark:border-gray-700 pt-3">
                        <h3 id="jira-patterns-heading" className="text-lg font-medium options-section__heading flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <span>URL Builder</span>
                                <InfoPopup
                                    text="Build your custom JIRA URL structure by dragging and dropping components. The pattern defines how your JIRA ticket IDs are converted to URLs."
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

      <footer className="sticky bottom-0 z-10 flex-shrink-0 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto p-3 md:p-4 flex justify-end space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetChanges}
            disabled={!isDirty}>
            Reset Changes
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={savePreferences}
            disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default IndexOptions