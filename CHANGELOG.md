# Changelog

All notable changes to the PixWeather Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2023-03-27

### Added
- Swipeable widgets component for improved user experience
- Weather impact news integration
- UV forecast visualization
- 7-day weather forecast with interactive display
- Pollen report feature for allergen information
- Crowdsourced weather data collection and display
- Geolocation detection for automatic location identification
- AI-powered weather insights and article summarization
- Progressive Web App (PWA) support with offline capabilities

### Changed
- Reduced location card size by 15% for better UI proportions
- Improved touch handling for mobile devices
- Enhanced scrolling behavior on news and AI pages
- Optimized weather data fetching with throttling to prevent rate limiting
- Refined UI with backdrop blur effects and responsive design
- Improved error handling for weather API responses

### Fixed
- Resolved "Cannot read properties of undefined (reading 'icon')" error in SwipeableWidgets
- Fixed conditional rendering to prevent accessing properties of undefined widgets
- Added safety checks for widget rendering when no data is available
- Corrected prop name inconsistencies (activeWidgetIndex vs activeIndex)
- Fixed hook errors by ensuring hooks are called unconditionally
- Resolved scrolling issues on news and AI pages

### Optimized
- Reduced API calls with improved caching strategy
- Implemented debouncing for scroll events
- Added loading states with animations for better user feedback
- Enhanced image loading with proper error handling

## [1.0.0] - 2023-03-15

### Added
- Initial release of PixWeather Explorer
- Location-based weather information display
- Image gallery with Pixabay API integration
- Basic weather forecast functionality
- Location search capability
- Responsive design for all device sizes
- Dark mode support
- Animated UI elements with Framer Motion
- Weather condition animations and visualizations

### Changed
- Upgraded to Next.js 14 for improved performance
- Implemented Tailwind CSS for styling
- Added shadcn/ui components for consistent UI

### Fixed
- Initial loading state handling
- Mobile responsiveness issues
- Image loading fallbacks

