const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Configuration constants
const CONFIG = {
  HTML_FILE: path.join(__dirname, '../index.html'),
  GITHUB_API_URL: 'https://api.github.com/repos/khalilcharfi/JIRA-URL-Wizard/releases/latest',
  CHROME_STORE_URL: 'https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak',
  DATE_FORMAT: {
    api: { year: 'numeric', month: '2-digit', day: '2-digit' },
    display: { year: 'numeric', month: 'long', day: 'numeric' }
  },
  BROWSER_ICONS: {
    chrome: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
    firefox: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
    edge: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
    safari: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg'
  }
};

/**
 * Formats a date string according to the specified format
 * @param {string} dateString - ISO date string
 * @param {string} formatType - Type of format to use ('api' or 'display')
 * @returns {string} - Formatted date string
 */
function formatDate(dateString, formatType = 'display') {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', CONFIG.DATE_FORMAT[formatType]);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Creates HTML for a browser download button
 * @param {string} browser - Browser name
 * @param {Object} info - Browser version info
 * @param {string} releaseDate - Release date string
 * @returns {string} - HTML button markup
 */
function createButtonHTML(browser, info, releaseDate) {
  const browserName = browser.charAt(0).toUpperCase() + browser.slice(1);
  const isEnabled = browser === 'chrome' ? true : (info.url !== null);
  const hrefValue = browser === 'chrome' ? CONFIG.CHROME_STORE_URL : (isEnabled ? info.url : '#');
  const linkTarget = (browser === 'chrome' || isEnabled) ? 'target="_blank" rel="noopener noreferrer"' : '';
  const buttonClass = `browser-btn ${browser}-btn${!isEnabled ? ' disabled' : ''}`;
  
  const titleText = browser === 'chrome' 
    ? `Available on Chrome Web Store (${releaseDate})`
    : isEnabled 
      ? `Latest version: ${info.version} (${releaseDate})`
      : `${browserName} version not available in latest release`;

  const versionText = isEnabled
    ? `v${info.version} • Released ${releaseDate}`
    : `v${info.version} • Coming Soon`;

  return `
    <a href="${hrefValue}" 
       ${linkTarget} 
       class="${buttonClass}" 
       title="${titleText}"
       data-version="${info.version}"
       data-release-date="${releaseDate}">
      <img src="${CONFIG.BROWSER_ICONS[browser]}" 
           alt="${browserName} Logo" 
           class="browser-logo">
      <div class="browser-info">
        <div class="browser-name" 
             data-i18n="browserButtons.${browser}">${browserName}</div>
        <div class="version-info">${versionText}</div>
      </div>
    </a>`.replace(/\n\s+/g, ' ').trim();
}

/**
 * Fetches GitHub release information
 * @returns {Promise<Object>} - Release information
 */
async function getLatestReleaseInfo() {
  try {
    const response = await axios.get(CONFIG.GITHUB_API_URL);
    const data = response.data;
    
    // Format the release date as YYYY-MM-DD
    const releaseDate = data.published_at.split('T')[0];

    // Format date for display
    const date = new Date(data.published_at);
    const formattedDate = {
      en: date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      }),
      de: date.toLocaleDateString('de-DE', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      })
    };

    const assets = data.assets || [];
    const browserAssets = {
      chrome: assets.find(asset => asset.name.includes('chrome-mv3')),
      firefox: assets.find(asset => asset.name.includes('firefox-mv3')),
      edge: assets.find(asset => asset.name.includes('edge-mv3')),
      safari: assets.find(asset => asset.name.includes('safari-mv3'))
    };

    // Remove 'v' prefix from version if present
    const version = data.tag_name.replace(/^v/, '');

    return {
      version,
      releaseDate,
      formattedDate,
      browsers: {
        chrome: {
          version,
          url: CONFIG.CHROME_STORE_URL,
          enabled: true
        },
        firefox: {
          version,
          url: browserAssets.firefox?.browser_download_url || null,
          enabled: !!browserAssets.firefox?.browser_download_url
        },
        edge: {
          version,
          url: browserAssets.edge?.browser_download_url || null,
          enabled: !!browserAssets.edge?.browser_download_url
        },
        safari: {
          version,
          url: browserAssets.safari?.browser_download_url || null,
          enabled: !!browserAssets.safari?.browser_download_url
        }
      }
    };
  } catch (error) {
    console.error('Error fetching release info:', error.message);
    const fallbackVersion = '1.0.4';
    const fallbackDate = '2025-04-16';
    
    // Format fallback date
    const date = new Date(fallbackDate);
    const formattedDate = {
      en: date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      }),
      de: date.toLocaleDateString('de-DE', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      })
    };
    
    return {
      version: fallbackVersion,
      releaseDate: fallbackDate,
      formattedDate,
      browsers: {
        chrome: { 
          version: fallbackVersion, 
          url: CONFIG.CHROME_STORE_URL,
          enabled: true 
        },
        firefox: { 
          version: fallbackVersion, 
          url: null,
          enabled: false 
        },
        edge: { 
          version: fallbackVersion, 
          url: null,
          enabled: false 
        },
        safari: { 
          version: fallbackVersion, 
          url: null,
          enabled: false 
        }
      }
    };
  }
}

/**
 * Updates the HTML file with browser buttons
 */
async function updateHTMLFile() {
  try {
    const releaseInfo = await getLatestReleaseInfo();
    const html = await fs.readFile(CONFIG.HTML_FILE, 'utf8');

    const browsers = ['chrome', 'firefox', 'edge', 'safari'];
    const buttonsHTML = browsers
      .map(browser => createButtonHTML(browser, releaseInfo.browsers[browser], releaseInfo.releaseDate))
      .join('\n');

    const replacementRegex = /<div class="browser-options">([\s\S]*?)<\/div>/;
    
    if (!replacementRegex.test(html)) {
      throw new Error('Could not find the <div class="browser-options"> container in index.html');
    }

    const updatedHTML = html.replace(
      replacementRegex, 
      `<div class="browser-options">\n${buttonsHTML}\n</div>`
    );

    await fs.writeFile(CONFIG.HTML_FILE, updatedHTML);
    console.log('Successfully updated browser links:');
    console.log(`- Version: ${releaseInfo.version}`);
    console.log(`- Release Date: ${releaseInfo.releaseDate}`);
    console.log('- Updated browsers:', browsers.join(', '));
  } catch (error) {
    console.error('Error updating HTML file:', error.message);
    process.exit(1);
  }
}

// Execute the update process
updateHTMLFile(); 