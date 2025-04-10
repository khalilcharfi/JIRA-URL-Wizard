/**
 * URL Builder utility for JIRA URL Wizard
 * 
 * This file handles the construction of URLs based on the configured URL structure pattern.
 */

/**
 * Builds a URL from a pattern defined in urlStructure
 * 
 * @param baseUrl The base URL from environment
 * @param urlStructure Array of pattern components from settings
 * @param ticketId The ticket ID
 * @param ticketType The ticket type (e.g., BUG, TASK)
 * @param issuePrefix The issue prefix (e.g., JIRA, DEV)
 * @returns Constructed URL according to pattern
 */
export function buildUrlFromPattern(
  baseUrl: string,
  urlStructure: string[], 
  ticketId: string,
  ticketType: string,
  issuePrefix: string
): string {
  let url = '';
  const numericMatch = ticketId.match(/\d+$/);
  const ticketNumber = numericMatch ? numericMatch[0] : '12345'; // Extract numeric part or use default
  const finalBaseUrl = formatBaseUrl(baseUrl);
  
  // Process each component in the structure
  urlStructure.forEach(component => {
    switch (component) {
      case 'ticketType':
        url += ticketType || 'TYPE';
        break;
      case 'issuePrefix':
        // Try to extract prefix from ticket ID if not provided
        if (!issuePrefix && ticketId && ticketId.includes('-')) {
          const parts = ticketId.split('-');
          url += parts[0];
        } else {
          url += issuePrefix || 'PREFIX';
        }
        break;
      case 'baseUrl':
        // Handle base URL differently depending on position
        if (!url) {
          url += finalBaseUrl;
        } else {
          // If not at start, remove protocol
          url += finalBaseUrl.replace(/^https?:\/\//, '');
        }
        break;
      case '.':
      case '-':
      case '_':
      case '/':
        url += component; // Add separator as is
        break;
      case '[0-9]+':
        url += ticketNumber; // Add numeric part
        break;
      case '[a-zA-Z0-9]+':
        // For alphanumeric, use the whole ticket ID if available
        url += ticketId.replace(/^[A-Z]+-/, '') || 'ABC123';
        break;
      default:
        // If it's a custom regex, add placeholder
        if (component.startsWith('[') && component.endsWith(']+')) {
          url += '[CUSTOM]';
        } else {
          // Default - add component as is
          url += component;
        }
    }
  });
  
  // Ensure URL starts with protocol if not starting with base URL
  if (url && !url.startsWith('http') && urlStructure[0] !== 'baseUrl') {
    return `https://${url}`;
  }
  
  return url || '';
}

/**
 * Format base URL to ensure it has proper protocol and no trailing slash
 */
function formatBaseUrl(baseUrl: string): string {
  let formattedUrl = baseUrl;
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }
  
  // Remove trailing slash
  formattedUrl = formattedUrl.replace(/\/$/, '');
  
  return formattedUrl;
} 