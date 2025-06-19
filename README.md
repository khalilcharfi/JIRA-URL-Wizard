# JIRA URL Wizard

<div align="center">
  <img src="assets/icon.png" alt="JIRA URL Wizard Logo" width="200"/>
  <h3>Current Version: 1.0.5</h3>
</div>

JIRA URL Wizard is a powerful browser extension designed to streamline your JIRA workflow by making it easier to manage and access JIRA tickets across different environments. Whether you're working with development, staging, or production environments, this tool helps you quickly generate and switch between JIRA ticket URLs with just a few clicks.

## Download

Get the latest version (1.0.5) directly from GitHub:

- [Chrome Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/jira-url-wizard-chrome-v1.0.5.zip)
- [Firefox Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/jira-url-wizard-firefox-v1.0.5.zip)
- [Edge Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/jira-url-wizard-edge-v1.0.5.zip)
- [Safari Extension](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/download/v1.0.5/safari-mv3-prod.zip)

Or visit the [latest release page](https://github.com/khalilcharfi/JIRA-URL-Wizard/releases/tag/v1.0.5).

## Features

### 🚀 Environment Management
- Configure and save multiple JIRA environments (dev, staging, production)
- Quick switching between different JIRA instances
- Custom environment naming and organization
- Environment-specific settings and configurations

### 🎯 Ticket Management
- Generate JIRA ticket URLs instantly for any environment
- Save frequently accessed tickets for quick access
- Drag-and-drop interface for organizing your tickets
- Support for different JIRA ticket formats and patterns
- Bulk ticket URL generation
- Copy to clipboard functionality

### 📱 Mobile Integration
- Generate QR codes for tickets to quickly access them on mobile devices
- Share tickets easily with team members
- Mobile-friendly interface for on-the-go access
- QR code customization options

### 🎨 User Experience
- Clean, modern interface built with React and TailwindCSS
- Intuitive drag-and-drop functionality using DND Kit
- Responsive design that works across all devices
- Customizable settings to match your workflow
- Dark/Light mode support
- Keyboard shortcuts for power users

### 🔒 Security & Privacy
- Local storage of your JIRA configurations
- No data sent to external servers
- Secure handling of your JIRA credentials
- Regular security updates and patches

## Installation

### Chrome Web Store
[Coming soon]

### Manual Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/khalilcharfi/JIRA-URL-Wizard.git
   cd JIRA-URL-Wizard
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the extension:
   ```bash
   pnpm build
   ```
4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-prod` directory

## Development

### Prerequisites
- Node.js (v16 or higher)
- pnpm (v8 or higher)
- Chrome browser (for testing)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/khalilcharfi/JIRA-URL-Wizard.git
   cd JIRA-URL-Wizard
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open Chrome and load the development build from `build/chrome-mv3-dev`

### Building
To build the extension for production:
```bash
pnpm build
```
This will:
- Compile TypeScript files
- Bundle assets
- Optimize images
- Generate production-ready files in `build/chrome-mv3-prod`

### Packaging
To create a distributable package:
```bash
pnpm package
```
This will create a ZIP file ready for distribution.

## Scripts

### 🛠️ Build Optimization
The project includes several optimization scripts to ensure optimal performance:

#### `optimize.js`
- Minifies JavaScript, HTML, and CSS files
- Removes unused code
- Optimizes bundle size
- Automatically runs after build

Usage:
```bash
node scripts/optimize.js
```

#### `optimize-images.sh`
- Optimizes all images in the build directory
- Supports multiple image formats (PNG, JPEG, SVG, WebP)
- Reduces file size while maintaining quality

Usage:
```bash
./scripts/optimize-images.sh ./build/chrome-mv3-prod
```

#### `install-image-tools.sh`
- Installs required image optimization tools:
  - pngquant/optipng for PNG optimization
  - jpegoptim for JPEG optimization
  - svgo for SVG optimization
  - gifsicle for GIF optimization
  - webp tools for WebP optimization

Usage:
```bash
./scripts/install-image-tools.sh
```

## Project Structure

```
├── src/                # Source code
│   ├── popup/         # Popup UI components
│   ├── options/       # Options page components
│   ├── background/    # Background service worker
│   └── utils/         # Utility functions
├── assets/            # Static assets (images, icons)
├── build/             # Build output
├── scripts/           # Build and optimization scripts
├── docs/              # Documentation
└── resources/         # Additional resources
```

## Technologies Used

- React 18 - UI framework
- TypeScript - Type-safe development
- Plasmo Framework - Browser extension framework
- TailwindCSS - Utility-first CSS framework
- DND Kit - Drag and drop functionality
- Lucide React - Icon library

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Khalil Charfi

## Support

For support, please:
1. Check the [documentation](docs/)
2. Search existing issues
3. Open a new issue if needed

## Roadmap

- [ ] Chrome Web Store release
- [x] Firefox extension support
- [x] Edge extension support
- [x] Safari extension support
- [ ] Advanced ticket filtering
- [ ] Team collaboration features
- [ ] Analytics dashboard

## Cross-Browser Compatibility

This extension is designed to work on:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari (macOS and iOS)

The codebase uses Plasmo's cross-browser build system and a custom browser polyfill to ensure consistent functionality across all supported browsers.

### Latest Release (v1.0.5)

The latest release (v1.0.5) includes:
- Removed console logs from core files for cleaner production builds
- Improved error handling with silent error management
- Fixed TypeScript linting issues across the project
- Enhanced codebase maintainability by removing debug statements

Check the [CHANGELOG.md](CHANGELOG.md) for a complete version history.

## Building for Different Browsers

To build the extension for all supported browsers at once:

```bash
pnpm build:all
```

To build for specific browsers:

```bash
# Chrome (default)
pnpm build

# Firefox
pnpm build:firefox

# Edge
pnpm build:edge

# Safari
pnpm build:safari
```

## Packaging

To package the extension for distribution:

```bash
# Package for all browsers
pnpm package:all

# Package with version in filename
pnpm build-and-package:all
```

## Safari Support

Safari requires an additional conversion step to create an Xcode project:

```bash
# Build and convert for Safari
pnpm build-and-package:safari
```

This requires:
- macOS
- Xcode 12 or later
- Xcode Command Line Tools

The conversion process creates an Xcode project in `./build/safari-project`. To submit to the App Store:
1. Open the generated Xcode project
2. Configure signing certificates
3. Build and export the package

For a complete workflow including Safari:

```bash
pnpm build-and-package:all-with-safari
```

## Development

To run the development server:

```bash
pnpm dev
```

## Production Builds

### Console Log Management

For production builds, console logs are automatically disabled through two mechanisms:

1. **Source Code Transformation**: During the build process, all `console.log`, `console.warn`, `console.info`, and `console.debug` calls are replaced with a conditional logger that only outputs messages in development mode. This is handled by the `replace-console` script.

2. **Minification Stripping**: The build optimization process also strips any remaining console statements using terser's `drop_console` option, ensuring that no debugging information is exposed in production.

To run a development build with console logs enabled:
```bash
pnpm dev
```

To run a production build with console logs disabled:
```bash
pnpm build
```

## CI/CD and Automated Builds

This project uses GitHub Actions to automatically build and package the extension for all supported browsers.

### Automated Build Workflow

The GitHub workflow automatically:

1. Builds the extension for Chrome, Firefox, and Edge
2. Optimizes all assets and code
3. Packages the extensions into distributable ZIP files
4. Creates artifacts for each browser build
5. Generates GitHub releases for tagged versions

### Triggering Builds

Builds are automatically triggered on:
- Pushes to `master` or `main` branches
- Pull requests to `master` or `main` branches
- Manual triggers via GitHub Actions interface
- Creating a version tag (e.g., `v1.0.5`)

### Versioned Releases

To create a versioned release:

#### Option 1: Using the release script (Recommended)
```bash
# Create a patch release (incrementing the last version number)
pnpm release

# Create a minor release (incrementing the middle version number)
pnpm version minor && git push && git push --tags

# Create a major release (incrementing the first version number)
pnpm version major && git push && git push --tags
```

The release script automatically:
1. Increments the version in `package.json`
2. Updates all version references in the extension
3. Creates a git commit and tag
4. Pushes the changes and tag to GitHub
5. Triggers the CI/CD workflow to build and publish the release

> 📝 **Note:** Remember to update the [CHANGELOG.md](CHANGELOG.md) with your changes before creating a new release.

#### Option 2: Manual release process
1. Update the version in `package.json`
2. Run `pnpm replace-version` to update version references
3. Commit the changes
4. Create and push a new tag:
   ```bash
   git tag v1.0.5
   git push origin v1.0.5
   ```

Either method will trigger a build and automatically create a GitHub release with the built extension packages.

### Build Artifacts

Each build produces the following artifacts:

- `jira-url-wizard-chrome-v{version}`: Chrome extension build
- `jira-url-wizard-firefox-v{version}`: Firefox extension build
- `jira-url-wizard-edge-v{version}`: Edge extension build
- `jira-url-wizard-packages-v{version}`: ZIP packages for all browsers

These artifacts can be downloaded from the GitHub Actions workflow run page.

### Automated Chrome Web Store Deployment

This project uses the [Chrome Extension Upload Action](https://github.com/marketplace/actions/chrome-extension-upload-action) to automatically deploy to the Chrome Web Store when a new version tag is created. The deployment process:

1. Takes the built Chrome extension package
2. Uploads it to the Chrome Web Store
3. Publishes the new version (or submits it for review)

#### Deployment Options

You can trigger Chrome Web Store deployment through:

1. **Version Tags**: Create a tag (e.g., `v1.0.5`) to trigger a full build and deployment pipeline.

2. **Manual Workflow Dispatch**: Go to GitHub Actions → Build and Package Extension → Run workflow, where you can choose:
   - **Publishing Target**: Default (all users) or TrustedTesters
   - **Publish Extension**: Yes/No (allows upload-only without publishing)

This gives you flexibility to:
- Test with trusted testers before a public release
- Upload without publishing to prepare for a coordinated release
- Fully automate the deployment process

#### Important Notes About Chrome Store Publishing

- **Version Requirements**: The Chrome Web Store requires each new upload to have a higher version number in the manifest.json file. Our build process automatically syncs the version from package.json to manifest.json.

- **Review Process**: All extensions published to the Chrome Web Store undergo a review process which takes time (usually about an hour). If you attempt to publish while a review is in progress, the publish will fail.

- **Deployment Frequency**: To avoid review conflicts, it's recommended to:
  - Only deploy from tags, not from frequently updated branches
  - Allow sufficient time between deployments for reviews to complete

#### Setting Up Chrome Web Store Deployment

To enable automated deployment to the Chrome Web Store, you need to set up the following GitHub repository secrets:

1. `CHROME_EXTENSION_ID`: Your extension ID from the Chrome Web Store
2. `CHROME_CLIENT_ID`: OAuth client ID for Chrome Web Store API
3. `CHROME_CLIENT_SECRET`: OAuth client secret for Chrome Web Store API
4. `CHROME_REFRESH_TOKEN`: OAuth refresh token for Chrome Web Store API

Instructions for obtaining these credentials:

1. **Extension ID**:
   - If you already have your extension on the store, this is the ID in the Web Store URL
   - For new extensions, you'll need to create a draft listing first to get an ID

2. **OAuth Credentials**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or use an existing one
   - Enable the Chrome Web Store API
   - Create OAuth credentials (client ID and secret)
   - Set up OAuth consent screen with necessary scopes

3. **Refresh Token**:
   - Use the Chrome Web Store Upload CLI tool to generate a refresh token:
   ```bash
   npx chrome-webstore-upload-cli@2 init
   ```

Once these secrets are configured in your GitHub repository (Settings → Secrets → Actions), the automated deployment will work when you create a new version tag.

#### Manual Chrome Web Store Publishing

For testing or when you need more control over the publishing process, you can manually publish to the Chrome Web Store using the provided script:

1. Set up your environment variables in a `.env` file in the project root:
   ```
   CHROME_EXTENSION_ID=your_extension_id
   CHROME_CLIENT_ID=your_client_id
   CHROME_CLIENT_SECRET=your_client_secret
   CHROME_REFRESH_TOKEN=your_refresh_token
   ```

## Environment Variables

The extension supports several environment variables to control features and behavior:

### Feature Flags
- `PLASMO_PUBLIC_SHOW_MARKDOWN_EDITOR`: Set to `"true"` to enable the markdown editor component in the options page (default: `"false"`)
- `PLASMO_PUBLIC_SHOW_ADVANCED_SETTINGS`: Set to `"true"` to show advanced settings sections (default: `"false"`)

### Default Values
- `PLASMO_PUBLIC_DEFAULT_THEME`: Default theme setting (`"light"`, `"dark"`, or `"system"`)
- `PLASMO_PUBLIC_DEFAULT_URLS`: JSON string of default URL configurations
- `PLASMO_PUBLIC_DEFAULT_JIRA_PATTERNS`: JSON string of default JIRA patterns
- `PLASMO_PUBLIC_DEFAULT_SAMPLE_TICKET_ID`: Default sample ticket ID for testing
- `PLASMO_PUBLIC_TOAST_TIMEOUT_MS`: Timeout for toast notifications in milliseconds (default: `3000`)

Example `.env` file:
```
PLASMO_PUBLIC_DEFAULT_THEME=light
PLASMO_PUBLIC_DEFAULT_URLS=''
PLASMO_PUBLIC_DEFAULT_JIRA_PATTERNS=''
PLASMO_PUBLIC_DEFAULT_SAMPLE_TICKET_ID=123
PLASMO_PUBLIC_TOAST_TIMEOUT_MS=3000
PLASMO_PUBLIC_SHOW_ADVANCED_SETTINGS=true
PLASMO_PUBLIC_SHOW_MARKDOWN_EDITOR=true
```

2. Build and package the extension:
   ```bash
   pnpm build && pnpm package
   ```

3. Choose a publishing option:
   ```bash
   # Standard publish to public Web Store
   pnpm publish:chrome
   
   # Publish to trusted testers only (for testing)
   pnpm publish:chrome:test
   
   # Upload only (no publishing, for later review)
   pnpm publish:chrome:upload-only
   ```

These scripts provide:
- Version validation to ensure you meet Chrome Web Store requirements
- Helpful error messages for common issues like in-progress reviews
- Options for different publishing targets and strategies

#### Handling Chrome Web Store Review Process

The Chrome Web Store has a review process that can take time. Here are some strategies to manage this:

1. **Testing with Trusted Testers**: Use `pnpm publish:chrome:test` to publish to trusted testers only, which typically has a faster/less strict review process.

2. **Upload Only**: Use `pnpm publish:chrome:upload-only` to upload your extension without publishing, then manually publish it later through the Web Store dashboard when ready.

3. **Version Planning**: Plan version updates with sufficient time between them to allow for review completion.

# Code Maintenance

## Dead Code Elimination

This project uses ts-prune to identify and remove unused exports. Dead code increases complexity and can lead to confusion and maintenance challenges. Here's how to use it:

1. Run the following command to find unused exports:

```bash
npm run find-dead-code
```

2. Review the list of unused exports and determine if they can be safely removed
3. After removing code, run TypeScript again (`npm run build` or `npm run dev`) to find any broken references
4. Repeat until convergence

### Benefits of Dead Code Elimination

- Reduces bundle size
- Simplifies maintenance by reducing code complexity
- Makes the codebase easier to understand for new contributors
- Helps identify obsolete features or unused database tables

### Tips for Keeping Your Codebase Clean

- Run `find-dead-code` periodically, especially before releases
- Consider not exporting functions or components unless they're truly needed externally
- Use TypeScript's `--noUnusedLocals` flag to identify unused local variables (already enabled in this project)
- When removing code, consider using git history to understand why it was added before removing it

For more information, see the [ts-prune documentation](https://github.com/nadeesha/ts-prune).
