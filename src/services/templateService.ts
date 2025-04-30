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
  if (!urls || typeof urls !== 'object') {
    return '';
  }

  // --- User's requested markdown template structure ---
  // ## 🌐💻 Frontend Environments
  // - 🛠️ Back Office Tool → [https://bo.fahrradversicherung.check24-int.de]
  // - 📱 Mobile Version → [https://m.fahrradversicherung.check24-int.de?deviceoutput=mobile]
  // - 🖥️ Desktop Version → [https://desktop.fahrradversicherung.check24-int.de?deviceoutput=desktop]
  //
  // ## 📝📚 CMS Environments
  //
  // 💧7️⃣ **Drupal 7**
  // - Base CMS → [https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung]
  // - Desktop View → [https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=desktop]
  // - Mobile View → [https://ffmfvk-2822.cms1.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=mobile]
  //
  // 💧9️⃣ **Drupal 9**
  // - Desktop View → [https://cms2.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=desktop]
  // - Mobile View → [https://cms2.sach.vv.check24-int.de/fahrradversicherung?deviceoutput=mobile]

  // Frontend links
  const frontendItems = [
    { label: '🛠️ Back Office Tool', url: urls.bo || '' },
    { label: '📱 Mobile Version', url: urls.mobile || '' },
    { label: '🖥️ Desktop Version', url: urls.desktop || '' }
  ];
  const frontendLinks = frontendItems
    .filter(item => item.url)
    .map(item => `- ${item.label} → [${ensureHttps(item.url)}]`)
    .join('\n');
  const frontendSection = frontendLinks
    ? `## 🌐💻 Frontend Environments\n\n${frontendLinks}`
    : '';

  // Drupal 7 links
  const drupal7BaseUrl = urls.drupal7 || '';
  const drupal7BasePath = drupal7BaseUrl ? `${drupal7BaseUrl}` : '';
  const drupal7Items = [
    { label: 'Base CMS', url: drupal7BasePath },
    { label: 'Desktop View', url: drupal7BasePath },
    { label: 'Mobile View', url: drupal7BasePath }
  ];
  const drupal7Links = drupal7Items
    .filter(item => item.url)
    .map(item => `- ${item.label} → [${ensureHttps(item.url)}]`)
    .join('\n');
  const drupal7Section = drupal7Links
    ? `💧7️⃣ **Drupal 7**\n\n${drupal7Links}`
    : '';

  // Drupal 9 links
  const drupal9BaseUrl = urls.drupal9 || '';
  const drupal9BasePath = drupal9BaseUrl ? `${drupal9BaseUrl}` : '';
  const drupal9Items = [
    { label: 'Desktop View', url: drupal9BasePath },
    { label: 'Mobile View', url: drupal9BasePath }
  ];
  const drupal9Links = drupal9Items
    .filter(item => item.url)
    .map(item => `- ${item.label} → [${ensureHttps(item.url)}]`)
    .join('\n');
  const drupal9Section = drupal9Links
    ? `💧9️⃣ **Drupal 9**\n\n${drupal9Links}`
    : '';

  // CMS section
  const cmsSections = [drupal7Section, drupal9Section].filter(Boolean).join('\n\n');
  const cmsSection = cmsSections
    ? `## 📝📚 CMS Environments\n\n${cmsSections}`
    : '';

  // Combine all sections, separated by two newlines
  return [frontendSection, cmsSection].filter(Boolean).join('\n\n');
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