/**
 * Browser Version Tracker - Optimized
 * Fetches and displays browser extension version information
 */

// IIFE to avoid global namespace pollution
(function() {
    // Configuration
    const CONFIG = {
        CACHE_KEY: 'browser_versions_cache',
        CACHE_EXPIRY: 30 * 60 * 1000, // Increased to 30 minutes
        EXTENSION_ID: 'opfnbeleknbmdnemmnlhigmmmkghncak',
        GITHUB_REPO: 'khalilcharfi/JIRA-URL-Wizard',
        BROWSERS: {
            chrome: {
                name: 'Chrome',
                logo: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
                url: 'https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak',
                storeUrl: 'https://clients2.google.com/service/update2/crx?response=manifest&x=id%3Dopfnbeleknbmdnemmnlhigmmmkghncak%26uc'
            },
            firefox: {
                name: 'Firefox',
                logo: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
                url: 'https://addons.mozilla.org/en-US/firefox/addon/jira-url-wizard/',
                storeUrl: 'https://addons.mozilla.org/en-US/firefox/addon/jira-url-wizard/'
            },
            edge: {
                name: 'Edge',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
                url: 'https://microsoftedge.microsoft.com/addons/detail/jira-url-wizard/ejfhimblndldahicahoojgfnfbiifgic',
                storeUrl: 'https://microsoftedge.microsoft.com/addons/detail/jira-url-wizard/ejfhimblndldahicahoojgfnfbiifgic'
            },
            safari: {
                name: 'Safari',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg',
                url: null
            }
        },
        DEFAULT_VERSION: 'v1.0.4',
        DEFAULT_DATE: '2023-04-16'
    };

    // Cache utilities
    const CacheManager = {
        /**
         * Get cached data if valid
         * @returns {Array|null} Cached browser data or null
         */
        getData() {
            try {
                const cached = localStorage.getItem(CONFIG.CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CONFIG.CACHE_EXPIRY) {
                        console.log('Using cached browser version data');
                        return data;
                    }
                }
            } catch (error) {
                console.warn('Error reading from cache:', error);
            }
            return null;
        },

        /**
         * Save data to cache
         * @param {Array} data - Browser data to cache
         */
        setData(data) {
            try {
                localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('Error writing to cache:', error);
            }
        }
    };

    // Fetch utilities
    const FetchManager = {
        /**
         * Safely fetch from a URL via proxy
         * @param {string} url - URL to fetch
         * @returns {Promise<any>} Response data
         * @throws {Error} If proxy fetch fails or returns invalid data
         */
        async fetchWithProxy(url) {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            let response;
            try {
                response = await fetch(proxyUrl);
            } catch (networkError) {
                throw new Error(`Network error fetching from proxy: ${networkError.message}`);
            }

            if (!response.ok) {
                throw new Error(`Proxy service fetch failed with status ${response.status}: ${response.statusText}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                 throw new Error(`Failed to parse JSON response from proxy: ${jsonError.message}`);
            }

            if (!data || typeof data.contents === 'undefined') {
                // Sometimes allorigins returns 200 OK but with an error message in contents
                // or just an empty response if the target fetch failed.
                const detail = data?.status?.error || 'No contents field in proxy response';
                throw new Error(`Proxy service returned invalid data: ${detail}`);
            }
            
            return data.contents;
        },
        
        /**
         * Get GitHub release data
         * @returns {Promise<Object>} GitHub release data
         */
        async getGitHubData() {
            const response = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_REPO}/releases/latest`);
            return await response.json();
        }
    };

    // Utility functions
    const Utils = {
        /**
         * Format a date string for display
         * @param {string} dateStr - ISO date string
         * @param {string} locale - Locale code ('en' or 'de')
         * @returns {string} Formatted date
         */
        formatDate(dateStr, locale) {
            try {
                const date = new Date(dateStr);
                if (isNaN(date)) return dateStr;
                
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const localeCode = locale === 'de' ? 'de-DE' : 'en-US';
                return date.toLocaleDateString(localeCode, options);
            } catch (error) {
                console.warn('Error formatting date:', error);
                return dateStr;
            }
        },
        
        /**
         * Create a shared DOMParser instance
         * @type {DOMParser}
         */
        parser: new DOMParser(),
        
        /**
         * Parse HTML or XML content
         * @param {string} content - HTML or XML content
         * @param {string} mimeType - MIME type for parsing
         * @returns {Document} Parsed document
         */
        parseContent(content, mimeType = 'text/html') {
            return this.parser.parseFromString(content, mimeType);
        },
        
        /**
         * Extract date from a string with various formats
         * @param {string} dateText - Text containing date
         * @returns {string|null} ISO date string or null
         */
        extractDate(dateText) {
            if (!dateText) return null;
            
            // Try different date formats
            const patterns = {
                monthDayYear: /(\w+)\s+(\d+),\s+(\d+)/, // Month DD, YYYY
                dayMonthYear: /(\d+)\s+(\w+)\s+(\d+)/,  // DD Month YYYY
                slashes:      /(\d+)\/(\d+)\/(\d+)/     // MM/DD/YYYY
            };
            
            for (const [formatKey, pattern] of Object.entries(patterns)) {
                const match = dateText.match(pattern);
                if (match) {
                    try {
                        let parsedDate;
                        const [_, part1, part2, part3] = match; 
                        
                        if (formatKey === 'slashes') {
                            // MM/DD/YYYY format
                            parsedDate = new Date(`${part1}/${part2}/${part3}`);
                        } else if (formatKey === 'monthDayYear') {
                            // Month DD, YYYY format - Already in a good format
                            parsedDate = new Date(`${part1} ${part2}, ${part3}`);
                        } else if (formatKey === 'dayMonthYear') {
                            // DD Month YYYY format - Rearrange to Month DD, YYYY
                            // part1=Day, part2=Month, part3=Year
                            parsedDate = new Date(`${part2} ${part1}, ${part3}`); 
                        }
                        
                        if (parsedDate && !isNaN(parsedDate.getTime())) {
                            return parsedDate.toISOString().split('T')[0];
                        }
                    } catch (e) {
                        console.warn(`Error parsing date format ${formatKey} for text: ${dateText}`, e);
                        continue;
                    }
                }
            }
            console.warn(`Could not extract date from text: ${dateText}`);
            return null;
        }
    };

    // Browser data extraction
    const BrowserExtractor = {
        /**
         * Process GitHub release data
         * @param {Object} githubData - GitHub release data
         * @returns {Object} Processed GitHub data
         */
        processGithubData(githubData) {
            const version = githubData.tag_name;
            const releaseDate = githubData.published_at.split('T')[0];
            
            // Find browser-specific assets
            const assets = githubData.assets || [];
            const browserAssets = {};
            
            for (const browserKey of Object.keys(CONFIG.BROWSERS)) {
                browserAssets[browserKey] = assets.find(
                    asset => asset.name.includes(`${browserKey}-mv3`)
                );
            }
            
            return { version, releaseDate, browserAssets };
        },
        
        /**
         * Extract Chrome version from Web Store
         * @param {string} fallbackVersion - Version to use if extraction fails
         * @param {string} fallbackDate - Date to use if extraction fails
         * @returns {Promise<Object>} Chrome version data
         */
        async extractChromeData(fallbackVersion, fallbackDate) {
            let xmlText;
            try {
                xmlText = await FetchManager.fetchWithProxy(CONFIG.BROWSERS.chrome.storeUrl);
            } catch (proxyError) {
                console.warn(`Proxy fetch failed for Chrome: ${proxyError.message}`);
                return { version: fallbackVersion, releaseDate: fallbackDate };
            }
            
            try { // Separate try-catch for parsing
                const xmlDoc = Utils.parseContent(xmlText, "text/xml");
                
                if (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.nodeName !== 'parsererror') {
                    const updateCheck = xmlDoc.querySelector("updatecheck");
                    if (updateCheck && updateCheck.getAttribute("version")) {
                        // Try to get the last updated date from attributes or child nodes
                        let publishDate = null;
                        try {
                            // Check for published date in the XML
                            const publishElement = xmlDoc.querySelector("published") || 
                                                 updateCheck.querySelector("published") ||
                                                 xmlDoc.querySelector("[published]");
                            
                            if (publishElement) {
                                const dateStr = publishElement.textContent || publishElement.getAttribute("date");
                                if (dateStr) {
                                    const date = new Date(dateStr);
                                    if (!isNaN(date)) {
                                        publishDate = date.toISOString().split('T')[0];
                                    }
                                }
                            }
                        } catch (dateError) {
                            console.warn("Couldn't extract Chrome publish date:", dateError);
                        }
                        
                        // Get current date if no date found (not ideal but better than null)
                        if (!publishDate && !fallbackDate) {
                            publishDate = new Date().toISOString().split('T')[0];
                        }
                        
                        return {
                            version: 'v' + updateCheck.getAttribute("version"),
                            releaseDate: publishDate || fallbackDate
                        };
                    }
                }
                console.warn("Couldn't find version attribute in Chrome manifest XML.");
            } catch (parsingError) {
                console.warn("Error parsing Chrome manifest XML:", parsingError);
            }
            
            return { version: fallbackVersion, releaseDate: fallbackDate }; // Fallback if parsing fails
        },
        
        /**
         * Extract Firefox version from Mozilla Add-ons
         * @param {string} fallbackVersion - Version to use if extraction fails
         * @param {string} fallbackDate - Date to use if extraction fails
         * @returns {Promise<Object>} Firefox version data
         */
        async extractFirefoxData(fallbackVersion, fallbackDate) {
            let html;
            try {
                html = await FetchManager.fetchWithProxy(CONFIG.BROWSERS.firefox.storeUrl);
            } catch (proxyError) {
                console.warn(`Proxy fetch failed for Firefox: ${proxyError.message}`);
                return { version: fallbackVersion, releaseDate: fallbackDate };
            }
            
            try { // Separate try-catch for parsing
                const doc = Utils.parseContent(html);
                
                // Extract version
                const versionElement = doc.querySelector('dd[data-test-id="addon-version"]') || 
                                      doc.querySelector('.AddonMoreInfo-version');
                let version = fallbackVersion;
                
                if (versionElement?.innerText) {
                    version = 'v' + versionElement.innerText.trim();
                }
                
                // Extract date
                const updatedElement = doc.querySelector('dd[data-test-id="last-updated"]') || 
                                       doc.querySelector('.AddonMoreInfo-last-updated');
                let extractedDate = fallbackDate;
                
                if (updatedElement?.innerText) {
                    const newDate = Utils.extractDate(updatedElement.innerText.trim());
                    if (newDate) extractedDate = newDate;
                }
                
                return { version, releaseDate: extractedDate };
            } catch (parsingError) {
                console.warn("Error parsing Firefox Add-on page HTML:", parsingError);
                // Fallback happens implicitly by returning the default object below
            }
            
            return { version: fallbackVersion, releaseDate: fallbackDate }; // Fallback if parsing fails
        },
        
        /**
         * Extract Edge version from Microsoft Edge Add-ons
         * @param {string} fallbackVersion - Version to use if extraction fails
         * @param {string} fallbackDate - Date to use if extraction fails
         * @returns {Promise<Object>} Edge version data
         */
        async extractEdgeData(fallbackVersion, fallbackDate) {
            let html;
            try {
                html = await FetchManager.fetchWithProxy(CONFIG.BROWSERS.edge.storeUrl);
            } catch (proxyError) {
                console.warn(`Proxy fetch failed for Edge: ${proxyError.message}`);
                return { version: fallbackVersion, releaseDate: fallbackDate };
            }
            
            try { // Separate try-catch for parsing
                const doc = Utils.parseContent(html);
                
                // Try all possible selectors for version information
                const versionSelectors = [
                    '#versionLabel',
                    '[data-testid="version"]',
                    '.version',
                    '[data-testid="addon-version"]',
                    '.versionInfo',
                    '.AddonInfo-version',
                    'meta[itemprop="version"]',
                    'div[itemprop="version"]'
                ];
                
                // Find the first matching selector with content
                let version = fallbackVersion;
                for (const selector of versionSelectors) {
                    const element = doc.querySelector(selector);
                    if (element) {
                        const content = element.getAttribute('content') || element.innerText;
                        if (content && content.trim()) {
                            // Extract version number from text that might have prefixes like "Version "
                            const versionMatch = content.trim().match(/(\d+\.\d+\.\d+)/);
                            if (versionMatch) {
                                version = 'v' + versionMatch[1];
                                console.log("Edge Add-on Version:", version);
                                break;
                            }
                        }
                    }
                }
                
                // Try all possible selectors for date information
                const dateSelectors = [
                    '#lastUpdatedOnHeader',
                    '[data-testid="last-updated"]',
                    '.last-updated',
                    '[data-testid="addon-last-updated"]',
                    '.updateInfo',
                    '.AddonInfo-last-updated',
                    'meta[itemprop="dateModified"]',
                    'div[itemprop="dateModified"]',
                    'time'
                ];
                
                // Find the first matching selector with content
                let extractedDate = fallbackDate;
                for (const selector of dateSelectors) {
                    const element = doc.querySelector(selector);
                    if (element) {
                        const content = element.getAttribute('content') || 
                                      element.getAttribute('datetime') || 
                                      element.innerText;
                        if (content && content.trim()) {
                            // Remove potential prefix like "Updated "
                            const dateTextOnly = content.trim().replace(/^[a-zA-Z]+\s+/, '');
                            const newDate = Utils.extractDate(dateTextOnly);
                            if (newDate) {
                                extractedDate = newDate;
                                console.log("Edge Add-on Release Date:", extractedDate);
                                break;
                            }
                        }
                    }
                }
                
                return { version, releaseDate: extractedDate };
            } catch (parsingError) {
                console.warn("Error parsing Edge Add-on page HTML:", parsingError);
                // Fallback happens implicitly by returning the default object below
            }
            
            return { version: fallbackVersion, releaseDate: fallbackDate }; // Fallback if parsing fails
        }
    };

    // Browser button generator
    const BrowserButtonGenerator = {
        /**
         * Generate browser button HTML
         * @param {Object} button - Browser button data
         * @returns {string} HTML string
         */
        generateButtonHTML(button) {
            const formattedDate = window.formatDate?.(button.releaseDate, window.currentLang) || 
                                 Utils.formatDate(button.releaseDate, window.currentLang || 'en');
            
            const translations = window.translations?.[window.currentLang || 'en'] || {
                download: {
                    versionFormat: '{version} ({date})',
                    comingSoon: 'Coming Soon'
                }
            };
            
            const statusText = button.enabled ? 
                translations.download.versionFormat
                    .replace('{version}', button.version)
                    .replace('{date}', formattedDate) : 
                translations.download.comingSoon;
            
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
    };

    // Main functionality
    const BrowserButtonManager = {
        /**
         * Fetch browser button data
         * @returns {Promise<Array>} Browser button data
         */
        async fetchData() {
            // Check cache first
            const cachedData = CacheManager.getData();
            if (cachedData) return cachedData;
            
            try {
                // First try to get data from browser stores
                const [chromeData, firefoxData, edgeData] = await Promise.allSettled([
                    BrowserExtractor.extractChromeData('Unknown', null),
                    BrowserExtractor.extractFirefoxData('Unknown', null),
                    BrowserExtractor.extractEdgeData('Unknown', null)
                ]);
                
                // Fetch GitHub data as fallback source
                const githubData = await FetchManager.getGitHubData();
                const { version: githubVersion, releaseDate, browserAssets } = BrowserExtractor.processGithubData(githubData);
                
                // Generate browser buttons configuration
                const browserButtons = [];
                
                for (const [id, config] of Object.entries(CONFIG.BROWSERS)) {
                    let version = githubVersion;
                    let buttonReleaseDate = releaseDate;
                    let enabled = true;
                    let url = config.url;
                    
                    // First try using store data, fall back to GitHub data
                    if (id === 'chrome') {
                        if (chromeData.status === 'fulfilled' && 
                            chromeData.value.version !== 'Unknown' && 
                            chromeData.value.releaseDate) {
                            version = chromeData.value.version;
                            buttonReleaseDate = chromeData.value.releaseDate;
                        }
                    } else if (id === 'firefox') {
                        if (firefoxData.status === 'fulfilled' && 
                            firefoxData.value.version !== 'Unknown' && 
                            firefoxData.value.releaseDate) {
                            version = firefoxData.value.version;
                            buttonReleaseDate = firefoxData.value.releaseDate;
                        }
                        if (browserAssets.firefox?.browser_download_url) {
                            url = browserAssets.firefox.browser_download_url;
                        }
                    } else if (id === 'edge') {
                        if (edgeData.status === 'fulfilled' && 
                            edgeData.value.version !== 'Unknown' && 
                            edgeData.value.releaseDate) {
                            version = edgeData.value.version;
                            buttonReleaseDate = edgeData.value.releaseDate;
                        }
                    } else if (id === 'safari') {
                        url = browserAssets.safari?.browser_download_url || null;
                        enabled = !!browserAssets.safari?.browser_download_url;
                    }
                    
                    // Format dates for display
                    const formattedDate = {
                        en: Utils.formatDate(buttonReleaseDate, 'en'),
                        de: Utils.formatDate(buttonReleaseDate, 'de')
                    };
                    
                    // Add browser button data
                    browserButtons.push({
                        id,
                        name: config.name,
                        logo: config.logo,
                        url,
                        version,
                        releaseDate: buttonReleaseDate,
                        formattedDate,
                        enabled
                    });
                }
                
                // Cache the results
                CacheManager.setData(browserButtons);
                return browserButtons;
                
            } catch (error) {
                console.error('Error fetching browser button data:', error);
                
                // Try to get cached data as fallback
                const cachedData = CacheManager.getData();
                if (cachedData) {
                    console.log('Using cached data as fallback');
                    return cachedData;
                }
                
                // Return default configuration if all else fails
                return this.getDefaultData();
            }
        },
        
        /**
         * Get default browser button data
         * @returns {Array} Default browser button data
         */
        getDefaultData() {
            const buttons = [];
            
            for (const [id, config] of Object.entries(CONFIG.BROWSERS)) {
                const formattedDate = {
                    en: Utils.formatDate(CONFIG.DEFAULT_DATE, 'en'),
                    de: Utils.formatDate(CONFIG.DEFAULT_DATE, 'de')
                };
                
                buttons.push({
                    id,
                    name: config.name,
                    logo: config.logo,
                    url: config.url,
                    version: CONFIG.DEFAULT_VERSION,
                    releaseDate: CONFIG.DEFAULT_DATE,
                    formattedDate,
                    enabled: id !== 'safari'
                });
            }
            
            return buttons;
        },
        
        /**
         * Render browser buttons to container
         * @returns {Promise<void>}
         */
        async render() {
            const container = document.getElementById('browserButtons');
            if (!container) return;
            
            // Show loading state
            container.innerHTML = '<div class="loading">Loading browser options...</div>';
            
            try {
                // Fetch and generate browser button data
                const browserButtons = await this.fetchData();
                
                // Render buttons
                container.innerHTML = browserButtons
                    .map(button => BrowserButtonGenerator.generateButtonHTML(button))
                    .join('');
                    
                // Store for global reference
                window.browserButtons = browserButtons;
            } catch (error) {
                console.error('Error rendering browser buttons:', error);
                container.innerHTML = '<div class="error">Error loading browser options. Please try again later.</div>';
            }
        }
    };

    // Public API
    window.formatDate = Utils.formatDate;
    window.renderBrowserButtons = () => BrowserButtonManager.render();
})(); 