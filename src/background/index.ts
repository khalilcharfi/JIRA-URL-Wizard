import { getSettings } from '../services/storageService';
import type { JiraPattern } from '../shared/settings';

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only proceed if URL changed and we have a complete URL
  if (changeInfo.url) {
    try {
      // Get current settings with JIRA patterns
      const settings = await getSettings();
      const patterns = settings.jiraPatterns || [];
      
      // Try to extract ticket ID from URL
      let extractedTicketId: string | null = null;
      
      for (const jp of patterns) {
        if (jp.enabled === false) continue;
        
        try {
          const regex = new RegExp(jp.pattern);
          const match = changeInfo.url.match(regex);
          
          if (match && match[1]) {
            extractedTicketId = match[1];
            console.log(`Background: Extracted ticket ID '${extractedTicketId}' using pattern: ${jp.pattern}`);
            
            // Try to normalize the ticket format if needed
            if (!extractedTicketId.includes('-') && /^\d+$/.test(extractedTicketId) && settings.prefixes.length > 0) {
              extractedTicketId = `${settings.prefixes[0]}-${extractedTicketId}`;
            }
            
            break;
          }
        } catch (e) {
          console.warn(`Background: Invalid regex in settings: ${jp.pattern}`, e);
        }
      }
      
      if (extractedTicketId) {
        // Store the extracted ticket ID for the popup to use
        await chrome.storage.local.set({ 
          lastTicketId: extractedTicketId,
          lastTicketDetectedAt: Date.now() 
        });
        
        // Add to recent tickets
        const recentTicketsData = await chrome.storage.sync.get('recentTickets');
        const recentTickets = recentTicketsData.recentTickets || [];
        
        if (!recentTickets.includes(extractedTicketId)) {
          const updatedTickets = [extractedTicketId, ...recentTickets.filter(t => t !== extractedTicketId)].slice(0, 5);
          await chrome.storage.sync.set({ recentTickets: updatedTickets });
        }
        
        // Notify any open popup
        chrome.runtime.sendMessage({ 
          action: 'ticketDetected', 
          ticketId: extractedTicketId 
        }).catch(() => {
          // Ignore errors when no popup is open to receive the message
        });
      }
    } catch (error) {
      console.error('Background: Error processing tab URL:', error);
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
});
