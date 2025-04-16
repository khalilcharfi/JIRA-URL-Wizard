const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Configuration constants
const CONFIG = {
  HTML_FILE: path.join(__dirname, '../index.html'),
  GITHUB_API_URL: 'https://api.github.com/repos/khalilcharfi/JIRA-URL-Wizard/releases/latest',
  CHROME_STORE_URL: 'https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak',
  RELEASE_DATE_FORMAT: { year: 'numeric', month: 'short', day: 'numeric' },
  COMING_SOON_VERSION: 'v1.0.4 • Coming Soon',
  BROWSER_ICONS: {
    chrome: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
    firefox: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
    edge: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
    safari: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg'
  }
};

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
  
  // Special handling for Chrome using Chrome Web Store link
  const hrefValue = browser === 'chrome' ? CONFIG.CHROME_STORE_URL : (isEnabled ? info.url : '#');
  const linkTarget = (browser === 'chrome' || isEnabled) ? 'target="_blank" rel="noopener noreferrer"' : '';
  const buttonClass = `browser-btn ${browser}-btn${!isEnabled ? ' disabled' : ''}`;
  
  // Title text differs based on browser and availability
  const titleText = browser === 'chrome' 
    ? `Available on Chrome Web Store (${releaseDate})`
    : isEnabled 
      ? `Latest version: ${info.version} (${releaseDate})`
      : `${browserName} version not available in latest release`;

  // Version and date information text
  const versionText = isEnabled
    ? `${info.version} • Released ${releaseDate}`
    : `${info.version} • Coming Soon`; // Assuming version is still known even if URL is null

  // Construct the new HTML structure
  return `<a href="${hrefValue}" 
             ${linkTarget} 
             class="${buttonClass}" 
             title="${titleText}"
             data-version="${info.version}"
             data-release-date="${releaseDate}">
          <img src="${CONFIG.BROWSER_ICONS[browser]}" alt="${browserName} Logo" class="browser-logo">
          <div class="browser-info">
            <div class="browser-name" data-i18n="browserButtons.${browser}">${browserName}</div>
            <div class="version-info">${versionText}</div>
          </div>
        </a>`;
}

/**
 * Fetches GitHub release information
 * @returns {Promise<Object>} - Release information
 */
async function getLatestReleaseInfo() {
  try {
    const response = await fetch(CONFIG.GITHUB_API_URL);
    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }
    const data = await response.json();
    
    // Get the release date from the published_at field
    const releaseDate = new Date(data.published_at);
    const formattedDate = releaseDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Extract browser-specific assets
    const assets = data.assets || [];
    const browserAssets = {
      chrome: assets.find(asset => asset.name.includes('chrome-mv3')),
      firefox: assets.find(asset => asset.name.includes('firefox-mv3')),
      edge: assets.find(asset => asset.name.includes('edge-mv3')),
      safari: assets.find(asset => asset.name.includes('safari-mv3'))
    };

    return {
      version: data.tag_name,
      releaseDate: formattedDate,
      browsers: {
        chrome: {
          version: data.tag_name,
          url: CONFIG.CHROME_STORE_URL
        },
        firefox: {
          version: data.tag_name,
          url: browserAssets.firefox?.browser_download_url || null
        },
        edge: {
          version: data.tag_name,
          url: browserAssets.edge?.browser_download_url || null
        },
        safari: {
          version: data.tag_name,
          url: browserAssets.safari?.browser_download_url || null
        }
      }
    };
  } catch (error) {
    console.error('Error fetching release info:', error);
    return {
      version: 'unknown',
      releaseDate: 'unknown',
      browsers: {
        chrome: { version: 'unknown', url: CONFIG.CHROME_STORE_URL },
        firefox: { version: 'unknown', url: null },
        edge: { version: 'unknown', url: null },
        safari: { version: 'unknown', url: null }
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

    // Create buttons HTML for each browser using the updated function
    const browsers = ['chrome', 'firefox', 'edge', 'safari'];
    const buttonsHTML = browsers
      .map(browser => createButtonHTML(browser, releaseInfo.browsers[browser], releaseInfo.releaseDate))
      .join('\n          '); // Adjust indentation as needed

    // Regex to find the content within the browser-options div
    const replacementRegex = /(<div class="browser-options">)(?:[\s\S]*?)(<\/div>)/;
    
    // Check if the container exists before attempting replacement
    if (!replacementRegex.test(html)) {
        console.error('Error: Could not find the <div class="browser-options"> container in index.html.');
        process.exit(1);
    }

    // Replace the content inside the browser-options div
    const updatedHTML = html.replace(replacementRegex, `$1\n          ${buttonsHTML}\n        $2`);

    // Write updated HTML back to file
    await fs.writeFile(CONFIG.HTML_FILE, updatedHTML);
    console.log('Successfully updated browser links and versions with release date:', releaseInfo.releaseDate);
  } catch (error) {
    console.error('Error updating HTML file:', error.message);
    process.exit(1);
  }
}

// Execute the update process
updateHTMLFile(); 