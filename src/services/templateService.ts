import type { SettingsStorage } from '../shared/settings';

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

// Main function to generate Markdown formatted links
export const generateMarkdownLinks = (urls: SettingsStorage['urls']): string => {
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

  // Frontend table with Unicode escape sequence emojis
  const frontendRows = [
    urls.bo ? `| ${emojis.backOffice} Back Office    | [${urls.bo}](${ensureHttps(urls.bo)}) |` : '',
    urls.mobile ? `| ${emojis.mobile} Mobile Version | [${urls.mobile}](${ensureHttps(urls.mobile)}) |` : '',
    urls.desktop ? `| ${emojis.desktop} Desktop        | [${urls.desktop}](${ensureHttps(urls.desktop)}) |` : ''
  ].filter(Boolean);

  const frontendTable = frontendRows.length > 0 ? [
    `## ${emojis.frontend} Frontend`,
    '',
    '| Environment       | URL                                                                 |',
    '|------------------|----------------------------------------------------------------------|',
    ...frontendRows,
    ''
  ].join('\n') : '';

  // CMS table with Unicode escape sequence emojis
  const cmsRows = [
    urls.drupal7 ? `| ${emojis.drupal7} **Drupal 7** | [${urls.drupal7}](${ensureHttps(urls.drupal7)}) |` : '',
    urls.drupal9 ? `| ${emojis.drupal9} **Drupal 9** | [${urls.drupal9}](${ensureHttps(urls.drupal9)}) |` : ''
  ].filter(Boolean);

  const cmsTable = cmsRows.length > 0 ? [
    `## ${emojis.cms} CMS`,
    '',
    '| CMS Version   | URL                                                                 |',
    '|---------------|----------------------------------------------------------------------|',
    ...cmsRows,
    ''
  ].join('\n') : '';

  // Combine sections with a separator
  return [frontendTable, '---', cmsTable].filter(Boolean).join('\n');
};

// Main function to generate plain text formatted links
export const generatePlainTextLinks = (urls: SettingsStorage['urls']): string => {
  if (!urls || typeof urls !== 'object') {
    return '';
  }

  // Frontend links
  const frontendItems = [
    { label: 'Back Office Tool', url: urls.bo || '' },
    { label: 'Mobile Version', url: urls.mobile || '' },
    { label: 'Desktop Version', url: urls.desktop || '' }
  ].filter(item => item.url);
  
  const frontendSection = frontendItems.length > 0 ? 
    `${SECTION_TITLES.FRONTEND.PLAIN}\n${generateLinks(frontendItems, false).join('\n')}` : '';

  // CMS - Drupal 7 links
  const drupal7BaseUrl = urls.drupal7 || '';
  const drupal7BasePath = drupal7BaseUrl ? `${drupal7BaseUrl}` : '';
  const drupal7ContentPath = drupal7BaseUrl ? `${drupal7BaseUrl}` : '';
  
  const drupal7Items = [
    { label: 'Base CMS', url: drupal7BasePath },
    { 
      label: 'Desktop View', 
      url: drupal7ContentPath ? appendQueryParam(drupal7ContentPath, 'deviceoutput', 'desktop') : '' 
    },
    { 
      label: 'Mobile View', 
      url: drupal7ContentPath ? appendQueryParam(drupal7ContentPath, 'deviceoutput', 'mobile') : '' 
    }
  ];

  const drupal7Section = drupal7BaseUrl ? 
    `${SECTION_TITLES.DRUPAL7.PLAIN}\n${generateLinks(drupal7Items, false).join('\n')}` : '';

  // CMS - Drupal 9 links
  const drupal9BaseUrl = urls.drupal9 || '';
  const drupal9ContentPath = drupal9BaseUrl ? `${drupal9BaseUrl}` : '';
  
  const drupal9Items = [
    { 
      label: 'Desktop View', 
      url: drupal9ContentPath ? appendQueryParam(drupal9ContentPath, 'deviceoutput', 'desktop') : '' 
    },
    { 
      label: 'Mobile View', 
      url: drupal9ContentPath ? appendQueryParam(drupal9ContentPath, 'deviceoutput', 'mobile') : '' 
    }
  ];

  const drupal9Section = drupal9BaseUrl ? 
    `${SECTION_TITLES.DRUPAL9.PLAIN}\n${generateLinks(drupal9Items, false).join('\n')}` : '';

  // Combine CMS sections with proper spacing
  const cmsSubsections = [drupal7Section, drupal9Section].filter(Boolean);
  const cmsSection = cmsSubsections.length > 0 ? 
    `${SECTION_TITLES.CMS.PLAIN}\n${cmsSubsections.join('\n\n')}` : '';

  // Combine all sections with clear separation
  const sections = [frontendSection, cmsSection].filter(Boolean);
  return sections.join('\n\n');
};