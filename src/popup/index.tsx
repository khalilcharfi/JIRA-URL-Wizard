import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n'; // ensure i18n is initialized
import '../style.css';
import { QRCode } from 'react-qrcode-logo';
import imageAssets, {
  CheckIcon, RefreshIcon, MarkdownCopyIcon, CopyIcon, ClockIcon, SettingsIcon,
  SmartphoneIcon, MonitorIcon, BuildingIcon, LayoutIcon, QRCodeIcon, AlertIcon,
  SunIcon, LanguageIcon,
} from '../assets/imageAssets';
import type { IconName } from '../assets/imageAssets';
import { DEFAULT_SETTINGS, DEFAULT_SAMPLE_TICKET_ID } from '../shared/settings';
import type { SettingsStorage, JiraPattern } from '../shared/settings';
import { getSettings, addSettingsListener, removeSettingsListener } from '../services/storageService';
import { generateMarkdownLinks, generatePlainTextLinks } from '../services/templateService';
import { buildUrlFromPattern } from '../utils/urlBuilder';
import SettingsOverlay from '../components/SettingsOverlay';

interface Environment {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  url: string;
}

// Map base colors to their darker shade for active state
const darkerColorMap: Record<string, string> = {
  'bg-blue-500': 'bg-blue-600',
  'bg-teal-500': 'bg-teal-600',
  'bg-green-500': 'bg-green-600',
  'bg-purple-500': 'bg-purple-600',
  'bg-orange-500': 'bg-orange-600',
  'bg-red-500': 'bg-red-600',
};

// Simple Toast Component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000); // Auto-close after 2 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg z-50 dark:bg-gray-100 dark:text-gray-900"
      role="alert"
    >
      {message}
    </div>
  );
};

const MemoizedToast = React.memo(Toast);

// --- DynamicIcon Helper ---
const DynamicIcon: React.FC<{ iconName: IconName; className?: string; size?: number; strokeWidth?: number }> = ({ iconName, ...props }) => {
  const commonProps = { size: 16, strokeWidth: 2, ...props }; // Default props + overrides
  switch (iconName) {
    case 'smartphone': return <SmartphoneIcon {...commonProps} />;
    case 'monitor': return <MonitorIcon {...commonProps} />;
    case 'building': return <BuildingIcon {...commonProps} />;
    case 'layout': return <LayoutIcon {...commonProps} />;
    case 'qr-code': return <QRCodeIcon {...commonProps} />;
    case 'copy': return <CopyIcon {...commonProps} />;
    case 'markdownCopy': return <MarkdownCopyIcon {...commonProps} />;
    case 'settings': return <SettingsIcon {...commonProps} />;
    case 'clock': return <ClockIcon {...commonProps} />;
    case 'check': return <CheckIcon {...commonProps} />;
    case 'refresh': return <RefreshIcon {...commonProps} />;
    case 'alert': return <AlertIcon {...commonProps} />;
    case 'sun': return <SunIcon {...commonProps} />;
    case 'language': return <LanguageIcon {...commonProps} />;
    default: {
        // Ensure exhaustive check - if IconName type changes, this will cause a compile error
        const exhaustiveCheck: never = iconName; 
        console.warn(`Unknown icon name: ${exhaustiveCheck}`);
        return null; // Or return a default fallback icon
    }
  }
};

// --- PopupHeader ---
interface PopupHeaderProps {
  ticketId: string;
  recentTickets: string[];
  showRecentTickets: boolean;
  onCopyEnvironmentLinks: () => void;
  onToggleRecentTickets: () => void;
  onSelectRecentTicket: (ticket: string) => void;
  onRefreshFromCurrentTab: () => void;
  onTicketIdChange: (id: string) => void;
  settings: SettingsStorage;
}
const PopupHeader: React.FC<PopupHeaderProps> = ({
  ticketId, recentTickets, showRecentTickets, onCopyEnvironmentLinks, 
  onToggleRecentTickets, onSelectRecentTicket, onRefreshFromCurrentTab,
  onTicketIdChange, settings
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(ticketId);
  
  useEffect(() => {
    setInputValue(ticketId);
  }, [ticketId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onTicketIdChange(inputValue.trim());
    }
  };
  
  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700 relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          id="ticket-id"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t('jira.enterTicketId')}
          className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-base font-semibold bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          disabled={!settings.allowManualTicketInput}
          title={!settings.allowManualTicketInput ? t('jira.manualInputDisabled') : t('jira.enterTicketId')}
        />
        {settings.allowManualTicketInput && (
          <button
            type="submit"
            className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={t('jira.applyTicketId')}
            aria-label={t('jira.applyTicketId')}
          >
            <CheckIcon size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={onRefreshFromCurrentTab}
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={t('jira.refreshFromCurrentTab')}
          aria-label={t('jira.refreshFromCurrentTab')}
        >
          <RefreshIcon size={18} />
        </button>
        <button
          type="button"
          onClick={onCopyEnvironmentLinks}
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={t('jira.copyEnvironmentLinks')}
          aria-label={t('jira.copyEnvironmentLinks')}
        >
          {settings.useMarkdownCopy ? <MarkdownCopyIcon size={18} /> : <CopyIcon size={18} />}
        </button>
        <button
          type="button"
          onClick={onToggleRecentTickets}
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={t('messages.recentTickets')}
          aria-label={t('messages.showRecentTickets')}
        >
          <ClockIcon size={18} />
        </button>
      </form>
      {showRecentTickets && (
        <div className="absolute top-full right-3 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <li key={ticket}>
                  <button
                    onClick={() => onSelectRecentTicket(ticket)}
                    className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {ticket}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">{t('messages.noRecentTickets')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
const MemoizedPopupHeader = React.memo(PopupHeader);

// --- EnvironmentTabs ---
interface EnvironmentTabsProps {
  environments: Environment[];
  activeEnv: string;
  onSelectEnv: (envId: string) => void;
}
const EnvironmentTabs: React.FC<EnvironmentTabsProps> = ({ environments, activeEnv, onSelectEnv }) => {
  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-center gap-2">
        {environments.map((env) => {
          const envId = env.id;
          const customIconPath =
          envId === 'drupal7' ? imageAssets.drupal7 :
          envId === 'drupal9' ? imageAssets.drupal9 :
            null;

          const activeColor = darkerColorMap[env.color] ?? env.color; // Get darker color or fallback

          return (
            <button
              key={env.id}
              className={`flex flex-col items-center justify-center w-[75px] h-[56px] rounded-md transition-colors border
                ${
                  activeEnv === env.id
                    ? `${activeColor} text-white border-transparent shadow-md` // Use activeColor here
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              onClick={() => onSelectEnv(env.id)}
              title={env.name}
              aria-pressed={activeEnv === env.id}
            >
              {customIconPath ? (
                <img src={customIconPath} alt={env.name} className="w-6 h-6 mb-0.5" />
              ) : (
                <span className="w-6 h-6 mb-0.5 flex items-center justify-center">
                  <DynamicIcon iconName={env.icon} />
                </span>
              )}
              <span className="text-xs leading-tight">{env.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
const MemoizedEnvironmentTabs = React.memo(EnvironmentTabs);

// --- UrlOutput ---
interface UrlOutputProps {
  url: string;
  onCopyUrl: () => void;
  settings: SettingsStorage;
}
const UrlOutput: React.FC<UrlOutputProps> = ({ url, onCopyUrl, settings }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 h-[36px] bg-gray-50 dark:bg-gray-800 rounded-md px-3 pr-0 w-full max-w-[420px]" id="url-output-mobile">
      <a
        href={url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-grow text-blue-600 dark:text-blue-400 hover:underline truncate text-sm"
        title={url || t('messages.noUrlGenerated')}
      >
        {url || t('messages.noUrlGenerated')}
      </a>
      <button
        onClick={onCopyUrl}
        className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        title={t('common.copyUrl')}
        aria-label={t('common.copyGeneratedUrl')}
        disabled={!url}
      >
        <CopyIcon size={18} />
      </button>
    </div>
  );
};
const MemoizedUrlOutput = React.memo(UrlOutput);

// Define a simple Error Boundary component
class QrCodeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error rendering QR Code:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <p className="text-red-500 text-center p-4">Could not display QR code.</p>;
    }

    return this.props.children;
  }
}

// --- QrCodeSection ---
interface QrCodeSectionProps {
  ticketId: string; // Needed for generating URLs within QR section
  environments: Environment[]; // Needed for URLs and names
  qrCodeEnvId: string;
  qrCodeUrl: string;
  onSelectQrEnv: (envId: string) => void;
  onCopyQrCode: (event: React.MouseEvent<HTMLDivElement>) => void;
  isAnimating: boolean;
  integrateQrImage: boolean;
  hasEnvironments?: boolean; // New prop to check if environments are configured
}
const QrCodeSection: React.FC<QrCodeSectionProps> = ({
  ticketId, environments, qrCodeEnvId, qrCodeUrl, onSelectQrEnv, onCopyQrCode, isAnimating,
  integrateQrImage, hasEnvironments = true
}) => {
  const { t } = useTranslation();
  // Determine the logo source based on the selected QR environment ID
  const logoSrc = useMemo((): string | undefined => {
    switch (qrCodeEnvId) {
      case 'mobile': return imageAssets.app;
      case 'drupal7': return imageAssets.drupal7;
      case 'drupal9': return imageAssets.drupal9;
      default: return undefined;
    }
  }, [qrCodeEnvId]);

  // Determine if logo should be shown based on setting AND if a logo exists for the env
  const showLogo = integrateQrImage && !!logoSrc;
  
  // If the settings overlay is visible (no environments configured), don't render the QR section
  if (!hasEnvironments) return null;

  return (
    <div className="w-full">
      <div className="qr-section-container">
        <div className="qr-section-qrcode-container flex flex-col items-center">
          {/* Inner Tabs */}
          <div className="qr-section-inner-tabs mb-4">
            <div className="flex justify-center gap-2">
              {['mobile', 'drupal7', 'drupal9'].map((envId) => {
                const envConfig = environments.find(e => e.id === envId);
                if (!envConfig) return null; // Skip if env not found

                // Determine the icon source based on the environment ID
                const iconSrc =
                  envId === 'mobile' ? imageAssets.app :
                  envId === 'drupal7' ? imageAssets.drupal7 :
                  envId === 'drupal9' ? imageAssets.drupal9 :
                  null; // Fallback icon logic if needed

                if (!iconSrc) return null; // Skip if no icon source

                return (
                  <button
                    key={envId}
                    className={`flex flex-col items-center justify-center w-[75px] h-[56px] rounded-md transition-all duration-200 p-1.5 border
                      ${
                        qrCodeEnvId === envId
                        ? 'bg-gray-300 dark:bg-gray-500 text-gray-800 dark:text-gray-100 border-gray-400 dark:border-gray-400 shadow-sm'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    onClick={() => onSelectQrEnv(envId)}
                  >
                    <img src={iconSrc} alt={envConfig.name} className="w-6 h-6 mb-0.5" />
                    <span className="text-xs leading-tight">{envConfig.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* QR Code Display */}
          <div
            className={`qr-code-wrapper bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-transform duration-200 ease-in-out ${isAnimating ? 'scale-105' : 'scale-100'}`}
          >
            <div className="qr-code-container cursor-pointer" onClick={onCopyQrCode} title="Click to copy QR Code image">
              {qrCodeUrl ? (
                <QRCode
                  value={qrCodeUrl}
                  size={200}
                  ecLevel="H"
                  quietZone={10}
                  logoImage={showLogo ? logoSrc : undefined}
                  logoWidth={showLogo ? 40 : undefined}
                  logoHeight={showLogo ? 40 : undefined}
                  logoPadding={showLogo ? 5 : undefined}
                  logoPaddingStyle={showLogo ? "circle" : "square"}
                />
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 h-[200px] flex items-center justify-center">
                  {t('qrCode.selectEnvironmentForQr')}
                </p>
              )}
              <div className="qr-code-caption text-center mt-2">
                <div className="qr-code-caption-text text-xs text-gray-500 dark:text-gray-400">
                  {t('qrCode.clickToCopy')}
                </div>
              </div>
            </div>
          </div>
          <div className="qr-section-caption text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('qrCode.scanToAccess')}
          </div>
        </div>
      </div>
    </div>
  );
};
const MemoizedQrCodeSection = React.memo(QrCodeSection);

// --- OutputArea ---
interface OutputAreaProps extends Omit<QrCodeSectionProps, 'hasEnvironments'> {
  activeEnv: string;
  currentFullUrl: string;
  currentEnv?: Environment;
  ticketId: string;
  onCopyUrl: () => void;
  integrateQrImage: boolean;
  settings: SettingsStorage;
  hasEnvironments?: boolean;
}
const OutputArea: React.FC<OutputAreaProps> = ({
  activeEnv, currentFullUrl, currentEnv, ticketId, onCopyUrl,
  environments, qrCodeEnvId, qrCodeUrl, onSelectQrEnv, onCopyQrCode, isAnimating,
  integrateQrImage, settings, hasEnvironments
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="p-3 space-y-2 min-h-[80px] flex items-center justify-center">
      {activeEnv === 'qrcode' ? (
        <QrCodeErrorBoundary>
          <MemoizedQrCodeSection
            ticketId={ticketId}
            environments={environments}
            qrCodeEnvId={qrCodeEnvId}
            qrCodeUrl={qrCodeUrl}
            onSelectQrEnv={onSelectQrEnv}
            onCopyQrCode={onCopyQrCode}
            isAnimating={isAnimating}
            integrateQrImage={integrateQrImage}
            hasEnvironments={hasEnvironments}
          />
        </QrCodeErrorBoundary>
      ) : currentEnv && ticketId ? (
        <MemoizedUrlOutput url={currentFullUrl} onCopyUrl={onCopyUrl} settings={settings} />
      ) : !currentEnv && activeEnv !== 'qrcode' ? (
         <p className="text-gray-500 dark:text-gray-400 text-center text-xs pt-4">{t('messages.selectEnvironment')}</p>
      ) : !ticketId && activeEnv !== 'qrcode' ? (
         <p className="text-gray-500 dark:text-gray-400 text-center text-xs pt-4">{t('messages.enterTicketId')}</p>
      ) : null}
    </div>
  );
};
const MemoizedOutputArea = React.memo(OutputArea);

// --- PopupFooter ---
interface PopupFooterProps {
  onOpenOptions: () => void;
}
const PopupFooter: React.FC<PopupFooterProps> = ({ onOpenOptions }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <span className="text-[10px] text-gray-500 dark:text-gray-400">{t('credits.developedBy')}</span>
      <button
        className="flex items-center justify-center w-[24px] h-[24px] rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={onOpenOptions}
        title={t('navigation.openSettings')}
        aria-label={t('navigation.openSettings')}
      >
        <SettingsIcon size={16} />
      </button>
    </div>
  );
};
const MemoizedPopupFooter = React.memo(PopupFooter);

const JiraUrlWizard = () => {
  const { t } = useTranslation();
  // --- State ---
  const [settings, setSettings] = useState<SettingsStorage>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketId, setTicketId] = useState<string>(DEFAULT_SAMPLE_TICKET_ID);
  const [activeEnv, setActiveEnv] = useState('');
  const [recentTickets, setRecentTickets] = useState<string[]>([]);
  const [showRecentTickets, setShowRecentTickets] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrCodeEnvId, setQrCodeEnvId] = useState('mobile');
  const [isQrCodeAnimating, setIsQrCodeAnimating] = useState(false);

  // --- Helper Functions ---
  const getCurrentTabUrl = useCallback(async (): Promise<string | null> => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCurrentTabUrl' });
      return response?.url || null;
    } catch (error) {
      console.error('Error getting current tab URL:', error);
      return null;
    }
  }, []);

  const detectTicketFromCurrentTab = useCallback(async (): Promise<{ ticketId: string | null; error?: string }> => {
    try {
      const currentUrl = await getCurrentTabUrl();
      if (!currentUrl) {
        return { ticketId: null, error: 'No URL available in current tab' };
      }

      const response = await chrome.runtime.sendMessage({ 
        action: 'detectTicketFromUrl', 
        url: currentUrl 
      });
      
      return { 
        ticketId: response.ticketId, 
        error: response.error 
      };
    } catch (error) {
      console.error('Error detecting ticket from current tab:', error);
      return { ticketId: null, error: 'Error detecting ticket' };
    }
  }, [getCurrentTabUrl]);

  const extractTicketFromUrl = useCallback((url: string, patterns: JiraPattern[], prefixes: string[]): string | null => {
    if (!url) return null;
    
    // First try to match using the patterns
    if (patterns && patterns.length > 0) {
      for (const pattern of patterns) {
        try {
          if (!pattern.pattern) continue;
          const regex = new RegExp(pattern.pattern, 'i');
          const match = url.match(regex);
          
          if (match && match[1]) {
            return match[1].toUpperCase();
          }
        } catch (e) {
          console.error('Invalid regex pattern:', e);
        }
      }
    }
    
    // Then try to match using just prefixes
    if (prefixes && prefixes.length > 0) {
      const prefixPattern = `(?:${prefixes.join('|')})-\\d+`;
      try {
        const regex = new RegExp(prefixPattern, 'i');
        const match = url.match(regex);
        
        if (match && match[0]) {
          return match[0].toUpperCase();
        }
      } catch (e) {
        console.error('Error with prefix pattern:', e);
      }
    }
    
    return null;
  }, []);

  const addToRecentTickets = useCallback(async (ticket: string) => {
    if (!ticket || ticket.trim() === '' || ticket === DEFAULT_SAMPLE_TICKET_ID) return;
    try {
      setRecentTickets(prevTickets => {
        const updatedTickets = [ticket, ...prevTickets.filter(t => t !== ticket)].slice(0, 5);
        chrome.storage.sync.set({ recentTickets: updatedTickets }).catch(error => {
          console.error('Error saving recent ticket:', error);
        });
        return updatedTickets;
      });
    } catch (error) {
      console.error('Error initiating recent ticket update:', error);
    }
  }, []);

  const refreshTicketIdFromCurrentTab = useCallback(async () => {
    try {
      setToastMessage("Refreshing from current tab...");
      
      // Get current URL directly
      const currentUrl = await getCurrentTabUrl();
      
      if (!currentUrl) {
        setToastMessage("No URL available in current tab");
        return;
      }
      
      // Extract ticket ID using our optimized function
      const extractedTicketId = extractTicketFromUrl(
        currentUrl,
        settings.jiraPatterns || [],
        settings.prefixes || []
      );

      if (extractedTicketId) {
        setTicketId(extractedTicketId);
        addToRecentTickets(extractedTicketId);
        setToastMessage("Updated from current tab");

        // Update local storage
        chrome.storage.local.set({
          lastTicketId: extractedTicketId,
          lastTicketDetectedAt: Date.now()
        });
      } else {
        setToastMessage("No ticket ID found in current tab");
      }
    } catch (error) {
      console.error("Error refreshing ticket ID:", error);
      setToastMessage("Error refreshing ticket ID");
    }
  }, [settings.jiraPatterns, settings.prefixes, addToRecentTickets, extractTicketFromUrl]);

  // --- Effects ---
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadInitialData = async () => {
      try {
        // 1. Load settings first - we need these for URL detection
        const loadedSettings = await getSettings();
        if (!isMounted) return;
        
        // Ensure the settings match the expected type
        const validatedSettings: SettingsStorage = {
          ...DEFAULT_SETTINGS,
          ...loadedSettings,
          urls: {
            ...DEFAULT_SETTINGS.urls,
            ...loadedSettings.urls
          }
        };
        
        setSettings(validatedSettings);
        
        // 2. Get stored recent tickets and last detected ticket info
        const [storedTicketsData, lastTicketData] = await Promise.all([
          chrome.storage.sync.get('recentTickets'),
          chrome.storage.local.get(['lastTicketId', 'lastTicketDetectedAt'])
        ]);
        
        const loadedRecentTickets = storedTicketsData.recentTickets || [];
        const lastTicketId = lastTicketData.lastTicketId;
        const lastDetectionTime = lastTicketData.lastTicketDetectedAt || 0;
        
        if (!isMounted) return;
        setRecentTickets(loadedRecentTickets);
        
        // 3. Initialize ticket ID display with cached value
        if (lastTicketId) {
          setTicketId(lastTicketId);
          console.log(`Popup: Loaded cached ticket ID: ${lastTicketId}`);
        } else {
          setTicketId(DEFAULT_SAMPLE_TICKET_ID);
        }
        
        // Always show the UI immediately after initial data is loaded
        setIsLoading(false);
        
        // 4. Determine if we should detect from current tab
        const currentTime = Date.now();
        const cacheExpired = currentTime - lastDetectionTime > 5000; // 5 second cache
        const shouldDetectFromTab = !lastTicketId || cacheExpired;
        
        if (shouldDetectFromTab) {
          // Get current tab URL first to avoid race conditions
          const currentUrl = await getCurrentTabUrl();
          
          if (!currentUrl) {
            console.log('No valid URL in current tab');
            return;
          }
          
          // Extract ticket ID from URL using optimized function
          const extractedTicketId = extractTicketFromUrl(
            currentUrl, 
            validatedSettings.jiraPatterns || [],
            validatedSettings.prefixes || []
          );
          
          if (extractedTicketId && isMounted) {
            console.log(`Popup: Detected ticket ID from current tab: ${extractedTicketId}`);
            
            // Only update if different from what we already have
            if (extractedTicketId !== lastTicketId) {
              setTicketId(extractedTicketId);
              addToRecentTickets(extractedTicketId);
              
              // Update cache with new detection
              chrome.storage.local.set({ 
                lastTicketId: extractedTicketId,
                lastTicketDetectedAt: currentTime 
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading popup initial data:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    // Listen for messages from the background script
    const handleBackgroundMessages = (message: any) => {
      if (message.action === 'ticketDetected' && message.ticketId) {
        console.log(`Popup received ticketDetected message: ${message.ticketId}`);
        setTicketId(message.ticketId);
        addToRecentTickets(message.ticketId);
      }
    };

    chrome.runtime.onMessage.addListener(handleBackgroundMessages);

    return () => { 
      isMounted = false; 
      chrome.runtime.onMessage.removeListener(handleBackgroundMessages);
    };
  }, [addToRecentTickets, extractTicketFromUrl]);

  useEffect(() => {
    const handleSettingsChange = (newSettings: SettingsStorage) => {
      console.log("Popup received settings update.");
      setSettings(newSettings);
    };
    addSettingsListener(handleSettingsChange as any);
    return () => {
      removeSettingsListener(handleSettingsChange as any);
    };
  }, []);

  useEffect(() => {
    if (ticketId && ticketId !== DEFAULT_SAMPLE_TICKET_ID) {
      chrome.storage.local.set({ lastTicketId: ticketId });
    }
  }, [ticketId]);

  // --- Memoized Derived Data (ORDER MATTERS) ---
  const environments = useMemo((): Environment[] => {
    const baseUrls = settings?.urls && typeof settings.urls === 'object'
                      ? settings.urls
                      : DEFAULT_SETTINGS.urls;
    
    // Create environment entries only for URLs that exist in settings
    const envConfig = [
      { id: 'mobile', name: 'Mobile', icon: 'smartphone' as IconName, color: 'bg-blue-500', url: baseUrls.mobile },
      { id: 'desktop', name: 'Desktop', icon: 'monitor' as IconName, color: 'bg-teal-500', url: baseUrls.desktop },
      { id: 'bo', name: 'BO', icon: 'building' as IconName, color: 'bg-green-500', url: baseUrls.bo },
      { id: 'drupal7', name: 'Drupal 7', icon: 'layout' as IconName, color: 'bg-purple-500', url: baseUrls.drupal7 },
      { id: 'drupal9', name: 'Drupal 9', icon: 'layout' as IconName, color: 'bg-orange-500', url: baseUrls.drupal9 },
    ].filter(env => !!env.url);
    
    // Always add QR code option
    return [
      ...envConfig,
      { id: 'qrcode', name: 'QR Code', icon: 'qr-code' as IconName, color: 'bg-red-500', url: '' }
    ];
  }, [settings?.urls]);

  // Define hasEnvironments here based on environments
  const hasEnvironments = useMemo(() => 
    environments.filter(env => env.id !== 'qrcode').length > 0, 
  [environments]);

  // Restore the missing useEffect hook for setting the initial environment
  useEffect(() => {
    if (!isLoading && environments.length > 0) {
      const currentEnvExists = environments.find(env => env.id === activeEnv);
      if (!activeEnv || !currentEnvExists) {
        const mobileEnv = environments.find(env => env.id === 'mobile');
        setActiveEnv(mobileEnv ? mobileEnv.id : environments[0].id);
      }
    }
  }, [activeEnv, environments, isLoading]);
  
  const currentEnv = useMemo(() => environments.find(e => e.id === activeEnv), [environments, activeEnv]);

  const currentFullUrl = useMemo(() => {
    const idToUse = ticketId || DEFAULT_SAMPLE_TICKET_ID;
    
    // Use URL structure if available, otherwise fallback to simple concatenation
    if (settings.urlStructure && settings.urlStructure.length > 0 && currentEnv?.url) {
      return buildUrlFromPattern(
        currentEnv.url,
        settings.urlStructure,
        idToUse,
        settings.ticketTypes[0] || '',
        ''  // Empty prefix
      );
    }
    
    // Fallback to simple concatenation
    return currentEnv?.url && idToUse
      ? `${currentEnv.url.replace(/\/$/, '')}/${idToUse}`
      : '';
  }, [currentEnv, ticketId, settings.urlStructure, settings.ticketTypes]);

  const qrCodeSelectedEnvConfig = useMemo(() => environments.find(e => e.id === qrCodeEnvId), [environments, qrCodeEnvId]);

  const qrCodeUrl = useMemo(() => {
    const idToUse = ticketId || DEFAULT_SAMPLE_TICKET_ID;
    
    // Use URL structure if available, otherwise fallback to simple concatenation
    if (settings.urlStructure && settings.urlStructure.length > 0 && qrCodeSelectedEnvConfig?.url) {
      return buildUrlFromPattern(
        qrCodeSelectedEnvConfig.url,
        settings.urlStructure,
        idToUse,
        settings.ticketTypes[0] || '',
        ''  // Empty prefix
      );
    }
    
    // Fallback to simple concatenation
    return qrCodeSelectedEnvConfig?.url && idToUse
      ? `${qrCodeSelectedEnvConfig.url.replace(/\/$/, '')}/${idToUse}`
      : '';
  }, [qrCodeSelectedEnvConfig, ticketId, settings.urlStructure, settings.ticketTypes]);

  // --- Callbacks (Defined AFTER derived data) ---
  const copyToClipboard = useCallback((text: string, message: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => { setToastMessage(message); })
      .catch(err => { console.error("Copy failed: ", err); setToastMessage("Copy failed!"); });
  }, [setToastMessage]);

  const handleCopyEnvironmentLinks = useCallback(() => {
    const urls = settings?.urls && typeof settings.urls === 'object'
                  ? settings.urls
                  : DEFAULT_SETTINGS.urls;

    let textToCopy = '';
    if (settings.useMarkdownCopy) {
      // Generate Markdown Text
      textToCopy = generateMarkdownLinks(urls);
    } else {
      // Generate Plain Text
      textToCopy = generatePlainTextLinks(urls);
    }

    copyToClipboard(textToCopy, settings.useMarkdownCopy ? "Environment links (Markdown) copied!" : "Environment links (Plain Text) copied!");
  }, [copyToClipboard, settings?.urls, settings.useMarkdownCopy]);

  const handleCopyUrl = useCallback(() => {
    copyToClipboard(currentFullUrl, "URL Copied!");
  }, [currentFullUrl, copyToClipboard]);

  const selectRecentTicket = useCallback((ticket: string) => {
    setTicketId(ticket);
    setShowRecentTickets(false);
  }, [setTicketId, setShowRecentTickets]);

  const openOptionsPage = useCallback(() => { chrome.runtime.openOptionsPage(); }, []);

  const handleQrCodeCopy = useCallback(async (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = event.currentTarget.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) { setToastMessage("QR Code copy failed: Canvas not found!"); return; }
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) { setToastMessage("QR Code copy failed: Could not generate blob!"); return; }
        try {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          setToastMessage("QR Code Image Copied!");
          setIsQrCodeAnimating(true);
          setTimeout(() => setIsQrCodeAnimating(false), 300);
        } catch (err) { console.error("QR Code copy failed: ", err); setToastMessage("QR Code copy failed!"); }
      }, 'image/png');
    } catch (error) { console.error("Error generating QR code blob: ", error); setToastMessage("QR Code copy failed!"); }
  }, [setToastMessage, setIsQrCodeAnimating]);

  // --- Render Logic ---
  if (isLoading) {
    return <div className="w-[450px] h-[300px] flex items-center justify-center"><p>{t('common.loading')}</p></div>;
  }

  const showSettingsOverlay = !hasEnvironments || 
    ((!settings.prefixes || settings.prefixes.length === 0) && 
     (!settings.ticketTypes || settings.ticketTypes.length === 0) && 
     Object.values(settings.urls || {}).every(url => !url));

  // Define isDarkMode for theme support
  const isDarkMode = settings.theme === 'dark' ||
                    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`w-[468px] min-w-[468px] max-w-[468px] text-sm font-sans ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} ${showSettingsOverlay ? 'h-[235px]' : ''}`} id="jira-url-wizard">
      <MemoizedPopupHeader
        ticketId={ticketId}
        recentTickets={recentTickets}
        showRecentTickets={showRecentTickets}
        onCopyEnvironmentLinks={handleCopyEnvironmentLinks}
        onToggleRecentTickets={() => setShowRecentTickets(prev => !prev)}
        onSelectRecentTicket={selectRecentTicket}
        onRefreshFromCurrentTab={refreshTicketIdFromCurrentTab}
        onTicketIdChange={setTicketId}
        settings={settings}
      />
      
      {/* Environment Tabs (only show if environments available) */}
      {hasEnvironments && (
        <MemoizedEnvironmentTabs
          environments={environments}
          activeEnv={activeEnv}
          onSelectEnv={setActiveEnv}
        />
      )}

      <MemoizedOutputArea
        activeEnv={activeEnv}
        currentFullUrl={currentFullUrl}
        currentEnv={currentEnv}
        ticketId={ticketId} // Use the full ticket ID
        onCopyUrl={handleCopyUrl}
        
        environments={environments}
        qrCodeEnvId={qrCodeEnvId}
        qrCodeUrl={qrCodeUrl}
        onSelectQrEnv={setQrCodeEnvId}
        onCopyQrCode={handleQrCodeCopy}
        isAnimating={isQrCodeAnimating}
        integrateQrImage={settings.integrateQrImage}
        settings={settings}
        hasEnvironments={hasEnvironments}
      />

      <MemoizedPopupFooter onOpenOptions={openOptionsPage} />

      {toastMessage && <MemoizedToast message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      {/* Settings Overlay */}
      {showSettingsOverlay && <SettingsOverlay isVisible={true} onOpenSettings={openOptionsPage} />}
    </div>
  );
};

export default JiraUrlWizard;