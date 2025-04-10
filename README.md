# JIRA URL Wizard

A browser extension that helps you quickly generate and manage JIRA ticket URLs across different environments.

## Features

- Generate JIRA ticket URLs for different environments
- Manage and switch between multiple JIRA environments
- Quick access to frequently used tickets
- User-friendly interface with drag-and-drop functionality
- QR code generation for easy mobile access

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
