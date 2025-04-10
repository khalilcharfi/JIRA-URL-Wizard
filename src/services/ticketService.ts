import type { JiraPattern } from '../shared/settings';
import { getCurrentTabUrl } from '../utils/urlUtils';

/**
 * Extracts the ticket ID from a matched string using the provided prefix
 * @param matchedString The string that matched the pattern
 * @param prefix The prefix to look for in the matched string
 * @returns The extracted ticket ID or null if not found
 */
export function extractTicketIdFromMatch(matchedString: string, prefix: string): string | null {
  if (!matchedString || !prefix) return null;
  
  // Find the part of the string that contains the prefix
  const prefixIndex = matchedString.toLowerCase().indexOf(prefix.toLowerCase());
  if (prefixIndex === -1) return null;
  
  // Extract the ticket ID (everything after the prefix)
  const ticketId = matchedString.slice(prefixIndex);
  return ticketId || null;
}

/**
 * Finds a valid prefix from a list of prefixes in a given string
 * @param str The string to search for prefixes
 * @param prefixes Array of valid prefixes to check against
 * @returns The first matching prefix or null if none found
 */
export function findValidPrefix(str: string, prefixes: string[]): string | null {
  if (!str || !prefixes?.length) return null;
  
  return prefixes.find(prefix => 
    str.toLowerCase().includes(prefix.toLowerCase())
  ) || null;
}

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

      if (match) {
        const matchedString = match[0];
        const validPrefix = findValidPrefix(matchedString, prefixes);
        
        if (validPrefix) {
          const pathParts = parsedUrl.pathname.split('/');
          const ticketPart = pathParts.find(part => 
            part.toLowerCase().includes(validPrefix.toLowerCase())
          );
          
          if (ticketPart) {
            extractedTicketId = extractTicketIdFromMatch(ticketPart, validPrefix);
            if (extractedTicketId) break;
          }
        }
      }
    } catch (e) {
      console.warn(`Error applying regex:`, e);
    }
  }

  return extractedTicketId;
}

/**
 * Normalizes a ticket ID by adding a prefix if needed
 * @param ticketId The ticket ID to normalize
 * @param prefixes Array of valid prefixes
 * @returns The normalized ticket ID
 */
export function normalizeTicketId(ticketId: string, prefixes: string[]): string {
  if (!ticketId || !prefixes?.length) return ticketId;
  
  // If ticket ID already contains a prefix, return as is
  if (prefixes.some(prefix => ticketId.toLowerCase().includes(prefix.toLowerCase()))) {
    return ticketId;
  }
  
  // If it's a numeric ID, add the first prefix
  if (/^\d+$/.test(ticketId)) {
    return `${prefixes[0]}-${ticketId}`;
  }
  
  return ticketId;
}

/**
 * Detects and extracts a ticket ID from the current tab
 * @param patterns Array of Jira patterns to match against
 * @param prefixes Array of valid prefixes to check against
 * @returns Promise resolving to the extracted ticket ID or null if not found
 */
export async function detectTicketFromCurrentTab(
  patterns: JiraPattern[],
  prefixes: string[]
): Promise<{ ticketId: string | null; error?: string }> {
  try {
    const url = await getCurrentTabUrl();
    if (!url) {
      return { ticketId: null, error: "Could not access current tab URL" };
    }

    const extractedTicketId = extractIssueIdFromUrl(url, patterns, prefixes);
    if (!extractedTicketId) {
      return { ticketId: null, error: "No ticket ID found in current tab" };
    }

    // Normalize the ticket ID
    const normalizedTicketId = normalizeTicketId(extractedTicketId, prefixes);
    return { ticketId: normalizedTicketId };
  } catch (error) {
    console.error("Error detecting ticket from current tab:", error);
    return { ticketId: null, error: "Error detecting ticket from current tab" };
  }
} 