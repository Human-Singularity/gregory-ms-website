# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gregory MS is a hybrid web application that helps doctors, researchers, and patients find relevant scientific articles and clinical trials related to Multiple Sclerosis. The project combines:

- **Hugo static site generator** for content and SEO
- **React 18** for interactive components (search, filters, data visualization)
- **Django REST API backend** (in `gregory/` submodule) for data management

The architecture uses Hugo shortcodes to conditionally load React apps into static pages, providing a progressive enhancement approach.

## Development Commands

### Local Development

```bash
# Start Hugo development server (includes hot-reload)
hugo server --disableFastRender

# Alternative: use npm script
npm run dev

# Build React components and Hugo site for production
npm run build

# Build using Docker (production mode)
./build.py --build

# Build with fast mode (skips presskit processing)
./build.py --fast

# Start Hugo server with Docker
./build.py --server
```

### Working with the Database

```bash
# Sync production database to local development
make sync-db

# Run Django migrations (requires Docker containers running)
docker exec gregory python manage.py migrate
```

### Deployment

```bash
# Deploy backend changes (updates submodule, migrations, restarts container)
make deploy-backend

# Deploy frontend changes (updates submodule, rebuilds static assets)
make deploy-frontend

# Full deployment (backend + frontend + dependencies)
make deploy-full

# Check application status on remote server
make status
```

### Docker Operations

```bash
# Start all services (database, Django backend, Node-RED)
docker compose up -d

# View logs
docker logs gregory
docker logs db

# Restart containers
docker restart gregory
docker restart db

# Execute commands in containers
docker exec gregory python manage.py <command>
docker exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

## Architecture

### Directory Structure

- `/assets/js/apps/` - React application entry points (10 apps: articles, search, trials, sources, etc.)
- `/assets/js/components/` - Reusable React components (25+ components)
- `/assets/js/services/` - API service layer for backend communication
- `/layouts/` - Hugo templates (Go templates) for page layouts
- `/layouts/shortcodes/` - Hugo shortcodes for embedding React apps
- `/content/` - Markdown content for static pages
- `/config/` - Hugo configuration files
- `/gregory/` - Django backend submodule (separate git repository)
- `/gregory/django/` - Django apps (api, subscriptions, machine learning models)
- `/public/` - Generated static site output (not committed to git)

### React Integration Pattern

Hugo templates conditionally load React apps based on shortcodes in content:

1. Content uses shortcode: `{{< articles >}}` in markdown
2. Hugo detects shortcode via `.HasShortcode` in `baseof.html`
3. Hugo loads React app via `react-app-loader.html` partial
4. React app bundles with esbuild via Hugo's `js.Build` pipe
5. React renders into `<div id="root"></div>` mount point

### Build Process

**Hugo's esbuild integration:**
- Each React app is bundled as IIFE (Immediately Invoked Function Expression)
- JSX automatic transformation enabled
- Tree-shaking and minification in production mode
- Target: ES2018
- Configuration in `layouts/partials/react-app-loader.html`

**Build script (`build.py`):**
- Uses Docker to run Hugo in consistent environment
- Pre-build tasks: press kit processing, GitHub pulls
- Outputs to configurable `WEBSITE_PATH` (default: `/var/www/gregory-ms.com`)
- Handles file permissions for web server

### API Communication

React apps communicate with Django backend:
- Base URL set via `window.ENV_API_URL` (typically `https://api.gregory-ms.com`)
- API service located in `/assets/js/services/api.js`
- Uses Axios for HTTP requests
- Endpoints: `/articles/search/`, `/trials/search/`, `/authors/search/`, `/sources/`

### Analytics

All interactive elements include Umami Analytics tracking via `data-umami-event` attributes:
- Event naming pattern: `click--{area}-{action}`
- Examples: `click--sources-filter-all`, `click--pagination-next`, `click--search-articles`
- Event properties via `data-umami-event-*` attributes

## Coding Standards

- **Indentation:** Use tabs for indentation (not spaces)
- **Component reuse:** Reuse existing components and patterns where possible
- **React patterns:** Use custom hooks from `/hooks/useApi.js` for data fetching
- **API calls:** Use API service in `/services/api.js` for all backend requests
- **PropTypes:** Add PropTypes validation for all component props

## Design Principles (from copilot-instructions.md)

- **Simplicity Through Reduction:** Begin with complexity, then deliberately remove until reaching the simplest effective solution
- **Material Honesty:** Buttons should feel pressable, cards should feel substantial, animations should reflect real-world physics
- **Obsessive Detail:** Consider every pixel, interaction, and transition
- **Coherent Design Language:** Every element should visually communicate its function and feel part of a unified system
- **Limited Font Selection:** Use no more than 2-3 typefaces; prefer clean sans-serif fonts
- **Intentional Color:** Every color should have a specific purpose; prefer subtle, slightly desaturated colors
- **Generous Negative Space:** Use negative space to focus attention and create calm
- **Immediate Feedback:** Every interaction must provide instantaneous visual feedback (within 100ms)

## Working with the Gregory Submodule

The Django backend lives in a separate repository as a git submodule:

```bash
# Update submodule to latest commit
git submodule update --remote

# Commit submodule changes
git add gregory
git commit -m "update submodules"

# The Makefile handles this automatically in deployment targets
```

**Note:** The `/django` folder at the root is deprecated and only kept for reference. All backend work happens in the `/gregory` submodule.

## Common Tasks

### Adding a New React Component

1. Create component in `/assets/js/components/ComponentName.jsx`
2. Import and use in appropriate app entry point (`/assets/js/apps/`)
3. Build process automatically bundles it via Hugo's esbuild integration
4. No separate build step needed—Hugo handles it during `hugo` or `hugo server`

### Adding a New React App (Page Type)

1. Create app entry point in `/assets/js/apps/newapp.jsx`
2. Create Hugo shortcode in `/layouts/shortcodes/newapp.html`
3. Add conditional loading in `/layouts/_default/baseof.html`:
   ```go
   {{- if .HasShortcode "newapp" }}
   {{ partial "react-app-loader.html" (dict "app" "newapp") }}
   {{- end }}
   ```
4. Use shortcode in content: `{{< newapp >}}`

### Adding Analytics Tracking

Add `data-umami-event` attributes to interactive elements:
```jsx
<button
	data-umami-event="click--my-feature-action"
	data-umami-event-context="additional-info"
>
	Click Me
</button>
```

### Metabase Dashboard Embedding

1. Add dashboard ID to `data/dashboards.json`
2. Use shortcode in content: `{{ metabase-embed dashboard="10" width="1300" height="1250" }}`
3. Run `build.py` to generate signed embed tokens

## Environment Variables

Required environment variables (stored in `.env`):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` - Database credentials
- `DOMAIN_NAME` - Primary domain name
- `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` - Email configuration
- `SECRET_KEY`, `FERNET_SECRET_KEY` - Django secrets
- `WEBSITE_PATH` - Output directory for built site (optional, defaults to `/var/www/gregory-ms.com`)

## Troubleshooting

### React Components Not Loading

1. Check browser console for errors
2. Verify `<div id="root"></div>` exists in page HTML
3. Confirm shortcode is present in content markdown
4. Check `baseof.html` includes conditional loading for the app
5. Verify API endpoints are accessible

### Build Failures

1. Check Docker is running: `docker --version`
2. Verify output directory is writable
3. Check Hugo version supports extended features (Sass, esbuild)
4. Review build logs for specific errors

### Database Sync Issues

1. Ensure `.env` file exists and contains `POSTGRES_USER` and `POSTGRES_DB`
2. Check database container is running: `docker ps | grep db`
3. Verify SSH access to production server: `ssh gregory@House`
