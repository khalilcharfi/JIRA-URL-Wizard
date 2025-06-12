import type { SettingsStorage } from '../shared/settings';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { JiraPattern } from '../shared/settings';

// Extended SettingsStorage interface to include ticketPrefix and other optional fields
interface ExtendedSettingsStorage extends SettingsStorage {
  allowManualTicketInput?: boolean;
  jiraPatterns?: JiraPattern[];
  language?: string;
  markdownTemplate?: string;
  prefixes: string[];
  showAdvancedSettings?: boolean;
  theme?: 'light' | 'dark' | 'system';
  integrateQrImage?: boolean;
  useMarkdownCopy?: boolean;
}

// Types for better type safety
interface TicketInfo {
  issuePrefix: string;
  issueNumber: string;
  ticketType?: string;
}

interface ProcessedUrls {
  bo: string;
  mobile: string;
  desktop: string;
  drupal7: string;
  drupal9: string;
}

interface ProcessUrlOptions {
  isDrupal7?: boolean;
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string;
  pattern?: UniqueIdentifier[];
  settings?: ExtendedSettingsStorage;
  urlStructure?: string[];
}

// URL processing utility functions
const urlUtils = {
  /**
   * Ensures URL has HTTPS protocol
   */
  ensureHttps: (url: string): string => 
    /^https?:\/\//.test(url) ? url : `https://${url}`,
    
  /**
   * Appends query parameter to URL
   */
  appendQueryParam: (url: string, param: string, value: string): string => {
    if (!url || !param || !value) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(param)}=${encodeURIComponent(value)}`;
  },
  
  /**
   * Adds prefix to URL hostname
   */
  addPrefixToUrl: (url: string, prefix: string): string => {
    if (!url || !prefix) return url;
    
    const urlWithProtocol = urlUtils.ensureHttps(url);
    
    try {
      const urlObj = new URL(urlWithProtocol);
      urlObj.hostname = `${prefix}.${urlObj.hostname}`;
      return urlObj.toString();
    } catch {
      // Fallback for invalid URLs
      const match = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
      return match ? `${match[1]}${prefix}.${match[2]}` : urlWithProtocol;
    }
  },
  
  /**
   * Builds URL with ticket structure pattern
   */
  buildUrlWithStructure: (
    url: string, 
    ticketInfo: TicketInfo, 
    urlStructure: string[] = ["issuePrefix", "-", "[0-9]+", ".", "baseUrl"]
  ): string => {
    if (!url) {
      return url;
    }

    // If issuePrefix is present but issueNumber is missing, use issuePrefix as the subdomain
    if (ticketInfo.issuePrefix && !ticketInfo.issueNumber) {
      const urlWithProtocol = urlUtils.ensureHttps(url);
      let subdomain = ticketInfo.issuePrefix.toLowerCase();
      // Remove consecutive dots from subdomain
      subdomain = subdomain.replace(/\.+/g, ".");
      subdomain = subdomain.replace(/^\.|\.$/g, ""); // Remove leading/trailing dot
      try {
        const urlObj = new URL(urlWithProtocol);
        if (urlObj.hostname.startsWith(subdomain + ".")) {
          return urlWithProtocol;
        }
        urlObj.hostname = `${subdomain}.${urlObj.hostname}`;
        return urlObj.toString();
      } catch {
        const match = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
        return match ? `${match[1]}${subdomain}.${match[2]}` : urlWithProtocol;
      }
    }

    const { issuePrefix, issueNumber, ticketType = '' } = ticketInfo;

    // Validate inputs
    if (!issuePrefix || !issueNumber) {
      return url;
    }

    if (!/^\d+$/.test(issueNumber)) {
      console.warn(`Invalid issue number format: ${issueNumber}`);
      return url;
    }

    const urlWithProtocol = urlUtils.ensureHttps(url);
    let subdomain = urlUtils.buildSubdomain(urlStructure, {
      issuePrefix: issuePrefix.toLowerCase(),
      issueNumber,
      ticketType: ticketType.toLowerCase()
    });

    // Remove consecutive dots from subdomain
    subdomain = subdomain.replace(/\.+/g, ".");
    subdomain = subdomain.replace(/^\.|\.$/g, ""); // Remove leading/trailing dot

    try {
      const urlObj = new URL(urlWithProtocol);
      if (urlObj.hostname.includes(subdomain)) {
        return urlWithProtocol;
      }
      urlObj.hostname = `${subdomain}.${urlObj.hostname}`;
      return urlObj.toString();
    } catch {
      const match = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
      return match ? `${match[1]}${subdomain}.${match[2]}` : urlWithProtocol;
    }
  },
  
  /**
   * Builds subdomain from structure pattern
   */
  buildSubdomain: (
    structure: string[], 
    components: { issuePrefix: string; issueNumber: string; ticketType: string }
  ): string => {
    return structure.reduce((subdomain, part) => {
      switch (part) {
        case 'issuePrefix':
          return subdomain + components.issuePrefix;
        case '[0-9]+':
          return subdomain + components.issueNumber;
        case 'ticketType':
          return components.ticketType ? subdomain + components.ticketType : subdomain;
        case 'baseUrl':
          return subdomain; // End of subdomain parts
        default:
          return subdomain + part;
      }
    }, '');
  },
  
  /**
   * Parses ticket prefix into components (JIRA format: ABC-123)
   */
  parseTicketPrefix: (ticketPrefix: string): TicketInfo => {
    if (!ticketPrefix) {
      return { issuePrefix: '', issueNumber: '', ticketType: '' };
    }
    
    const match = ticketPrefix.match(/^([A-Za-z]+)-(\d+)$/);
    
    if (match) {
      return {
        issuePrefix: match[1].toUpperCase(),
        issueNumber: match[2],
        ticketType: ''
      };
    }
    
    // Fallback for non-standard formats
    console.warn(`Non-standard ticket format: ${ticketPrefix}`);
    return {
      issuePrefix: ticketPrefix.toUpperCase(),
      issueNumber: '',
      ticketType: ''
    };
  }
} as const;

// UI constants - moved to separate object for better organization
const UI_CONFIG = {
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
} as const;

/**
 * Processes a single URL with pattern and prefixes
 */
const processUrl = (
  baseUrl: string | undefined, 
  options: ProcessUrlOptions = {}
): string => {
  const { buildUrlFn, pattern, settings, urlStructure } = options;
  
  if (!baseUrl) return '';
  
  let resultUrl = baseUrl;

  // Always use buildUrlFn and pattern if available, otherwise fallback
  if (buildUrlFn && pattern && pattern.length > 0) {
    resultUrl = buildUrlFn(baseUrl, pattern.map(String));
  } else if (urlStructure && urlStructure.length > 0) {
    // fallback to urlUtils if pattern/buildUrlFn not available but urlStructure is
    let ticketPrefix = settings?.ticketPrefix?.trim();
    // If ticketPrefix is empty and drupal7Prefix exists, set ticketPrefix to drupal7Prefix
    if (!ticketPrefix && (settings as any)?.drupal7Prefix) {
      ticketPrefix = (settings as any).drupal7Prefix;
      // Remove drupal7Prefix from settings for the rest of the logic
      delete (settings as any).drupal7Prefix;
      settings.ticketPrefix = ticketPrefix;
    }
    // Fallback to prefixes[0] if still empty
    if (!ticketPrefix && settings?.prefixes?.length > 0) {
      ticketPrefix = settings.prefixes[0];
    }
    if (ticketPrefix) {
      const ticketComponents = urlUtils.parseTicketPrefix(ticketPrefix);
      if (settings?.ticketTypes?.length) {
        ticketComponents.ticketType = settings.ticketTypes[0];
      }
      resultUrl = urlUtils.buildUrlWithStructure(baseUrl, ticketComponents, urlStructure);
    } else {
      resultUrl = urlUtils.ensureHttps(baseUrl);
    }
  } else {
    resultUrl = urlUtils.ensureHttps(baseUrl);
  }
  return resultUrl;
};

/**
 * Processes all URLs from settings
 */
const processAllUrls = (
  urls: ExtendedSettingsStorage['urls'],
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[],
  settings?: ExtendedSettingsStorage,
  urlStructure?: string[]
): ProcessedUrls => {
  const defaultUrls: ProcessedUrls = {
    bo: '', mobile: '', desktop: '', drupal7: '', drupal9: ''
  };

  if (!urls || typeof urls !== 'object') {
    return defaultUrls;
  }

  const options: ProcessUrlOptions = { buildUrlFn, pattern, settings, urlStructure };

  return {
    bo: processUrl(urls.bo, options),
    mobile: processUrl(urls.mobile, options),
    desktop: processUrl(urls.desktop, options),
    drupal7: processUrl(urls.drupal7, options),
    drupal9: processUrl(urls.drupal9, options)
  };
};

/**
 * Creates markdown table row
 */
const createMarkdownRow = (emoji: string, label: string, url: string): string => {
  return `| ${emoji} ${label} | [${url}](${url}) |`;
};

/**
 * Creates markdown table with header
 */
const createMarkdownTable = (
  title: string, 
  emoji: string, 
  headers: [string, string], 
  rows: string[]
): string => {
  if (rows.length === 0) return '';
  
  return [
    `## ${emoji} ${title}`,
    '',
    `| ${headers[0]} | ${headers[1]} |`,
    `|${'-'.repeat(headers[0].length + 1)}|${'-'.repeat(headers[1].length + 1)}|`,
    ...rows,
    ''
  ].join('\n');
};

/**
 * Generates markdown formatted links
 */
export const generateMarkdownLinks = (
  urls: ExtendedSettingsStorage['urls'], 
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[],
  settings?: ExtendedSettingsStorage,
  urlStructure?: string[]
): string => {
  const processedUrls = processAllUrls(urls, buildUrlFn, pattern, settings, urlStructure);
  
  // Generate frontend table
  const frontendRows = [
    processedUrls.bo && createMarkdownRow(UI_CONFIG.EMOJIS.BACK_OFFICE, 'Back Office', processedUrls.bo),
    processedUrls.mobile && createMarkdownRow(UI_CONFIG.EMOJIS.MOBILE, 'Mobile Version', processedUrls.mobile),
    processedUrls.desktop && createMarkdownRow(UI_CONFIG.EMOJIS.DESKTOP, 'Desktop', processedUrls.desktop)
  ].filter(Boolean) as string[];
  
  const frontendTable = createMarkdownTable(
    UI_CONFIG.SECTIONS.FRONTEND.MARKDOWN,
    UI_CONFIG.EMOJIS.FRONTEND,
    ['Environment', 'URL'],
    frontendRows
  );

  // Generate CMS table
  const cmsRows = [
    processedUrls.drupal7 && createMarkdownRow(UI_CONFIG.EMOJIS.DRUPAL7, `**${UI_CONFIG.SECTIONS.DRUPAL7.MARKDOWN}**`, processedUrls.drupal7),
    processedUrls.drupal9 && createMarkdownRow(UI_CONFIG.EMOJIS.DRUPAL9, `**${UI_CONFIG.SECTIONS.DRUPAL9.MARKDOWN}**`, processedUrls.drupal9)
  ].filter(Boolean) as string[];
  
  const cmsTable = createMarkdownTable(
    UI_CONFIG.SECTIONS.CMS.MARKDOWN,
    UI_CONFIG.EMOJIS.CMS,
    ['CMS Version', 'URL'],
    cmsRows
  );

  // Combine sections
  const sections = [frontendTable, cmsTable].filter(Boolean);
  return sections.join('---\n');
};

/**
 * Creates plain text section
 */
const createPlainTextSection = (title: string, items: Array<{ label: string; url: string }>): string => {
  if (items.length === 0) return '';
  
  return [
    title,
    ...items.map(item => `- ${item.label}: ${item.url}`)
  ].join('\n');
};

/**
 * Generates plain text formatted links
 */
export const generatePlainTextLinks = (
  urls: ExtendedSettingsStorage['urls'],
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[],
  settings?: ExtendedSettingsStorage,
  urlStructure?: string[]
): string => {
  const processedUrls = processAllUrls(urls, buildUrlFn, pattern, settings, urlStructure);
  const sections: string[] = [];

  // Frontend section
  const frontendItems = [
    { label: 'Back Office Tool', url: processedUrls.bo },
    { label: 'Mobile Version', url: processedUrls.mobile },
    { label: 'Desktop Version', url: processedUrls.desktop }
  ].filter(item => item.url);
  
  if (frontendItems.length > 0) {
    sections.push(createPlainTextSection(UI_CONFIG.SECTIONS.FRONTEND.PLAIN, frontendItems));
  }

  // CMS sections
  const cmsSubsections: string[] = [];

  // Drupal 7 section
  if (processedUrls.drupal7) {
    const drupal7Items = [
      { label: 'Base CMS', url: processedUrls.drupal7 },
      { label: 'Desktop View', url: urlUtils.appendQueryParam(processedUrls.drupal7, 'deviceoutput', 'desktop') },
      { label: 'Mobile View', url: urlUtils.appendQueryParam(processedUrls.drupal7, 'deviceoutput', 'mobile') }
    ];
    
    cmsSubsections.push(createPlainTextSection(UI_CONFIG.SECTIONS.DRUPAL7.PLAIN, drupal7Items));
  }

  // Drupal 9 section
  if (processedUrls.drupal9) {
    const drupal9Items = [
      { label: 'Desktop View', url: urlUtils.appendQueryParam(processedUrls.drupal9, 'deviceoutput', 'desktop') },
      { label: 'Mobile View', url: urlUtils.appendQueryParam(processedUrls.drupal9, 'deviceoutput', 'mobile') }
    ];
    
    cmsSubsections.push(createPlainTextSection(UI_CONFIG.SECTIONS.DRUPAL9.PLAIN, drupal9Items));
  }

  // Add CMS section if we have subsections
  if (cmsSubsections.length > 0) {
    sections.push([UI_CONFIG.SECTIONS.CMS.PLAIN, ...cmsSubsections].join('\n\n'));
  }

  return sections.join('\n\n');
};

// Export utilities for external use
export { urlUtils, UI_CONFIG };
export type { ExtendedSettingsStorage };