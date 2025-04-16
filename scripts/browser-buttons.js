// Function to fetch browser button data
async function fetchBrowserButtonData() {
    try {
        const response = await fetch('https://api.github.com/repos/khalilcharfi/JIRA-URL-Wizard/releases/latest');
        const data = await response.json();
        
        // Extract version and release date from the GitHub release
        const version = data.tag_name;
        const releaseDate = data.published_at.split('T')[0]; // Format: YYYY-MM-DD
        
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
        
        // Find browser-specific assets
        const assets = data.assets || [];
        const browserAssets = {
            chrome: assets.find(asset => asset.name.includes('chrome-mv3')),
            firefox: assets.find(asset => asset.name.includes('firefox-mv3')),
            edge: assets.find(asset => asset.name.includes('edge-mv3')),
            safari: assets.find(asset => asset.name.includes('safari-mv3'))
        };

        // Generate browser buttons configuration
        return [
            {
                id: 'chrome',
                name: 'Chrome',
                logo: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
                url: `https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak`,
                version: version,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: true
            },
            {
                id: 'firefox',
                name: 'Firefox',
                logo: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
                url: browserAssets.firefox?.browser_download_url || null,
                version: version,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: !!browserAssets.firefox?.browser_download_url
            },
            {
                id: 'edge',
                name: 'Edge',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
                url: browserAssets.edge?.browser_download_url || null,
                version: version,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: !!browserAssets.edge?.browser_download_url
            },
            {
                id: 'safari',
                name: 'Safari',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg',
                url: browserAssets.safari?.browser_download_url || null,
                version: version,
                releaseDate: releaseDate,
                formattedDate: formattedDate,
                enabled: !!browserAssets.safari?.browser_download_url
            }
        ];
    } catch (error) {
        console.error('Error fetching browser button data:', error);
        // Format fallback date
        const fallbackDate = new Date('2025-04-16');
        const formattedDate = {
            en: fallbackDate.toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
            }),
            de: fallbackDate.toLocaleDateString('de-DE', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
            })
        };
        
        // Return default configuration if fetch fails
        return [
            {
                id: 'chrome',
                name: 'Chrome',
                logo: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
                url: 'https://chromewebstore.google.com/detail/jira-url-wizard/opfnbeleknbmdnemmnlhigmmmkghncak',
                version: 'v1.0.4',
                releaseDate: '2025-04-16',
                formattedDate: formattedDate,
                enabled: true
            },
            {
                id: 'firefox',
                name: 'Firefox',
                logo: 'https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg',
                url: null,
                version: 'v1.0.4',
                releaseDate: '2025-04-16',
                formattedDate: formattedDate,
                enabled: false
            },
            {
                id: 'edge',
                name: 'Edge',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
                url: null,
                version: 'v1.0.4',
                releaseDate: '2025-04-16',
                formattedDate: formattedDate,
                enabled: false
            },
            {
                id: 'safari',
                name: 'Safari',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg',
                url: null,
                version: 'v1.0.4',
                releaseDate: '2025-04-16',
                formattedDate: formattedDate,
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