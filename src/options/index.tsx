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
}> = ({ id, htmlFor, children }) => (
  <label
    id={id}
    htmlFor={htmlFor}
    className={`block text-sm font-medium mb-1.5 options-section__label text-gray-600 dark:text-gray-300`}>
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

const ToggleSwitch: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, id, ...props }) => (
  <div className="flex items-center justify-between w-full">
    <label
      htmlFor={id}
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300`}>
      {label}
    </label>
    <div className="relative inline-flex items-center">
      <button
        id={id}
        role="switch"
        type="button"
        tabIndex={0}
        aria-checked={props.checked}
        onClick={(e) => {
          e.preventDefault();
          props.onChange?.({
            target: { checked: !props.checked }
          } as React.ChangeEvent<HTMLInputElement>);
        }}
        className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          props.checked 
            ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600' 
            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        <span className="sr-only">Use setting</span>
        <span className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
          props.checked 
            ? 'translate-x-5 bg-white shadow-md' 
            : 'bg-gray-400 dark:bg-gray-500'
        }`}>
          {props.checked ? (
            <svg fill="currentColor" viewBox="0 0 12 12" className="w-3 h-3 m-0.5">
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          ) : (
            <svg fill="none" viewBox="0 0 12 12" className="w-3 h-3 m-0.5">
              <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </button>
    </div>
  </div>
)

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
  const [editingPatternData, setEditingPatternData] = useState<{
    pattern: string
  } | null>(null)
  const [isCurrentPatternValid, setIsCurrentPatternValid] = useState(true)
  const [isPreviewMatch, setIsPreviewMatch] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)

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
    setTempSettings((prev) => ({
      ...prev,
      urls: { ...prev.urls, [key]: value }
    }))
  }, [])

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
      setEditingPatternData({ pattern: "" })
    } else {
      setEditingPatternIndex(index)
      setEditingPatternData({
        pattern: tempSettings.jiraPatterns[index]?.pattern || ""
      })
    }
  }

  const handleCancelEditPattern = () => {
    setEditingPatternIndex(null)
    setEditingPatternData(null)
    setIsCurrentPatternValid(true)
    setIsPreviewMatch(false)
  }

  const handleSavePattern = () => {
    if (editingPatternIndex === null || !editingPatternData) return

    const newPattern = editingPatternData.pattern.trim()

    if (!newPattern) {
      showToast("Pattern cannot be empty.", "error")
      return
    }

    try {
      new RegExp(newPattern)
    } catch (e) {
      showToast("Invalid Regex Syntax. Pattern not saved.", "error")
      return
    }

    setTempSettings((prev) => {
      const updatedPatterns = [...(prev.jiraPatterns || [])]
      const newPatternData = { pattern: newPattern }

      if (editingPatternIndex === -1) {
        updatedPatterns.push(newPatternData)
      } else {
        updatedPatterns[editingPatternIndex] = newPatternData
      }
      return { ...prev, jiraPatterns: updatedPatterns }
    })

    handleCancelEditPattern()
    showToast("Pattern updated. Remember to save overall settings.", "info")
  }

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

  console.log(
    "Current Pattern:",
    editingPatternData?.pattern,
    "Is Button Disabled:",
    !editingPatternData?.pattern.trim()
  )

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
                General Settings
              </SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                <InputGroup className="flex flex-col">
                  <Label id="theme-label">Theme</Label>
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
                          {themeOption}
                        </Button>
                      )
                    )}
                  </div>
                </InputGroup>

                <InputGroup className="flex flex-col">
                  <Label id="language-label" htmlFor="language-select">
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
                      <Languages size={16} />
                    </div>
                  </div>
                </InputGroup>

                <InputGroup className="md:col-span-2 pt-2">
                  <ToggleSwitch
                    id="integrate-qr-image"
                    label="Integrate logo image within generated QR codes (if applicable)"
                    checked={tempSettings.integrateQrImage}
                    onChange={(e) =>
                      handleSettingChange("integrateQrImage", e.target.checked)
                    }
                  />
                </InputGroup>
                <InputGroup className="md:col-span-2 pt-2">
                  <ToggleSwitch
                    id="use-markdown-copy"
                    label="Use Markdown formatting when copying generated content (if applicable)"
                    checked={tempSettings.useMarkdownCopy}
                    onChange={(e) =>
                      handleSettingChange("useMarkdownCopy", e.target.checked)
                    }
                  />
                </InputGroup>
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
                infoText="Enter base URLs for different environments (e.g., dev.jira.com). The key (e.g., 'dev') is used as a label.">
                Base URLs
              </SectionHeading>
              <div className="space-y-5 options-section__group-container">
                {Object.entries(tempSettings.urls).map(([key, value]) => (
                  <InputGroup key={key} className="mb-0">
                    <Label
                      id={`base-url-label-${key}`}
                      htmlFor={`base-url-input-${key}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Label>
                    <DebouncedTextInput
                      id={`base-url-input-${key}`}
                      initialValue={value}
                      onSave={(newValue) => handleUrlChange(key, newValue)}
                      placeholder="e.g., my-env.example.com"
                    />
                  </InputGroup>
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
                                className={`p-4 rounded-md border mb-6 options-form options-form--add bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600`}>
                                <h4
                                    id="jira-patterns-add-form-heading"
                                    className="text-md font-semibold mb-4 options-form__heading">
                                    Add New Pattern
                                </h4>
                                <div className="space-y-4 options-form__body">
                                    <InputGroup className="mb-0">
                                        <Label
                                            id="jira-patterns-add-form-pattern-label"
                                            htmlFor="jira-patterns-add-form-pattern-input">
                                            Pattern (Regex)
                                        </Label>
                                        <DebouncedTextInput
                                            id="jira-patterns-add-form-pattern-input"
                                            initialValue={editingPatternData?.pattern || ""}
                                            onSave={(newValue) => 
                                               setEditingPatternData((prev) => ({ 
                                                 ...(prev || { pattern: "" }), 
                                                 pattern: newValue 
                                               }))
                                            }
                                            className={`font-mono text-sm ${!isCurrentPatternValid ? "border-red-500 dark:border-red-400 ring-1 ring-red-500" : ""}`}
                                            placeholder="^https://jira\.example\.com/browse/PROJ-\d+"
                                            autoFocus
                                        />
                                    </InputGroup>
                                    <div
                                        id="jira-patterns-add-form-validation"
                                        className="mt-1 text-xs options-form__validation">
                                        {!isCurrentPatternValid ? (
                                            <p
                                                id="jira-patterns-add-form-validation-error"
                                                className="text-red-500 dark:text-red-400 options-form__validation-error">
                                                Invalid Regex Syntax
                                            </p>
                                        ) : editingPatternData?.pattern ? (
                                            <p
                                                id="jira-patterns-add-form-validation-match"
                                                className={`${isPreviewMatch ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} options-form__validation-match`}>
                                                {isPreviewMatch ? "Matches" : "Does not match"}{" "}
                                                generated sample URL based on current settings.
                                            </p>
                                        ) : (
                                            <p
                                                id="jira-patterns-add-form-validation-prompt"
                                                className="text-gray-500 dark:text-gray-400 options-form__validation-prompt">
                                                Enter a pattern to see preview.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div
                                    id="jira-patterns-add-form-actions"
                                    className="flex justify-end space-x-2 mt-5 options-form__actions">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        id="jira-patterns-add-form-cancel-button"
                                        onClick={handleCancelEditPattern}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        id="jira-patterns-add-form-save-button"
                                        onClick={handleSavePattern}>
                                        Save Pattern
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 text-sm">
                            {tempSettings.jiraPatterns?.length > 0 ? (
                                tempSettings.jiraPatterns.map((jp, index) => (
                                    <div
                                        key={`pattern-item-${index}`}
                                        className={`rounded-lg border transition-all duration-200 ${editingPatternIndex === index ? "bg-blue-50 border-blue-400 shadow-inner dark:bg-gray-700 dark:border-blue-500" : "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700"}`}>
                                        {editingPatternIndex === index ? (
                                            <div
                                                id={`pattern-edit-form-${index}`}
                                                className="p-4 space-y-4 options-form options-form--edit">
                                                <InputGroup className="mb-0">
                                                    <Label
                                                        id={`pattern-edit-form-pattern-label-${index}`}
                                                        htmlFor={`pattern-edit-form-pattern-input-${index}`}>
                                                        Edit Pattern (Regex)
                                                    </Label>
                                                    <DebouncedTextInput
                                                        id={`pattern-edit-form-pattern-input-${index}`}
                                                        initialValue={editingPatternData?.pattern || ""}
                                                        onSave={(newValue) => 
                                                           setEditingPatternData((prev) => ({ 
                                                             ...(prev || { pattern: "" }), 
                                                             pattern: newValue 
                                                           }))
                                                        }
                                                        className={`font-mono text-sm ${!isCurrentPatternValid ? "border-red-500 dark:border-red-400 ring-1 ring-red-500" : ""}`}
                                                        placeholder="^https://jira\.example\.com/browse/PROJ-\d+"
                                                        autoFocus
                                                    />
                                                </InputGroup>
                                                <div
                                                    id={`pattern-edit-form-validation-${index}`}
                                                    className="mt-1 text-xs options-form__validation">
                                                    {!isCurrentPatternValid ? (
                                                        <p
                                                            id={`pattern-edit-form-validation-error-${index}`}
                                                            className="text-red-500 dark:text-red-400 options-form__validation-error">
                                                            Invalid Regex Syntax
                                                        </p>
                                                    ) : editingPatternData?.pattern ? (
                                                        <p
                                                            id={`pattern-edit-form-validation-match-${index}`}
                                                            className={`${isPreviewMatch ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"} options-form__validation-match`}>
                                                            {isPreviewMatch
                                                                ? "Matches"
                                                                : "Does not match"}{" "}
                                                            generated sample URL based on current
                                                            settings.
                                                        </p>
                                                    ) : (
                                                        <p
                                                            id={`pattern-edit-form-validation-prompt-${index}`}
                                                            className="text-gray-500 dark:text-gray-400 options-form__validation-prompt">
                                                            Enter a pattern to see preview.
                                                        </p>
                                                    )}
                                                </div>
                                                <div
                                                    id={`pattern-edit-form-actions-${index}`}
                                                    className="flex justify-end space-x-2 mt-4 options-form__actions">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        id={`pattern-edit-form-cancel-button-${index}`}
                                                        onClick={handleCancelEditPattern}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        id={`pattern-edit-form-save-button-${index}`}
                                                        onClick={handleSavePattern}>
                                                        Save Pattern
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                id={`pattern-readonly-view-${index}`}
                                                className="flex justify-between items-center gap-4 p-3">
                                                <div
                                                    id={`pattern-readonly-view-text-container-${index}`}
                                                    className="flex-1 min-w-0">
                                                    <p
                                                        id={`pattern-readonly-view-text-${index}`}
                                                        className={`font-mono text-sm break-all text-gray-700 dark:text-gray-300`}>
                                                        {jp.pattern}
                                                    </p>
                                                </div>
                                                <div
                                                    id={`pattern-readonly-view-actions-${index}`}
                                                    className="flex gap-1 flex-shrink-0">
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
                                                        className={`focus:ring-red-500 hover:bg-red-100 hover:text-red-600 focus:ring-offset-gray-50 dark:hover:bg-red-800/30 dark:hover:text-red-400 dark:focus:ring-offset-gray-700`}>
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
                        <div id="url-structure-header" className="flex flex-wrap justify-between items-center gap-3 mb-5 options-section__header">
                            <h3 id="url-structure-heading" className="text-lg font-medium options-section__heading flex items-center gap-2 text-gray-700 dark:text-gray-300">
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