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
