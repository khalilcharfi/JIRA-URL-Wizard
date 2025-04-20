import { getSettings } from '../services/storageService';
import type { JiraPattern } from '../shared/settings';

// Use cross-browser compatible API
import { getBrowser } from '../utils/browser-polyfill';
const browser = getBrowser();

// Listen for tab URL changes
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only proceed if URL changed and we have a complete URL
  if (changeInfo.url) {
    try {
      // Get current settings with JIRA patterns
      const settings = await getSettings();
      const patterns = settings.jiraPatterns || [];
      
      // Try to extract ticket ID from URL
      let extractedTicketId: string | null = null;
      
      for (const jp of patterns) {
        // Skip if pattern is explicitly disabled (using type assertion for optional property)
        const pattern = jp as { pattern: string; enabled?: boolean };
        if (pattern.enabled === false) continue;
        
        try {
          const regex = new RegExp(pattern.pattern);
          const match = changeInfo.url.match(regex);
          
          if (match && match[1]) {
            extractedTicketId = match[1];
            
            // Try to normalize the ticket format if needed
            if (!extractedTicketId.includes('-') && /^\d+$/.test(extractedTicketId) && settings.prefixes.length > 0) {
              extractedTicketId = `${settings.prefixes[0]}-${extractedTicketId}`;
            }
            
            break;
          }
        } catch (e) {
          // Removed console.warn
        }
      }
      
      if (extractedTicketId) {
        // Store the extracted ticket ID for the popup to use
        await browser.storage.local.set({ 
          lastTicketId: extractedTicketId,
          lastTicketDetectedAt: Date.now() 
        });
        
        // Add to recent tickets
        const recentTicketsData = await browser.storage.sync.get('recentTickets');
        const recentTickets = recentTicketsData.recentTickets || [];
        
        if (!recentTickets.includes(extractedTicketId)) {
          const updatedTickets = [
            extractedTicketId, 
            ...recentTickets.filter((t: string) => t !== extractedTicketId)
          ].slice(0, 5);
          await browser.storage.sync.set({ recentTickets: updatedTickets });
        }
        
        // Notify any open popup
        browser.runtime.sendMessage({ 
          action: 'ticketDetected', 
          ticketId: extractedTicketId 
        }).catch(() => {
          // Ignore errors when no popup is open to receive the message
        });
      }
    } catch (error) {
      // Removed console.error
    }
  }
});

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentTabUrl') {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        sendResponse({ url: tabs[0].url });
      } else {
        sendResponse({ url: null });
      }
    });
    return true; // Required for async sendResponse
  }
});
