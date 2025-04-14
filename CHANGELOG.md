# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Support for automated GitHub workflow dispatch with custom publishing options
- CHANGELOG.md file for tracking version history
- Helper script `changelog:unreleased` to remind developers to update changelog
- Enhanced version management for Chrome Web Store requirements
- Improved console log management in production builds

### Changed
- Updated build scripts for better cross-browser compatibility
- Enhanced optimization process for multiple browser targets
- Improved error handling in Chrome Web Store publishing process

### Fixed
- GitHub workflow linter error with boolean input type
- Console log leakage in production builds
- Browser-specific API compatibility issues

## [1.0.1] - 2025-04-09
### Added
- Cross-browser compatibility for Firefox and Edge
- Chrome Web Store automated deployment pipeline
- Workflow for manual and automated publishing to the Chrome Web Store
- Production mode console log suppression
- GitHub Actions workflow for automated builds and releases
- New release management scripts for patch, minor, and major versions
- Image optimization tools and scripts
- Enhanced build optimization process

### Changed
- Updated build scripts for multi-browser support
- Improved optimization process to handle multiple browser targets
- Enhanced version management for Chrome Web Store requirements
- Refactored background service worker for better performance
- Improved URL detection and ticket management

### Fixed
- Console log leakage in production builds
- Browser-specific API compatibility issues
- URL pattern validation and error handling
- Settings synchronization across browser instances

## [1.0.0] - 2025-04-01
### Added
- Initial release
- Environment management for JIRA instances (dev, staging, production)
- Ticket management with URL generation
- Mobile integration with QR code generation
- Modern UI with React and TailwindCSS
- Drag-and-drop functionality for organizing tickets
- Light/dark mode support
- Local storage for JIRA configurations
- Build optimization scripts
- Documentation

[Unreleased]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Khalil-Charfi/jira-url-wizard/releases/tag/v1.0.0 