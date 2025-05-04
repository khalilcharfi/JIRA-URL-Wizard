import type { SettingsStorage } from '../shared/settings';
import type { UniqueIdentifier } from '@dnd-kit/core';

// URL processing utility functions
const ensureHttps = (url: string): string => 
  /^(http|https):\/\//.test(url) ? url : `https://${url}`;

const appendQueryParam = (url: string, param: string, value: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${param}=${value}`;
};

const addFFMFVKPrefix = (url: string): string => {
  if (!url) return url;
  
  const urlWithProtocol = ensureHttps(url);
  
  try {
    const urlObj = new URL(urlWithProtocol);
    urlObj.hostname = `FFMFVK-12345.${urlObj.hostname}`;
    return urlObj.toString();
  } catch {
    // Fallback regex approach
    const protocolMatch = urlWithProtocol.match(/^(https?:\/\/)(.*)/);
    return protocolMatch ? `${protocolMatch[1]}FFMFVK-12345.${protocolMatch[2]}` : urlWithProtocol;
  }
};

// Unified URL generation function
const processUrl = (
  baseUrl: string | undefined, 
  isD7 = false, 
  buildUrlFn?: (baseUrl: string | undefined, pattern: string[]) => string, 
  pattern?: UniqueIdentifier[]
): string => {
  // Handle empty Drupal 7 URLs
  if (isD7 && !baseUrl) {
    baseUrl = "ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung";
  }
  
  let resultUrl = "";
  
  // Apply pattern if provided
  if (buildUrlFn && pattern && baseUrl) {
    resultUrl = buildUrlFn(baseUrl, pattern.map(id => String(id)));
    
    // Special handling for Drupal 7
    if (isD7 && !resultUrl.includes('ffmfvk-2822')) {
      if (resultUrl.includes('cms1.sach.vv.check24-int.de')) {
        resultUrl = resultUrl.replace(
          'cms1.sach.vv.check24-int.de', 
          'ffmfvk-2822.cms1.sach.vv.check24-int.de'
        );
      } else {
        resultUrl = `https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung`;
      }
    }
  } else {
    resultUrl = baseUrl ? ensureHttps(baseUrl) : '';
  }
  
  // Add the FFMFVK prefix to all non-empty URLs
  return resultUrl ? addFFMFVKPrefix(resultUrl) : resultUrl;
};

// Section title constants
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

// Emoji constants
const EMOJIS = {
  frontend: "\u{1F310}",        // 🌐
  backOffice: "\u{1F6E0}\u{FE0F}", // 🛠️
  mobile: "\u{1F4F1}",          // 📱
  desktop: "\u{1F5A5}\u{FE0F}", // 🖥️
  cms: "\u{1F9E9}",             // 🧩
  drupal7: "\u{1F9D3}",         // 🧓
  drupal9: "\u{1F195}"          // 🆕
};

/**
 * Generate markdown formatted links
 */
export const generateMarkdownLinks = (
  urls: SettingsStorage['urls'], 
  buildUrlForBase?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[]
): string => {
  if (!urls || typeof urls !== 'object') return '';

  // Process all URLs in one batch
  const processedUrls = {
    bo: processUrl(urls.bo, false, buildUrlForBase, pattern),
    mobile: processUrl(urls.mobile, false, buildUrlForBase, pattern),
    desktop: processUrl(urls.desktop, false, buildUrlForBase, pattern),
    drupal7: processUrl(urls.drupal7, true, buildUrlForBase, pattern),
    drupal9: processUrl(urls.drupal9, false, buildUrlForBase, pattern)
  };

  // Generate frontend table
  const frontendRows = [
    processedUrls.bo ? `| ${EMOJIS.backOffice} Back Office    | [${processedUrls.bo}](${processedUrls.bo}) |` : '',
    processedUrls.mobile ? `| ${EMOJIS.mobile} Mobile Version | [${processedUrls.mobile}](${processedUrls.mobile}) |` : '',
    processedUrls.desktop ? `| ${EMOJIS.desktop} Desktop        | [${processedUrls.desktop}](${processedUrls.desktop}) |` : ''
  ].filter(Boolean);
  
  const frontendTable = frontendRows.length > 0 ? `## ${EMOJIS.frontend} Frontend

| Environment       | URL                                                                 |
|------------------|----------------------------------------------------------------------|
${frontendRows.join('\n')}
` : '';

  // Generate CMS table
  const cmsRows = [
    processedUrls.drupal7 ? `| ${EMOJIS.drupal7} **Drupal 7** | [${processedUrls.drupal7}](${processedUrls.drupal7}) |` : '',
    processedUrls.drupal9 ? `| ${EMOJIS.drupal9} **Drupal 9** | [${processedUrls.drupal9}](${processedUrls.drupal9}) |` : ''
  ].filter(Boolean);
  
  const cmsTable = cmsRows.length > 0 ? `## ${EMOJIS.cms} CMS

| CMS Version   | URL                                                                 |
|---------------|----------------------------------------------------------------------|
${cmsRows.join('\n')}
` : '';

  // Combine sections with a separator
  const sections = [frontendTable, cmsTable].filter(Boolean);
  return sections.length > 0 ? sections.join('\n---\n') : '';
};

/**
 * Generate plain text formatted links
 */
export const generatePlainTextLinks = (
  urls: SettingsStorage['urls'],
  buildUrlForBase?: (baseUrl: string | undefined, pattern: string[]) => string,
  pattern?: UniqueIdentifier[]
): string => {
  if (!urls || typeof urls !== 'object') return '';

  // Process all URLs in one batch
  const processedUrls = {
    bo: processUrl(urls.bo, false, buildUrlForBase, pattern),
    mobile: processUrl(urls.mobile, false, buildUrlForBase, pattern),
    desktop: processUrl(urls.desktop, false, buildUrlForBase, pattern),
    drupal7: processUrl(urls.drupal7, true, buildUrlForBase, pattern),
    drupal9: processUrl(urls.drupal9, false, buildUrlForBase, pattern)
  };

  // Generate frontend section
  let frontendSection = '';
  const frontendItems = [
    { label: 'Back Office Tool', url: processedUrls.bo },
    { label: 'Mobile Version', url: processedUrls.mobile },
    { label: 'Desktop Version', url: processedUrls.desktop }
  ].filter(item => item.url);
  
  if (frontendItems.length > 0) {
    frontendSection = `${SECTION_TITLES.FRONTEND.PLAIN}
${frontendItems.map(item => `- ${item.label}: ${item.url}`).join('\n')}`;
  }

  // Generate Drupal 7 section
  let drupal7Section = '';
  if (processedUrls.drupal7) {
    const drupal7Items = [
      { label: 'Base CMS', url: processedUrls.drupal7 },
      { label: 'Desktop View', url: appendQueryParam(processedUrls.drupal7, 'deviceoutput', 'desktop') },
      { label: 'Mobile View', url: appendQueryParam(processedUrls.drupal7, 'deviceoutput', 'mobile') }
    ];
    
    drupal7Section = `${SECTION_TITLES.DRUPAL7.PLAIN}
${drupal7Items.map(item => `- ${item.label}: ${item.url}`).join('\n')}`;
  }

  // Generate Drupal 9 section
  let drupal9Section = '';
  if (processedUrls.drupal9) {
    const drupal9Items = [
      { label: 'Desktop View', url: appendQueryParam(processedUrls.drupal9, 'deviceoutput', 'desktop') },
      { label: 'Mobile View', url: appendQueryParam(processedUrls.drupal9, 'deviceoutput', 'mobile') }
    ];
    
    drupal9Section = `${SECTION_TITLES.DRUPAL9.PLAIN}
${drupal9Items.map(item => `- ${item.label}: ${item.url}`).join('\n')}`;
  }

  // Combine sections
  const cmsSubsections = [drupal7Section, drupal9Section].filter(Boolean);
  const cmsSection = cmsSubsections.length > 0 
    ? `${SECTION_TITLES.CMS.PLAIN}
${cmsSubsections.join('\n\n')}`
    : '';

  const sections = [frontendSection, cmsSection].filter(Boolean);
  return sections.join('\n\n');
};