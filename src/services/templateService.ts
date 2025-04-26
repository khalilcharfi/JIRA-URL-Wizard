import type { SettingsStorage } from '../shared/settings';

// Helper function to ensure the URL starts with https
const ensureHttps = (url: string): string => {
  // If the URL doesn't start with 'http' or 'https', prepend 'https://'
  return /^(http|https):\/\//.test(url) ? url : `https://${url}`;
};

// Helper function to generate links for both markdown and plain text
const generateLinks = (urls: Record<string, string>, isMarkdown: boolean): string[] => {
  return Object.entries(urls)
    .filter(([, url]) => url)
    .map(([key, url]) => {
      const formattedLabel = key.replace(/([a-z])([A-Z])/g, '$1 $2'); // CamelCase to readable
      
      // Determine the correct suffix for Drupal links
      let rawFullUrl = url; // Start with the base URL
      if (key.startsWith('drupal')) {
          const separator = url.includes('?') ? '&' : '?';
          rawFullUrl += `${separator}`;
      }

      const fullUrl = ensureHttps(rawFullUrl); // Ensure HTTPS after constructing the full URL

      if (isMarkdown) {
        return `- **${formattedLabel}** → [${fullUrl}](${fullUrl})`;
      } else {
        return `- ${formattedLabel}: ${fullUrl}`;
      }
    });
};

// Generate a section of the markdown or plain text
const generateSection = (title: string, urls: Record<string, string>, isMarkdown: boolean): string => {
  const links = generateLinks(urls, isMarkdown);
  if (links.length === 0) return '';
  const sectionTitle = isMarkdown ? `# ${title}` : title;
  return `${sectionTitle}\n${links.join('\n')}`;
};

// Constants for section titles
const SECTION_TITLES = {
  FRONTEND: {
    MARKDOWN: '🌐 Frontend Environments',
    PLAIN: 'Frontend Environments:'
  },
  CMS: {
    MARKDOWN: '📝 CMS Environments',
    PLAIN: 'CMS Environments:'
  }
};

// Main function to generate Markdown formatted links
export const generateMarkdownLinks = (urls: SettingsStorage['urls']): string => {
  if (!urls || typeof urls !== 'object') {
    return '';
  }

  const FRONTEND_URLS = {
    bo: urls.bo,
    mobile: urls.mobile,
    desktop: urls.desktop
  };

  const CMS_URLS = {
    drupal7: urls.drupal7,
    drupal9: urls.drupal9
  };

  const frontendLinks = generateSection(SECTION_TITLES.FRONTEND.MARKDOWN, FRONTEND_URLS, true);
  const cmsLinks = generateSection(SECTION_TITLES.CMS.MARKDOWN, CMS_URLS, true);

  return [frontendLinks, cmsLinks].filter(Boolean).join('\n---\n');
};

// Main function to generate plain text formatted links
export const generatePlainTextLinks = (urls: SettingsStorage['urls']): string => {
  if (!urls || typeof urls !== 'object') {
    return '';
  }

  const FRONTEND_URLS = {
    bo: urls.bo,
    mobile: urls.mobile,
    desktop: urls.desktop
  };

  const CMS_URLS = {
    drupal7: urls.drupal7,
    drupal9: urls.drupal9
  };

  const frontendLinks = generateSection(SECTION_TITLES.FRONTEND.PLAIN, FRONTEND_URLS, false);
  const cmsLinks = generateSection(SECTION_TITLES.CMS.PLAIN, CMS_URLS, false);

  return [frontendLinks, cmsLinks].filter(Boolean).join('\n');
};