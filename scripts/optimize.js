const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Configuration
const BUILD_DIR = path.join(__dirname, '../build/chrome-mv3-prod');
const JS_PATTERN = `${BUILD_DIR}/**/*.js`;
const HTML_PATTERN = `${BUILD_DIR}/**/*.html`;
const CSS_PATTERN = `${BUILD_DIR}/**/*.css`;

// Helper function to check if terser is available
function isCommandAvailable(command) {
  try {
    execSync(`which ${command}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Process JavaScript files
async function optimizeJsFiles() {
  console.log('Optimizing JavaScript files...');
  const jsFiles = glob.sync(JS_PATTERN);
  
  for (const file of jsFiles) {
    const originalSize = fs.statSync(file).size;
    
    if (isCommandAvailable('terser')) {
      // Use terser if available
      execSync(`npx terser "${file}" --compress --mangle --output "${file}"`);
    } else {
      // Fallback to uglify-js if it exists in node_modules
      execSync(`npx uglify-js "${file}" -o "${file}" --compress --mangle`);
    }
    
    const newSize = fs.statSync(file).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    console.log(`${path.basename(file)}: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);
  }
}

// Process HTML files
async function optimizeHtmlFiles() {
  console.log('Optimizing HTML files...');
  const htmlFiles = glob.sync(HTML_PATTERN);
  
  for (const file of htmlFiles) {
    const originalSize = fs.statSync(file).size;
    
    if (isCommandAvailable('html-minifier')) {
      execSync(`npx html-minifier-terser "${file}" --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true -o "${file}"`);
    }
    
    const newSize = fs.statSync(file).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    console.log(`${path.basename(file)}: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);
  }
}

// Process CSS files
async function optimizeCssFiles() {
  console.log('Optimizing CSS files...');
  const cssFiles = glob.sync(CSS_PATTERN);
  
  for (const file of cssFiles) {
    const originalSize = fs.statSync(file).size;
    
    if (isCommandAvailable('cleancss')) {
      execSync(`npx cleancss -o "${file}" "${file}"`);
    }
    
    const newSize = fs.statSync(file).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    console.log(`${path.basename(file)}: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);
  }
}

// Process Image files using shell script
async function optimizeImageFiles() {
  console.log('Optimizing Image files using shell script...');
  const scriptPath = path.join(__dirname, 'optimize-images.sh');
  
  try {
    execSync(`"${scriptPath}" "${BUILD_DIR}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running image optimization script:', error.message);
  }
}

// Main optimization function
async function optimize() {
  console.log('Starting post-build optimization...');
  
  // Make sure build directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`Build directory not found: ${BUILD_DIR}`);
    process.exit(1);
  }
  
  // Run optimizations
  await optimizeJsFiles();
  await optimizeHtmlFiles();
  await optimizeCssFiles();
  await optimizeImageFiles();
  
  console.log('Post-build optimization completed successfully!');
}

// Run optimization
optimize().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
}); 