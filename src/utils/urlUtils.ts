import type { JiraPattern } from '../shared/settings';

/**
 * Extracts a Jira issue ID from a URL using configured patterns and prefixes
 * @param url The URL to extract the issue ID from
 * @param patterns Array of Jira patterns to match against
 * @param prefixes Array of valid prefixes to check against
 * @returns The extracted issue ID or null if not found
 */
export function extractIssueIdFromUrl(
  url: string,
  patterns: JiraPattern[],
  prefixes: string[]
): string | null {
  if (!url || !patterns?.length || !prefixes?.length) {
    return null;
  }

  const parsedUrl = new URL(url);
  let extractedTicketId: string | null = null;

  // Loop through each Jira pattern in settings
  for (const jp of patterns) {
    if (!jp.enabled) continue;

    try {
      const regex = new RegExp(jp.pattern);
      const match = url.match(regex);

      if (match && prefixes.some(prefix => url.toLowerCase().includes(prefix.toLowerCase()))) {
        const matchedTicketId = match[0];
        const validPrefix = prefixes.find(prefix => matchedTicketId.includes(prefix));
        
        if (validPrefix) {
          const pathParts = parsedUrl.pathname.split('/');
          const ticketPart = pathParts.find(part => {
            return part.toLowerCase().includes(validPrefix.toLowerCase());
          });
          
          if (ticketPart) {
            extractedTicketId = ticketPart;
            break;
          }
        }
      }
    } catch (e) {
      // Error applying regex - silent handling
    }
  }

  return extractedTicketId;
}

/**
 * Gets the current tab's URL using Chrome extension API
 * @returns Promise resolving to the current tab's URL or null if not available
 */
export async function getCurrentTabUrl(): Promise<string | null> {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCurrentTabUrl' });
    return response?.url || null;
  } catch (error) {
    // Error requesting URL from background - silent handling
    return null;
  }
} 