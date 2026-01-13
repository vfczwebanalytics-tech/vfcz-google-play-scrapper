# Google Play Scraper

## Overview
This is a Node.js library that scrapes application data from the Google Play Store. It provides methods to fetch app details, reviews, ratings, search results, and more from Google Play without using any official API.

## Project Type
- **Type**: Node.js Library/Module
- **Language**: JavaScript (ES6 modules)
- **Purpose**: Web scraping and data extraction from Google Play Store

## Current State
The project is fully set up and functional in the Replit environment. A demo script (`demo.js`) has been created to showcase the library's capabilities.

## Recent Changes
- **2025-10-31**: Project imported from GitHub and configured for Replit
  - Created demo script to extract app ratings and reviews
  - Set up workflow to run demonstrations
  - Tested with Vodafone Czech Republic app (`com.vodafone.core.digiopcocz.react`)

## Project Structure
- `index.js` - Main entry point, exports all library methods
- `lib/` - Core library modules:
  - `app.js` - Fetch detailed app information
  - `reviews.js` - Retrieve app reviews
  - `search.js` - Search for apps
  - `list.js` - Get app lists by category/collection
  - `developer.js` - Get apps by developer
  - `similar.js` - Find similar apps
  - `permissions.js` - Get app permissions
  - `datasafety.js` - Get data safety information
  - `categories.js` - List all categories
  - `suggest.js` - Get search suggestions
  - `utils/` - Helper utilities
- `test/` - Test suite (Mocha)
- `demo.js` - Demonstration script
- `index.d.ts` - TypeScript definitions

## Available Methods
1. **app**: Retrieve full details of an application
2. **list**: Get lists of apps from Google Play collections
3. **search**: Search for apps by term
4. **developer**: Get apps by developer
5. **suggest**: Get search query suggestions
6. **reviews**: Fetch app reviews with pagination
7. **similar**: Find similar apps
8. **permissions**: Get app permissions
9. **datasafety**: Get data safety information
10. **categories**: List all available categories

## Dependencies
- **Production**:
  - cheerio (HTML parsing)
  - got (HTTP requests)
  - memoizee (caching)
  - ramda (functional utilities)
  - tough-cookie (cookie handling)
  - debug (debugging)

- **Development**:
  - mocha (testing)
  - chai (assertions)
  - eslint (linting)

## Usage Example
```javascript
import gplay from 'google-play-scraper';

// Get app details
const app = await gplay.app({ appId: 'com.example.app' });

// Get reviews
const reviews = await gplay.reviews({
  appId: 'com.example.app',
  sort: gplay.sort.NEWEST,
  num: 20
});
```

## Workflows
- **demo**: Runs the demonstration script (`node demo.js`)
  - Output: Console
  - Purpose: Showcase library functionality with real data

## Features
- No official API required - uses web scraping
- Supports multiple languages and countries
- Built-in caching with memoization
- Throttling to avoid rate limiting
- TypeScript definitions included
- Comprehensive test coverage

## Notes
- The library makes HTTP requests to Google Play web pages
- Rate limiting may occur with excessive requests
- Some apps may only be available in specific countries/regions
- Use country/language parameters for region-specific apps
