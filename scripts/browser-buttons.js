// Cache configuration
const CACHE_KEY = 'browser_versions_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to get cached data
function getCachedData() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
            return data;
        }
    }
    return null;
}

// Function to set cached data
function setCachedData(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
}

// Function to fetch browser button data
async function fetchBrowserButtonData() {
    try {
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
            console.log('Using cached browser version data');
            return cachedData;
        }

        // First fetch GitHub data as our primary source
        const githubResponse = await fetch('https://api.github.com/repos/khalilcharfi/JIRA-URL-Wizard/releases/latest');
        const githubData = await githubResponse.json();
        
        // Extract GitHub version and release date
        const githubVersion = githubData.tag_name;
        const releaseDate = githubData.published_at.split('T')[0]; // Format: YYYY-MM-DD
        
        // Find browser-specific assets from GitHub
        const assets = githubData.assets || [];
        const browserAssets = {
            chrome: assets.find(asset => asset.name.includes('chrome-mv3')),
            firefox: assets.find(asset => asset.name.includes('firefox-mv3')),
            edge: assets.find(asset => asset.name.includes('edge-mv3')),
            safari: assets.find(asset => asset.name.includes('safari-mv3'))
        };

        // Try to get Chrome Web Store version (more accurate for Chrome)
        let chromeVersion = githubVersion;
        try {
            const extensionId = 'opfnbeleknbmdnemmnlhigmmmkghncak';
            const chromeStoreUrl = `https://clients2.google.com/service/update2/crx?response=manifest&x=id%3D${extensionId}%26uc`;
            
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(chromeStoreUrl)}`);
            const data = await response.json();
            
            if (data.contents) {
                const xmlText = data.contents;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                if (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.nodeName !== 'parsererror') {
                    const updateCheck = xmlDoc.querySelector("updatecheck");
                    if (updateCheck && updateCheck.getAttribute("version")) {
                        chromeVersion = 'v' + updateCheck.getAttribute("version");
                        console.log("Chrome Web Store Version:", chromeVersion);
                    }
                }
            }
        } catch (chromeError) {
            console.warn("Couldn't fetch Chrome Web Store version, using GitHub version:", chromeError);
        }
        
        // Try to get Firefox version from Mozilla Add-ons
        let firefoxVersion = githubVersion;
        let firefoxReleaseDate = releaseDate;
        let firefoxEnabled = true; // Enable by default since we have GitHub data
        try {
            const targetUrl = "https://addons.mozilla.org/en-US/firefox/addon/jira-url-wizard/";
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
            const data = await response.json();
            
            if (data.contents) {
                const html = data.contents;
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const versionElement = doc.querySelector('dd[data-test-id="addon-version"]') || 
                                    doc.querySelector('.AddonMoreInfo-version');
                const version = versionElement?.innerText.trim();
                
                if (version) {
                    firefoxVersion = 'v' + version;
                    console.log("Firefox Add-on Version:", firefoxVersion);
                }
                
                const updatedElement = doc.querySelector('dd[data-test-id="last-updated"]') || 
                                     doc.querySelector('.AddonMoreInfo-last-updated');
                const updated = updatedElement?.innerText.trim();
                
                if (updated) {
                    const dateMatch = updated.match(/(\w+)\s+(\d+),\s+(\d+)/);
                    if (dateMatch) {
                        const [_, month, day, year] = dateMatch;
                        const parsedDate = new Date(`${month} ${day}, ${year}`);
                        if (!isNaN(parsedDate.getTime())) {
                            firefoxReleaseDate = parsedDate.toISOString().split('T')[0];
                        }
                    }
                }
            }
        } catch (firefoxError) {
            console.warn("Couldn't fetch Firefox Add-on data, using GitHub data:", firefoxError);
        }
        
        // Format dates for display
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
        
        const firefoxDate = new Date(firefoxReleaseDate);
        const firefoxFormattedDate = {
            en: firefoxDate.toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
            }),
            de: firefoxDate.toLocaleDateString('de-DE', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
            })
        };
        
        // Generate browser buttons configuration
        const browserButtons = [
            {
                id: 'chrome',
                name: 'Chrome',
                logo: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
                url: `https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak`,
                version: chromeVersion,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: true
            },
            {
                id: 'firefox',
                name: 'Firefox',
                logo: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
                url: browserAssets.firefox?.browser_download_url || "https://addons.mozilla.org/en-US/firefox/addon/jira-url-wizard/",
                version: firefoxVersion,
                releaseDate: firefoxReleaseDate,
                formattedDate: firefoxFormattedDate,
                enabled: firefoxEnabled
            },
            {
                id: 'edge',
                name: 'Edge',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
                url: browserAssets.edge?.browser_download_url || "https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/latest",
                version: githubVersion,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: true
            },
            {
                id: 'safari',
                name: 'Safari',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg',
                url: browserAssets.safari?.browser_download_url || null,
                version: githubVersion,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: !!browserAssets.safari?.browser_download_url
            }
        ];

        // Cache the results
        setCachedData(browserButtons);

        return browserButtons;
    } catch (error) {
        console.error('Error fetching browser button data:', error);
        
        // Try to get cached data as fallback
        const cachedData = getCachedData();
        if (cachedData) {
            console.log('Using cached data as fallback');
            return cachedData;
        }
        
        // If no cache available, return default configuration with GitHub data
        return [
            {
                id: 'chrome',
                name: 'Chrome',
                logo: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
                url: 'https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak',
                version: 'v1.0.4',
                releaseDate: '2023-04-16',
                formattedDate: {
                    en: 'April 16, 2023',
                    de: '16. April 2023'
                },
                enabled: true
            },
            {
                id: 'firefox',
                name: 'Firefox',
                logo: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
                url: "https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/latest",
                version: 'v1.0.4',
                releaseDate: '2023-04-16',
                formattedDate: {
                    en: 'April 16, 2023',
                    de: '16. April 2023'
                },
                enabled: true
            },
            {
                id: 'edge',
                name: 'Edge',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
                url: "https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/latest",
                version: 'v1.0.4',
                releaseDate: '2023-04-16',
                formattedDate: {
                    en: 'April 16, 2023',
                    de: '16. April 2023'
                },
                enabled: true
            },
            {
                id: 'safari',
                name: 'Safari',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg',
                url: null,
                version: 'v1.0.4',
                releaseDate: '2023-04-16',
                formattedDate: {
                    en: 'April 16, 2023',
                    de: '16. April 2023'
                },
                enabled: false
            }
        ];
    }
}

// Function to generate browser button HTML
function generateBrowserButton(button) {
    const formattedDate = window.formatDate(button.releaseDate, window.currentLang);
    const statusText = button.enabled ? 
        window.translations[window.currentLang].download.versionFormat
            .replace('{version}', button.version)
            .replace('{date}', formattedDate) : 
        window.translations[window.currentLang].download.comingSoon;
    
    return `
        <a href="${button.url}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="browser-btn ${button.id}-btn ${!button.enabled ? 'disabled' : ''}" 
           title="${button.enabled ? `Available on ${button.name} Web Store (${formattedDate})` : `${button.name} extension coming soon!`}"
           data-version="${button.version}"
           data-release-date="${button.releaseDate}">
            <img src="${button.logo}" alt="${button.name} Logo" class="browser-logo">
            <div class="browser-info">
                <div class="browser-name" data-i18n="browserButtons.${button.id.toLowerCase()}">${button.name}</div>
                <div class="version-info">${statusText}</div>
            </div>
        </a>
    `;
}

// Function to render browser buttons
async function renderBrowserButtons() {
    const container = document.getElementById('browserButtons');
    if (container) {
        // Show loading state
        container.innerHTML = '<div class="loading">Loading browser options...</div>';
        
        try {
            // Fetch and generate browser button data
            const browserButtons = await fetchBrowserButtonData();
            
            // Render buttons
            container.innerHTML = browserButtons.map(button => window.generateBrowserButton(button)).join('');
        } catch (error) {
            console.error('Error rendering browser buttons:', error);
            container.innerHTML = '<div class="error">Error loading browser options. Please try again later.</div>';
        }
    }
}

// Make functions and configuration globally available
window.browserButtons = [];
window.generateBrowserButton = generateBrowserButton;
window.renderBrowserButtons = renderBrowserButtons; 