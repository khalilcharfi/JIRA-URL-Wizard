# JIRA URL Wizard

<div align="center">
  <img src="assets/app.webp" alt="JIRA URL Wizard Logo" width="200"/>
</div>

JIRA URL Wizard is a powerful browser extension designed to streamline your JIRA workflow by making it easier to manage and access JIRA tickets across different environments. Whether you're working with development, staging, or production environments, this tool helps you quickly generate and switch between JIRA ticket URLs with just a few clicks.

## Features

### 🚀 Environment Management
- Configure and save multiple JIRA environments (dev, staging, production)
- Quick switching between different JIRA instances
- Custom environment naming and organization

### 🎯 Ticket Management
- Generate JIRA ticket URLs instantly for any environment
- Save frequently accessed tickets for quick access
- Drag-and-drop interface for organizing your tickets
- Support for different JIRA ticket formats and patterns

### 📱 Mobile Integration
- Generate QR codes for tickets to quickly access them on mobile devices
- Share tickets easily with team members
- Mobile-friendly interface for on-the-go access

### 🎨 User Experience
- Clean, modern interface built with React and TailwindCSS
- Intuitive drag-and-drop functionality using DND Kit
- Responsive design that works across all devices
- Customizable settings to match your workflow

### 🔒 Security & Privacy
- Local storage of your JIRA configurations
- No data sent to external servers
- Secure handling of your JIRA credentials

## Installation

### Chrome Web Store
[Coming soon]

### Manual Installation
1. Clone this repository
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
- Node.js
- pnpm

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

### Building
To build the extension for production:
```bash
pnpm build
```

### Packaging
To create a distributable package:
```bash
pnpm package
```

## Project Structure

```
├── src/                # Source code
├── assets/            # Static assets
├── build/             # Build output
├── scripts/           # Build and optimization scripts
├── docs/              # Documentation
└── resources/         # Additional resources
```

## Technologies Used

- React 18
- TypeScript
- Plasmo Framework
- TailwindCSS
- DND Kit (Drag and Drop)
- Lucide React (Icons)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Khalil Charfi

## Support

For support, please open an issue in the GitHub repository.
