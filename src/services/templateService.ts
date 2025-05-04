import type { SettingsStorage } from '../shared/settings';
import type { UniqueIdentifier } from '@dnd-kit/core';

// Helper function to ensure the URL starts with https and handle query parameters properly
const ensureHttps = (url: string): string => {
  // If the URL doesn't start with 'http' or 'https', prepend 'https://'
  return /^(http|https):\/\//.test(url) ? url : `https://${url}`;
};

// Helper function to append query parameters correctly
const appendQueryParam = (url: string, param: string, value: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${param}=${value}`;
};

// Helper function to add FFMFVK-12345 prefix to URLs
const addFFMFVKPrefix = (url: string): string => {
  if (!url) return url;

  // Extract URL parts
  let urlWithProtocol = ensureHttps(url);
  
  try {
    const urlObj = new URL(urlWithProtocol);
    
    // Insert FFMFVK-12345. before the hostname
    urlObj.hostname = `FFMFVK-12345.${urlObj.hostname}`;
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, insert manually
    const protocolMatch = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
    if (protocolMatch) {
      return `${protocolMatch[1]}FFMFVK-12345.${protocolMatch[2]}`;
    }
    return urlWithProtocol;
  }
};

// Helper function to generate links for both markdown and plain text
const generateLinks = (items: Array<{ label: string, url: string }>, isMarkdown: boolean): string[] => {
  return items
    .filter(item => item.url)
    .map(item => {
      const fullUrl = ensureHttps(item.url);

      if (isMarkdown) {
        return `- **${item.label}** → [${fullUrl}](${fullUrl})`;
      } else {
        return `- ${item.label}: ${fullUrl}`;
      }
    });
};

// Constants for section titles with drop emoji and square number
const SECTION_TITLES = {
  FRONTEND: {
    MARKDOWN: '🌐💻 Frontend Environments',
    PLAIN: '🌐 Frontend Environments:'
  },
  CMS: {
    MARKDOWN: '📝📚 CMS Environments',
    PLAIN: '📝 CMS Environments:'
  },
  DRUPAL7: {
    MARKDOWN: '💧7️⃣ ## **Drupal 7**',
    PLAIN: '💧7️⃣ Drupal 7:'
  },
  DRUPAL9: {
    MARKDOWN: '💧9️⃣ ## **Drupal 9**',
    PLAIN: '💧9️⃣ Drupal 9:'
  }
};

// Function to get the URL - either with pattern (if provided) or directly - FOR MARKDOWN LINKS
const getMarkdownUrl = (baseUrl: string | undefined, isD7 = false, buildUrlForBase?: (baseUrl: string | undefined, pattern: string[]) => string, pattern?: UniqueIdentifier[]): string => {
  // For Drupal 7, ensure ffmfvk-2822 is included if no URL provided
  if (isD7 && !baseUrl) {
    baseUrl = "ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung";
  }
  
  let resultUrl = "";
  
  if (buildUrlForBase && pattern && baseUrl) {
    resultUrl = buildUrlForBase(baseUrl, pattern.map(id => String(id)));
    
    // For Drupal 7, ensure ffmfvk-2822 is present in the URL
    if (isD7 && !resultUrl.includes('ffmfvk-2822')) {
      // If URL doesn't already contain the identifier
      if (resultUrl.includes('cms1.sach.vv.check24-int.de')) {
        // Insert ffmfvk-2822 before cms1
        resultUrl = resultUrl.replace('cms1.sach.vv.check24-int.de', 'ffmfvk-2822.cms1.sach.vv.check24-int.de');
      } else {
        resultUrl = `https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung`;
      }
    }
  } else {
    resultUrl = baseUrl ? ensureHttps(baseUrl) : '';
  }
  
  // Add FFMFVK-12345 prefix to all URLs
  if (resultUrl) {
    resultUrl = addFFMFVKPrefix(resultUrl);
  }
  
  return resultUrl;
};

// Main function to generate Markdown formatted links
export const generateMarkdownLinks = (
  urls: SettingsStorage['urls'], 
  buildUrlForBase?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[]
): string => {
  if (!urls || typeof urls !== 'object') return '';

  // Use Unicode escape sequences for emojis
  const emojis = {
    frontend: "\u{1F310}",        // 🌐
    backOffice: "\u{1F6E0}\u{FE0F}", // 🛠️
    mobile: "\u{1F4F1}",          // 📱
    desktop: "\u{1F5A5}\u{FE0F}", // 🖥️
    cms: "\u{1F9E9}",             // 🧩
    drupal7: "\u{1F9D3}",         // 🧓
    drupal9: "\u{1F195}"          // 🆕
  };

  // Process base URLs to create full formatted links
  const boUrl = getMarkdownUrl(urls.bo, false, buildUrlForBase, pattern);
  const mobileUrl = getMarkdownUrl(urls.mobile, false, buildUrlForBase, pattern);
  const desktopUrl = getMarkdownUrl(urls.desktop, false, buildUrlForBase, pattern);
  const drupal7Url = getMarkdownUrl(urls.drupal7, true, buildUrlForBase, pattern);
  const drupal9Url = getMarkdownUrl(urls.drupal9, false, buildUrlForBase, pattern);

  // Custom markdown table format to ensure consistent URL formation
  const frontendRows = [
    boUrl ? `| ${emojis.backOffice} Back Office    | [${boUrl}](${boUrl}) |` : '',
    mobileUrl ? `| ${emojis.mobile} Mobile Version | [${mobileUrl}](${mobileUrl}) |` : '',
    desktopUrl ? `| ${emojis.desktop} Desktop        | [${desktopUrl}](${desktopUrl}) |` : ''
  ].filter(Boolean);
  
  const frontendTable = frontendRows.length > 0 ? `## ${emojis.frontend} Frontend

| Environment       | URL                                                                 |
|------------------|----------------------------------------------------------------------|
${frontendRows.join('\n')}
` : '';

  // Custom CMS table format
  const cmsRows = [
    drupal7Url ? `| ${emojis.drupal7} **Drupal 7** | [${drupal7Url}](${drupal7Url}) |` : '',
    drupal9Url ? `| ${emojis.drupal9} **Drupal 9** | [${drupal9Url}](${drupal9Url}) |` : ''
  ].filter(Boolean);
  
  const cmsTable = cmsRows.length > 0 ? `## ${emojis.cms} CMS

| CMS Version   | URL                                                                 |
|---------------|----------------------------------------------------------------------|
${cmsRows.join('\n')}
` : '';

  // Combine sections with a separator
  const sections = [frontendTable, cmsTable].filter(Boolean);
  return sections.length > 0 ? sections.join('\n---\n') : '';
};

// Main function to generate plain text formatted links
export const generatePlainTextLinks = (
  urls: SettingsStorage['urls'],
  buildUrlForBase?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[]
): string => {
  if (!urls || typeof urls !== 'object') {
    return '';
  }

  // Process base URLs to create full links
  const boUrl = getMarkdownUrl(urls.bo, false, buildUrlForBase, pattern);
  const mobileUrl = getMarkdownUrl(urls.mobile, false, buildUrlForBase, pattern);
  const desktopUrl = getMarkdownUrl(urls.desktop, false, buildUrlForBase, pattern);
  const drupal7BaseUrl = getMarkdownUrl(urls.drupal7, true, buildUrlForBase, pattern);
  const drupal9BaseUrl = getMarkdownUrl(urls.drupal9, false, buildUrlForBase, pattern);

  // Frontend section in plain text format
  let frontendSection = '';
  const frontendUrls = [
    { label: 'Back Office Tool', url: boUrl },
    { label: 'Mobile Version', url: mobileUrl },
    { label: 'Desktop Version', url: desktopUrl }
  ].filter(item => item.url);
  
  if (frontendUrls.length > 0) {
    frontendSection = `${SECTION_TITLES.FRONTEND.PLAIN}\n${frontendUrls.map(item => 
      `- ${item.label}: ${item.url}`
    ).join('\n')}`;
  }

  // Drupal 7 section
  let drupal7Section = '';
  if (drupal7BaseUrl) {
    const drupal7Items = [
      { label: 'Base CMS', url: drupal7BaseUrl },
      { label: 'Desktop View', url: appendQueryParam(drupal7BaseUrl, 'deviceoutput', 'desktop') },
      { label: 'Mobile View', url: appendQueryParam(drupal7BaseUrl, 'deviceoutput', 'mobile') }
    ];
    
    drupal7Section = `${SECTION_TITLES.DRUPAL7.PLAIN}\n${drupal7Items.map(item => 
      `- ${item.label}: ${item.url}`
    ).join('\n')}`;
  }

  // Drupal 9 section
  let drupal9Section = '';
  if (drupal9BaseUrl) {
    const drupal9Items = [
      { label: 'Desktop View', url: appendQueryParam(drupal9BaseUrl, 'deviceoutput', 'desktop') },
      { label: 'Mobile View', url: appendQueryParam(drupal9BaseUrl, 'deviceoutput', 'mobile') }
    ];
    
    drupal9Section = `${SECTION_TITLES.DRUPAL9.PLAIN}\n${drupal9Items.map(item => 
      `- ${item.label}: ${item.url}`
    ).join('\n')}`;
  }

  // Combine CMS sections
  const cmsSubsections = [drupal7Section, drupal9Section].filter(Boolean);
  const cmsSection = cmsSubsections.length > 0 
    ? `${SECTION_TITLES.CMS.PLAIN}\n${cmsSubsections.join('\n\n')}`
    : '';

  // Combine all sections
  const sections = [frontendSection, cmsSection].filter(Boolean);
  return sections.join('\n\n');
};