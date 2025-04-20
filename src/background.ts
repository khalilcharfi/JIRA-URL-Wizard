import i18n from './i18n'; // Ensure i18next is initialized
import { initializeLanguage } from './services/i18nService';
import { getSettings } from './services/storageService';
import { extractIssueIdFromUrl } from './utils/urlUtils';
import './i18n'; // Import i18n configuration

// Initialize i18n first
initializeLanguage().then(() => {
  // Background script i18n initialized - silent handling
  
  // Now setup listeners and other background tasks
  setupListeners();
  
}).catch(error => {
  // Failed to initialize i18n in background script - silent handling
  // Optionally initialize listeners even if i18n fails
  // setupListeners();
});

// Cache settings to reduce storage reads
let cachedSettings: any = null;
let lastSettingsRefresh = 0;
const SETTINGS_CACHE_TTL = 60000; // 1 minute

// Get settings with cache
async function getSettingsWithCache() {
  const now = Date.now();
  if (!cachedSettings || now - lastSettingsRefresh > SETTINGS_CACHE_TTL) {
    try {
      cachedSettings = await getSettings();
      lastSettingsRefresh = now;
      // Settings refreshed from storage - silent handling
    } catch (error) {
      // Failed to get settings - silent handling
      cachedSettings = {}; // Use empty object as fallback
    }
  }
  return cachedSettings;
}

// Process URL to extract ticket ID
async function processUrl(url: string): Promise<string | null> {
  if (!url) return null;
  
  try {
    // Get current settings with JIRA patterns
    const settings = await getSettingsWithCache();
    const patterns = settings.jiraPatterns || [];
    const prefixes = settings.prefixes || [];
    
    // Try to extract ticket ID from URL using patterns
    for (const pattern of patterns) {
      if (!pattern.enabled || !pattern.regex) continue; // Skip disabled or invalid patterns
      
      try {
        const regex = new RegExp(pattern.regex);
        const match = url.match(regex);
        
        if (match && match[1]) {
          let extractedTicketId = match[1];
          // Extracted ticket ID using pattern - silent handling
          
          // Try to normalize the ticket format if needed
          if (!extractedTicketId.includes('-') && /^\d+$/.test(extractedTicketId) && prefixes.length > 0) {
            extractedTicketId = `${prefixes[0]}-${extractedTicketId}`;
          }
          
          return extractedTicketId.toUpperCase();
        }
      } catch (e) {
        // Invalid regex in settings - silent handling
      }
    }
    
    // Fallback to direct prefix matching
    if (prefixes.length > 0) {
      const prefixPattern = `(?:${prefixes.join('|')})-\\d+`;
      try {
        const regex = new RegExp(prefixPattern, 'i');
        const match = url.match(regex);
        
        if (match && match[0]) {
          return match[0].toUpperCase();
        }
      } catch (e) {
        // Error with prefix pattern - silent handling
      }
    }
    
    return null;
  } catch (error) {
    // Error processing URL - silent handling
    return null;
  }
}

// Add extracted ticket to recent tickets list
async function addToRecentTickets(ticketId: string) {
  try {
    const { recentTickets = [] } = await chrome.storage.sync.get('recentTickets');
    
    if (!recentTickets.includes(ticketId)) {
      const updatedTickets = [ticketId, ...recentTickets.filter((t: string) => t !== ticketId)].slice(0, 5);
      await chrome.storage.sync.set({ recentTickets: updatedTickets });
      // Added ticket to recent tickets - silent handling
    }
  } catch (error) {
    // Error updating recent tickets - silent handling
  }
}

// Function to setup all listeners
function setupListeners() {
  // Listen for tab URL changes
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only proceed if URL changed and we have a complete URL
    if (changeInfo.url) {
      const extractedTicketId = await processUrl(changeInfo.url);
      
      if (extractedTicketId) {
        // Store the extracted ticket ID for the popup to use
        await chrome.storage.local.set({ 
          lastTicketId: extractedTicketId,
          lastTicketDetectedAt: Date.now() 
        });
        
        // Add to recent tickets
        await addToRecentTickets(extractedTicketId);
        
        // Notify any open popup
        chrome.runtime.sendMessage({ 
          action: 'ticketDetected', 
          ticketId: extractedTicketId 
        }).catch(() => {
          // Ignore errors when no popup is open to receive the message
        });
      }
    }
  });

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getCurrentTabUrl') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          sendResponse({ url: tabs[0].url });
        } else {
          sendResponse({ url: null });
        }
      });
      return true; // Required for async sendResponse
    }
    
    if (message.action === 'detectTicketFromUrl') {
      const url = message.url;
      if (!url) {
        sendResponse({ ticketId: null, error: 'No URL provided' });
        return false;
      }
      
      processUrl(url).then(ticketId => {
        sendResponse({ ticketId, error: ticketId ? null : 'No ticket ID found in URL' });
      }).catch(error => {
        // Error processing URL from popup - silent handling
        sendResponse({ ticketId: null, error: 'Error processing URL' });
      });
      
      return true; // Required for async sendResponse
    }
    
    if (message.action === 'refreshSettings') {
      // Force settings refresh
      lastSettingsRefresh = 0;
      getSettingsWithCache().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        // Error refreshing settings - silent handling
        sendResponse({ success: false, error: String(error) });
      });
      return true; // Required for async sendResponse
    }
  });

  // When extension is first installed or updated
  chrome.runtime.onInstalled.addListener(async (details) => {
    // Extension event - silent handling
    // Initialize settings cache on install/update
    await getSettingsWithCache();
    // Setup context menus or other initial setup tasks
    // Example: setupContextMenu(); 
  });

  // Background listeners set up - silent handling
} 