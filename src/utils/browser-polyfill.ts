/**
 * Browser Polyfill Utility
 * 
 * This module provides a unified browser API that works across different browsers.
 * It returns the appropriate browser object (chrome or browser) depending on the environment.
 */

// Define a global browser type for Firefox compatibility
declare global {
  interface Window {
    browser?: typeof chrome;
  }
  const browser: typeof chrome | undefined;
}

/**
 * Get the appropriate browser API object
 * @returns The browser API object (chrome for Chrome/Edge, browser for Firefox)
 */
export function getBrowser(): typeof chrome {
  // Firefox uses the 'browser' namespace
  // Chrome and Edge use the 'chrome' namespace
  // We return the appropriate object based on what's available
  return typeof browser !== 'undefined' ? browser : chrome;
}

// Export the browser object for direct imports
export const browserAPI = getBrowser(); 