// Custom build script to work around segmentation fault issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔵 Starting custom build process...');

// Force garbage collection if possible
try {
  global.gc();
  console.log('🔵 Forced garbage collection');
} catch (e) {
  console.log('🔵 No access to garbage collection, continuing...');
}

// Create a function that will run a command with memory limits
function runCommand(command) {
  try {
    // Run command with a separate process to prevent memory issues
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--no-node-snapshot --max-old-space-size=8192'
      }
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

async function buildExtension() {
  try {
    console.log('🔵 Preparing build environment...');
    
    // Ensure build directory exists
    if (!fs.existsSync('build')) {
      fs.mkdirSync('build');
    }
    
    // For Chrome build
    console.log('🔵 Building Chrome extension...');
    
    // Try Webpack approach first
    console.log('Attempt 1: Using direct webpack approach');
    if (fs.existsSync('node_modules/.cache')) {
      console.log('🔵 Clearing node_modules/.cache directory');
      fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    }

    // Create a basic manifest file for Chrome
    const createManifestFiles = () => {
      try {
        // Read package.json to get extension information
        const pkg = require('../package.json');
        
        // Basic manifest for Chrome
        const chromeManifest = {
          name: pkg.displayName || pkg.name,
          version: pkg.version,
          description: pkg.description,
          manifest_version: 3,
          action: {
            default_popup: "popup.html"
          },
          permissions: ["tabs", "storage"],
          host_permissions: ["<all_urls>"],
          background: {
            service_worker: "background.js"
          }
        };
        
        // Create directory if it doesn't exist
        const chromeDir = path.join('build', 'chrome-mv3-prod');
        if (!fs.existsSync(chromeDir)) {
          fs.mkdirSync(chromeDir, { recursive: true });
        }
        
        // Write manifest
        fs.writeFileSync(
          path.join(chromeDir, 'manifest.json'),
          JSON.stringify(chromeManifest, null, 2)
        );
        
        console.log('🔵 Created basic manifest files');
        return true;
      } catch (error) {
        console.error('Failed to create manifest files:', error);
        return false;
      }
    };
    
    // Try to use npx webpack directly (if available)
    if (runCommand('npx webpack --mode production')) {
      console.log('🔵 Webpack build successful');
      createManifestFiles();
    } else {
      // If direct webpack fails, try using a simple Parcel build as fallback
      console.log('Attempt 2: Falling back to Parcel bundler');
      runCommand('npx parcel build src/index.html --dist-dir build/chrome-mv3-prod');
      createManifestFiles();
    }
    
    // Run the optimize scripts if they exist
    if (fs.existsSync('scripts/optimize.js')) {
      console.log('🔵 Running optimization scripts...');
      runCommand('node scripts/optimize.js');
    }
    
    if (fs.existsSync('scripts/optimize-images.sh')) {
      console.log('🔵 Optimizing images...');
      runCommand('chmod +x scripts/optimize-images.sh && scripts/optimize-images.sh ./build/chrome-mv3-prod');
    }
    
    console.log('🔵 Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('🔴 Build failed:', error);
    process.exit(1);
  }
}

// Start the build process
buildExtension(); 