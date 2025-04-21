const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { DOMParser } = require('xmldom');

// Configuration constants
const CONFIG = {
  HTML_FILE: path.join(__dirname, '../index.html'),
  GITHUB_API_URL: 'https://api.github.com/repos/khalilcharfi/JIRA-URL-Wizard/releases/latest',
  CHROME_STORE_URL: 'https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak',
  CHROME_API_URL: 'https://clients2.google.com/service/update2/crx?response=manifest&x=id%3Dopfnbeleknbmdnemmnlhigmmmkghncak%26uc',
  FIREFOX_ADDON_URL: 'https://addons.mozilla.org/en-US/firefox/addon/jira-url-wizard/',
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
    // First fetch GitHub release info
    const githubResponse = await axios.get(CONFIG.GITHUB_API_URL);
    const githubData = githubResponse.data;
    
    // Format the release date as YYYY-MM-DD
    const releaseDate = githubData.published_at.split('T')[0];

    // Format date for display
    const date = new Date(githubData.published_at);
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

    const assets = githubData.assets || [];
    const browserAssets = {
      chrome: assets.find(asset => asset.name.includes('chrome-mv3')),
      firefox: assets.find(asset => asset.name.includes('firefox-mv3')),
      edge: assets.find(asset => asset.name.includes('edge-mv3')),
      safari: assets.find(asset => asset.name.includes('safari-mv3'))
    };

    // Remove 'v' prefix from version if present
    const githubVersion = githubData.tag_name.replace(/^v/, '');
    
    // Try to fetch Chrome Web Store version (more accurate for Chrome)
    let chromeVersion = githubVersion;
    try {
      const chromeResponse = await axios.get(CONFIG.CHROME_API_URL);
      if (chromeResponse.data) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(chromeResponse.data, "text/xml");
        const updateCheckNodes = xmlDoc.getElementsByTagName("updatecheck");
        if (updateCheckNodes.length > 0) {
          const versionAttr = updateCheckNodes[0].getAttribute("version");
          if (versionAttr) {
            chromeVersion = versionAttr;
            console.log("Chrome Web Store Version:", chromeVersion);
          }
        }
      }
    } catch (chromeError) {
      console.warn("Couldn't fetch Chrome Web Store version:", chromeError.message);
      // Fall back to GitHub version
    }
    
    // Try to fetch Firefox Add-on version
    let firefoxVersion = githubVersion;
    let firefoxEnabled = false;
    let firefoxReleaseDate = releaseDate;
    
    try {
      const firefoxResponse = await axios.get(CONFIG.FIREFOX_ADDON_URL);
      if (firefoxResponse.data) {
        // Use regular expressions to extract the version since we're in Node.js 
        // without a full DOM parser for HTML
        const versionMatch = firefoxResponse.data.match(/data-test-id="addon-version"[^>]*>([^<]+)<\/dd>/);
        const dateMatch = firefoxResponse.data.match(/data-test-id="last-updated"[^>]*>([^<]+)<\/dd>/);
        
        if (versionMatch && versionMatch[1]) {
          firefoxVersion = versionMatch[1].trim();
          firefoxEnabled = true;
          console.log("Firefox Add-on Version:", firefoxVersion);
        }
        
        if (dateMatch && dateMatch[1]) {
          const dateText = dateMatch[1].trim();
          console.log("Firefox Last Updated:", dateText);
          
          // Try to parse the date if it's in a format we can handle
          const specificDateMatch = dateText.match(/(\w+)\s+(\d+),\s+(\d+)/);
          if (specificDateMatch) {
            const [_, month, day, year] = specificDateMatch;
            const parsedDate = new Date(`${month} ${day}, ${year}`);
            if (!isNaN(parsedDate.getTime())) {
              firefoxReleaseDate = parsedDate.toISOString().split('T')[0];
            }
          }
        }
      }
    } catch (firefoxError) {
      console.warn("Couldn't fetch Firefox Add-on data:", firefoxError.message);
      // Fall back to GitHub version and status
    }

    return {
      version: githubVersion,
      releaseDate,
      formattedDate,
      browsers: {
        chrome: {
          version: chromeVersion,
          url: CONFIG.CHROME_STORE_URL,
          enabled: true
        },
        firefox: {
          version: firefoxVersion,
          url: CONFIG.FIREFOX_ADDON_URL,
          enabled: firefoxEnabled
        },
        edge: {
          version: githubVersion,
          url: browserAssets.edge?.browser_download_url || null,
          enabled: !!browserAssets.edge?.browser_download_url
        },
        safari: {
          version: githubVersion,
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