# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2023-07-15
### Added
- Enhanced initial loading experience with a more user-friendly spinner
- Better state management for settings operations

### Changed
- Improved the settings save mechanism to prevent "double-click" issue
- Refactored state updates for more responsive UI feedback
- Optimized save button behavior for a better user experience

### Fixed
- Fixed issue requiring users to click "Save Changes" button twice
- Improved saving state management to provide immediate UI feedback
- Enhanced error handling for failed save operations
- Fixed localStorage access errors in service worker environment by adding proper environment detection
- Improved i18n initialization to handle environments where localStorage is not available
- Added safety checks before accessing browser storage APIs

## [1.0.3] - 2023-06-20
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

## [1.0.2] - 2023-05-10
### Added
- Cross-browser compatibility for Firefox and Edge
- Chrome Web Store automated deployment pipeline
- Workflow for manual and automated publishing to the Chrome Web Store

### Changed
- Updated build scripts for multi-browser support
- Improved optimization process to handle multiple browser targets
- Enhanced version management for Chrome Web Store requirements

### Fixed
- Console log leakage in production builds
- Browser-specific API compatibility issues

## [1.0.1] - 2023-04-15
### Added
- Production mode console log suppression
- GitHub Actions workflow for automated builds and releases
- New release management scripts for patch, minor, and major versions
- Image optimization tools and scripts

### Changed
- Refactored background service worker for better performance
- Improved URL detection and ticket management

### Fixed
- URL pattern validation and error handling
- Settings synchronization across browser instances

## [1.0.0] - 2023-04-01
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

[Unreleased]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Khalil-Charfi/jira-url-wizard/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Khalil-Charfi/jira-url-wizard/releases/tag/v1.0.0 