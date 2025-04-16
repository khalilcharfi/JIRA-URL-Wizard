const fs = require('fs');
const path = require('path');

// Read package.json to get the version
const packageJson = require('../package.json');
const version = packageJson.version;

// Define browser targets and their corresponding directories
const targets = [
  { name: 'chrome', path: './build/chrome-mv3-prod.zip' },
  { name: 'firefox', path: './build/firefox-mv3-prod.zip' },
  { name: 'edge', path: './build/edge-mv3-prod.zip' },
  { name: 'safari', path: './build/safari-mv3-prod.zip' }
];

console.log(`\nRenaming packaged files with version ${version}...\n`);

// Rename each target file with version
targets.forEach(target => {
  const sourcePath = target.path;
  
  // Skip if the file doesn't exist
  if (!fs.existsSync(sourcePath)) {
    console.log(`${target.name} package not found at ${sourcePath}. Skipping.`);
    return;
  }
  
  // Create new filename with version
  const fileExt = path.extname(sourcePath);
  const dirName = path.dirname(sourcePath);
  const baseName = path.basename(sourcePath, fileExt);
  const newBaseName = baseName.replace('-prod', `-v${version}`);
  const destPath = path.join(dirName, `${newBaseName}${fileExt}`);
  
  // Rename the file
  fs.renameSync(sourcePath, destPath);
  console.log(`Renamed ${target.name} package: ${path.basename(sourcePath)} → ${path.basename(destPath)}`);
});

console.log('\nPackage renaming complete!'); 