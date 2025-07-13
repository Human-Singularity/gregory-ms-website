# Gregory MS Website React Components

This document provides an overview of the React component architecture in the Gregory MS website.

## Overview

The Gregory MS website uses React for interactive components that display data from the Gregory MS API. The React components are organized in a modular, maintainable structure.

## Directory Structure

```
assets/js/
├── apps/                # App entry points for different pages
│   ├── articles.jsx     # Articles app entry point
│   ├── authorProfile.jsx # Author profile app entry point
│   ├── category.jsx     # Category app entry point
│   ├── observatory.jsx  # Observatory app entry point
│   ├── relevant.jsx     # Relevant articles app entry point
│   └── trials.jsx       # Trials app entry point
├── components/          # Reusable React components
│   ├── ArticleList.jsx  # Displays a list of articles
│   ├── ArticleSnippet.jsx # Displays a preview of an article
│   ├── AuthorProfile.jsx # Displays author information
│   ├── CategoryCard.jsx # Displays a category card
│   ├── CategoryDetail.jsx # Displays detailed category information
│   ├── DownloadButton.jsx # Button to download data as CSV
│   ├── Observatory.jsx  # Main observatory component
│   ├── Pagination.jsx   # Pagination component
│   ├── SingleArticle.jsx # Displays a single article
│   ├── Trial.jsx        # Displays a single trial
│   └── TrialsList.jsx   # Displays a list of trials
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
│   └── useApi.js        # Hooks for API data fetching
├── services/            # Service modules
│   └── api.js           # API service for data fetching
└── utils.js             # Utility functions
```

## Build System

The React components are built using esbuild. The build process is configured in `jsx-build.js`.

### Development

To start development with hot-reloading of React components:

```bash
npm run dev:watch
```

This will start the esbuild watcher and Hugo server together.

### Production Build

To build for production:

```bash
npm run build
```

This will build the React components and then build the Hugo site.

## Adding a New Component

1. Create the component in the `assets/js/components/` directory
2. Import and use the component in the appropriate app entry point
3. Run the build process to generate the JavaScript files

## Adding a New Page Type

1. Create a new app entry point in `assets/js/apps/`
2. Update the `jsx-build.js` file to include the new entry point
3. Update the `react-app.html` partial to include the new app
4. Create or update the Hugo layout to use the new app

## Best Practices

1. Use the custom hooks in `hooks/useApi.js` for data fetching
2. Use the API service in `services/api.js` for all API calls
3. Keep components small and focused on a single responsibility
4. Use PropTypes for component props validation
5. Follow the established patterns for error handling and loading states

## Component Dependencies

- React 18.x
- React Router 6.x
- Axios for API requests
- Recharts for data visualization

## Troubleshooting

If components are not loading correctly:

1. Check the browser console for errors
2. Verify that the root element exists in the HTML
3. Check that the correct app is being loaded for the page
4. Verify that the API endpoints are correct
5. Check that the Hugo layout includes the correct React app
