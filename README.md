# JIRA URL Wizard

<div align="center">
  <img src="assets/icon.png" alt="JIRA URL Wizard Logo" width="200"/>
</div>

JIRA URL Wizard is a powerful browser extension designed to streamline your JIRA workflow by making it easier to manage and access JIRA tickets across different environments. Whether you're working with development, staging, or production environments, this tool helps you quickly generate and switch between JIRA ticket URLs with just a few clicks.

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
   git clone https://github.com/yourusername/jira-url-wizard.git
   cd jira-url-wizard
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
   git clone https://github.com/yourusername/jira-url-wizard.git
   cd jira-url-wizard
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
- [ ] Firefox extension support
- [ ] Edge extension support
- [ ] Advanced ticket filtering
- [ ] Team collaboration features
- [ ] Analytics dashboard

## Browser Compatibility

The JIRA URL Wizard extension is now compatible with the following browsers:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge

### Building for Different Browsers

To build the extension for different browsers, use the following commands:

```bash
# Build for Chrome (default)
npm run build

# Build for Firefox
npm run build:firefox

# Build for Edge
npm run build:edge

# Build for all browsers
npm run build:all
```

### Packaging for Different Browsers

To create distribution packages for different browsers:

```bash
# Package for Chrome (default)
npm run package

# Package for Firefox
npm run package:firefox

# Package for Edge
npm run package:edge

# Package for all browsers
npm run package:all
```

The packages will be available in the `build` directory.

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
- Creating a version tag (e.g., `v1.0.2`)

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
   git tag v1.0.2
   git push origin v1.0.2
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

1. **Version Tags**: Create a tag (e.g., `v1.0.2`) to trigger a full build and deployment pipeline.

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
