import type { SettingsStorage } from '../shared/settings';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { DEFAULT_SETTINGS } from '../shared/settings';

// URL processing utility functions
const urlUtils = {
  ensureHttps: (url: string): string => 
    /^(http|https):\/\//.test(url) ? url : `https://${url}`,
    
  appendQueryParam: (url: string, param: string, value: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${param}=${value}`;
  },
  
  addPrefixToUrl: (url: string, prefix: string): string => {
    if (!url || !prefix) return url;
    
    const urlWithProtocol = urlUtils.ensureHttps(url);
    
    try {
      const urlObj = new URL(urlWithProtocol);
      urlObj.hostname = `${prefix}.${urlObj.hostname}`;
      return urlObj.toString();
    } catch {
      // Fallback regex approach
      const protocolMatch = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
      return protocolMatch ? `${protocolMatch[1]}${prefix}.${protocolMatch[2]}` : urlWithProtocol;
    }
  },
  
  // Function to handle JIRA ticket prepending using URL structure pattern
  buildUrlWithStructure: (url: string, ticketInfo: { issuePrefix?: string, issueNumber?: string, ticketType?: string }, urlStructure?: string[]): string => {
    if (!url || !ticketInfo.issuePrefix || !ticketInfo.issueNumber) return url;
    
    // Use provided structure or fallback to a simple default
    const structure = urlStructure || ["issuePrefix", "-", "[0-9]+", ".", "baseUrl"];
    
    // Format ticket components
    const prefix = ticketInfo.issuePrefix.trim().toUpperCase();
    const number = ticketInfo.issueNumber.toString().trim();
    const ticketType = (ticketInfo.ticketType || '').trim().toLowerCase();
    
    // Validate number format
    if (!/^\d+$/.test(number)) return url;
    
    const urlWithProtocol = urlUtils.ensureHttps(url);
    
    try {
      const urlObj = new URL(urlWithProtocol);
      
      // Build the subdomain according to the structure
      let subdomain = '';
      
      for (const part of structure) {
        if (part === 'issuePrefix') {
          subdomain += prefix.toLowerCase();
        } else if (part === '[0-9]+') {
          subdomain += number;
        } else if (part === 'ticketType' && ticketType) {
          subdomain += ticketType;
        } else if (part === 'baseUrl') {
          // This is the actual domain, not part of subdomain
          break;
        } else {
          subdomain += part;
        }
      }
      
      // Check if ticket is already in hostname to avoid duplication
      if (urlObj.hostname.includes(subdomain.toLowerCase())) {
        return urlWithProtocol;
      }
      
      urlObj.hostname = `${subdomain.toLowerCase()}.${urlObj.hostname}`;
      return urlObj.toString();
    } catch {
      // Fallback regex approach
      const protocolMatch = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
      
      if (!protocolMatch) return urlWithProtocol;
      
      // Build the subdomain
      let subdomain = '';
      for (const part of structure) {
        if (part === 'issuePrefix') {
          subdomain += prefix.toLowerCase();
        } else if (part === '[0-9]+') {
          subdomain += number;
        } else if (part === 'ticketType' && ticketType) {
          subdomain += ticketType;
        } else if (part === 'baseUrl') {
          // This is the actual domain, not part of subdomain
          break;
        } else {
          subdomain += part;
        }
      }
      
      return `${protocolMatch[1]}${subdomain.toLowerCase()}.${protocolMatch[2]}`;
    }
  },
  
  // Parse ticket prefix into components (for backward compatibility)
  parseTicketPrefix: (ticketPrefix: string): { issuePrefix: string, issueNumber: string, ticketType?: string } => {
    // Try to match the expected JIRA format (e.g., FVK-123)
    const match = ticketPrefix.match(/^([A-Za-z]+)-(\d+)$/);
    
    if (match) {
      return {
        issuePrefix: match[1],
        issueNumber: match[2],
        // Default ticket type is empty, will be populated if available
        ticketType: ''
      };
    }
    
    // Fallback for non-standard formats
    return {
      issuePrefix: ticketPrefix,
      issueNumber: '',
      ticketType: ''
    };
  }
};

// UI constants
const UI = {
  EMOJIS: {
    FRONTEND: "🌐",
    BACK_OFFICE: "🛠️",
    MOBILE: "📱",
    DESKTOP: "🖥️",
    CMS: "🧩",
    DRUPAL7: "🧓",
    DRUPAL9: "🆕"
  },
  SECTIONS: {
    FRONTEND: {
      MARKDOWN: "Frontend",
      PLAIN: "🌐 Frontend Environments:"
    },
    CMS: {
      MARKDOWN: "CMS",
      PLAIN: "📝 CMS Environments:"
    },
    DRUPAL7: {
      MARKDOWN: "Drupal 7",
      PLAIN: "💧7️⃣ Drupal 7:"
    },
    DRUPAL9: {
      MARKDOWN: "Drupal 9",
      PLAIN: "💧9️⃣ Drupal 9:"
    }
  }
};

/**
 * Process URL with pattern and prefixes
 */
const processUrl = (
  baseUrl: string | undefined, 
  options: {
    isDrupal7?: boolean,
    buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
    pattern?: UniqueIdentifier[],
    settings?: SettingsStorage,
    urlStructure?: string[]
  } = {}
): string => {
  const { buildUrlFn, pattern, settings, urlStructure } = options;
  
  // Get settings
  const ticketPrefix = settings?.ticketPrefix || '';  
  
  let resultUrl = "";
  
  // Apply pattern if provided
  if (buildUrlFn && pattern && baseUrl) {
    resultUrl = buildUrlFn(baseUrl, pattern.map(id => String(id)));
  } else {
    resultUrl = baseUrl ? urlUtils.ensureHttps(baseUrl) : '';
  }
  
  // Add ticket prefix to URL using structure pattern if present
  if (resultUrl && ticketPrefix) {
    // Get the ticket components
    const ticketComponents = urlUtils.parseTicketPrefix(ticketPrefix);
    
    // Get the ticket type from settings if available
    if (settings?.ticketTypes && settings.ticketTypes.length > 0) {
      // Use first ticket type as default for now
      ticketComponents.ticketType = settings.ticketTypes[0];
    }
    
    // Use explicitly provided urlStructure
    return urlUtils.buildUrlWithStructure(resultUrl, ticketComponents, urlStructure);
  }
  
  return resultUrl;
};

/**
 * Process all URLs from settings
 */
const processAllUrls = (
  urls: SettingsStorage['urls'],
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[],
  settings?: SettingsStorage,
  urlStructure?: string[]
) => {
  if (!urls || typeof urls !== 'object') {
    return {
      bo: '', mobile: '', desktop: '', drupal7: '', drupal9: ''
    };
  }

  // Extract ticket number for consistent usage across all URLs
  let ticketNumber = '';
  if (settings?.ticketPrefix) {
    const ticketComponents = urlUtils.parseTicketPrefix(settings.ticketPrefix);
    ticketNumber = ticketComponents.issueNumber;
  }

  // Use extracted ticket number for each URL
  const processUrlWithTicket = (url: string | undefined) => {
    return processUrl(url, { 
      buildUrlFn, 
      pattern, 
      settings: settings ? {
        ...settings,
        // Ensure the ticket number is used consistently
        ticketPrefix: ticketNumber ? (settings.ticketPrefix || '') : ''
      } : undefined, 
      urlStructure 
    });
  };

  return {
    bo: processUrlWithTicket(urls.bo),
    mobile: processUrlWithTicket(urls.mobile),
    desktop: processUrlWithTicket(urls.desktop),
    drupal7: processUrlWithTicket(urls.drupal7),
    drupal9: processUrlWithTicket(urls.drupal9)
  };
};

/**
 * Generate markdown formatted links
 */
export const generateMarkdownLinks = (
  urls: SettingsStorage['urls'], 
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[],
  settings?: SettingsStorage,
  urlStructure: string[] = ["issuePrefix", "-", "[0-9]+", ".", "baseUrl"]
): string => {
  const processedUrls = processAllUrls(urls, buildUrlFn, pattern, settings, urlStructure);
  
  // Generate frontend table
  const frontendRows = [
    processedUrls.bo ? `| ${UI.EMOJIS.BACK_OFFICE} Back Office    | [${processedUrls.bo}](${processedUrls.bo}) |` : '',
    processedUrls.mobile ? `| ${UI.EMOJIS.MOBILE} Mobile Version | [${processedUrls.mobile}](${processedUrls.mobile}) |` : '',
    processedUrls.desktop ? `| ${UI.EMOJIS.DESKTOP} Desktop        | [${processedUrls.desktop}](${processedUrls.desktop}) |` : ''
  ].filter(Boolean);
  
  const frontendTable = frontendRows.length > 0 ? 
    `## ${UI.EMOJIS.FRONTEND} ${UI.SECTIONS.FRONTEND.MARKDOWN}\n\n` +
    `| Environment       | URL                                                                 |\n` +
    `|------------------|----------------------------------------------------------------------|\n` +
    `${frontendRows.join('\n')}\n` : '';

  // Generate CMS table
  const cmsRows = [
    processedUrls.drupal7 ? `| ${UI.EMOJIS.DRUPAL7} **${UI.SECTIONS.DRUPAL7.MARKDOWN}** | [${processedUrls.drupal7}](${processedUrls.drupal7}) |` : '',
    processedUrls.drupal9 ? `| ${UI.EMOJIS.DRUPAL9} **${UI.SECTIONS.DRUPAL9.MARKDOWN}** | [${processedUrls.drupal9}](${processedUrls.drupal9}) |` : ''
  ].filter(Boolean);
  
  const cmsTable = cmsRows.length > 0 ? 
    `## ${UI.EMOJIS.CMS} ${UI.SECTIONS.CMS.MARKDOWN}\n\n` +
    `| CMS Version   | URL                                                                 |\n` +
    `|---------------|----------------------------------------------------------------------|\n` +
    `${cmsRows.join('\n')}\n` : '';

  // Combine sections with a separator
  const sections = [frontendTable, cmsTable].filter(Boolean);
  return sections.length > 0 ? sections.join('\n---\n') : '';
};

/**
 * Generate plain text formatted links
 */
export const generatePlainTextLinks = (
  urls: SettingsStorage['urls'],
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[],
  settings?: SettingsStorage,
  urlStructure: string[] = ["issuePrefix", "-", "[0-9]+", ".", "baseUrl"]
): string => {
  const processedUrls = processAllUrls(urls, buildUrlFn, pattern, settings, urlStructure);

  // Build sections only if they have content
  const sections: string[] = [];

  // Frontend section
  const frontendItems = [
    { label: 'Back Office Tool', url: processedUrls.bo },
    { label: 'Mobile Version', url: processedUrls.mobile },
    { label: 'Desktop Version', url: processedUrls.desktop }
  ].filter(item => item.url);
  
  if (frontendItems.length > 0) {
    sections.push(
      `${UI.SECTIONS.FRONTEND.PLAIN}\n` +
      frontendItems.map(item => `- ${item.label}: ${item.url}`).join('\n')
    );
  }

  // CMS sections
  const cmsSubsections: string[] = [];

  // Drupal 7 section
  if (processedUrls.drupal7) {
    cmsSubsections.push(
      `${UI.SECTIONS.DRUPAL7.PLAIN}\n` +
      [
        `- Base CMS: ${processedUrls.drupal7}`,
        `- Desktop View: ${urlUtils.appendQueryParam(processedUrls.drupal7, 'deviceoutput', 'desktop')}`,
        `- Mobile View: ${urlUtils.appendQueryParam(processedUrls.drupal7, 'deviceoutput', 'mobile')}`
      ].join('\n')
    );
  }

  // Drupal 9 section
  if (processedUrls.drupal9) {
    cmsSubsections.push(
      `${UI.SECTIONS.DRUPAL9.PLAIN}\n` +
      [
        `- Desktop View: ${urlUtils.appendQueryParam(processedUrls.drupal9, 'deviceoutput', 'desktop')}`,
        `- Mobile View: ${urlUtils.appendQueryParam(processedUrls.drupal9, 'deviceoutput', 'mobile')}`
      ].join('\n')
    );
  }

  // Add CMS section if we have any subsections
  if (cmsSubsections.length > 0) {
    sections.push(
      `${UI.SECTIONS.CMS.PLAIN}\n` +
      cmsSubsections.join('\n\n')
    );
  }

  return sections.join('\n\n');
};