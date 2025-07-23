# Gregory MS Website React Components

This document provides an overview of the React component architecture in the Gregory MS website.

## Overview

The Gregory MS website uses React for interactive components that display data from the Gregory MS API. The React components are organized in a modular, maintainable structure.

## Analytics Tracking

The website uses Umami Analytics for privacy-focused analytics. All interactive elements include `data-umami-event` attributes for comprehensive user behavior tracking.

### Event Naming Convention

Events follow a semantic naming pattern: `click--{area}-{action}`

Examples:
- `click--sources-filter-all` - User clicks "All Sources" filter
- `click--pagination-next` - User clicks next page
- `click--download-csv` - User downloads CSV data
- `click--search-articles` - User searches for articles

### Tracked Events

#### Navigation Events
- Top navigation menu clicks: `click--topnav-{menu-item}`
- Footer navigation clicks: `click--footer-nav-{menu-item}`
- Mobile menu toggle: `click--mobile-menu-toggle`

#### Search Events
- Search tab switches: `click--search-tab-{articles|trials|authors}`
- Search submissions: `click--search-{articles|trials|authors}`
- Search result interactions

#### Content Interaction Events
- External source links: `click--source-external-link`
- Trial external links: `click--trial-external-link`
- Author ORCID links: `click--author-orcid`
- Category card selections: `click--category-card`

#### UI Interaction Events
- Filter changes: `click--sources-filter-{type}`
- Pagination: `click--pagination-{previous|next|page}`
- Downloads: `click--download-csv`

#### Form Events
- Newsletter subscriptions: `click--subscribe-newsletter`
- Donation button: `click--donate-button`

### Event Data Properties

Many events include additional context using `data-umami-event-*` attributes:
- `data-umami-event-source` - Source name for external links
- `data-umami-event-page` - Page number for pagination
- `data-umami-event-term` - Search terms
- `data-umami-event-filename` - Downloaded file name

## Directory Structure

```
assets/js/
├── apps/                # App entry points for different pages
│   ├── articles.jsx     # Articles app entry point
│   ├── authorProfile.jsx # Author profile app entry point
│   ├── category.jsx     # Category app entry point
│   ├── observatory.jsx  # Observatory app entry point
│   ├── relevant.jsx     # Relevant articles app entry point
│   ├── sources.jsx      # Sources app entry point
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
│   ├── Source.jsx       # Displays a single source
│   ├── SourceList.jsx   # Displays a list of sources
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

## Sources App

The Sources app (`/sources/`) displays information about the data sources Gregory MS uses to collect Multiple Sclerosis research and clinical trials.

### Components

- **SourceList**: Main component that displays a list of sources with filtering capabilities
- **Source**: Individual source card component

### Features

- **Filter by Type**: Users can filter sources by type (all, science papers, clinical trials)
- **Responsive Design**: Optimized for mobile and desktop viewing
- **External Links**: Sources with URLs link to their respective websites
- **Detailed Information**: Shows source names, descriptions, and purposes

### API Integration

The Sources app uses the `useSources` hook to fetch data from the `/sources/` endpoint. The API returns:

```json
{
  "count": 19,
  "next": "...",
  "previous": null,
  "results": [
    {
      "source_id": 1,
      "source_for": "science paper",
      "name": "APTA",
      "description": null,
      "link": "https://...",
      "subject_id": 1,
      "team_id": 1
    }
  ]
}
```

### Usage

The Sources app is activated by the `{{< sources >}}` shortcode in Hugo templates.
