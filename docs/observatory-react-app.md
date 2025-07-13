# Observatory React App

The Observatory React App is a comprehensive interface for exploring Multiple Sclerosis research data organized by categories.

## Features

- **Category Overview**: Display a grid of research categories with descriptions
- **Category Details**: Detailed view for each category including:
  - Monthly overview chart showing articles and clinical trials over time
  - Separate tabs for Articles and Clinical Trials
  - Lazy loading of data (only loads when tabs are clicked)
  - Download functionality for CSV exports

## URL Structure

- `/observatory/` - Main page showing all categories
- `/observatory/category/{category_slug}/` - Individual category detail page

## Configuration

The Observatory app supports configurable settings:

```javascript
// Default configuration
const DEFAULT_CONFIG = {
  API_URL: window.ENV_API_URL || 'https://api.gregory-ms.com',
  TEAM_ID: window.ENV_TEAM_ID || 1,
  SUBJECT_ID: window.ENV_SUBJECT_ID || 1
};
```

You can override these by setting global variables:
- `window.ENV_API_URL`
- `window.ENV_TEAM_ID`
- `window.ENV_SUBJECT_ID`

## Categories

The Observatory app includes 42 real MS treatment categories from the Gregory database:

### Major Treatment Categories:
- **Approved Therapies**: Alemtuzumab, Aubagio, Fingolimod, Natalizumab, Ocrelizumab, Tecfidera, and more
- **Emerging Treatments**: BTK inhibitors, CAR-T therapy, Stem cell treatments (aHSCT)
- **Remyelination Research**: Clemastine fumarate, Opicinumab, rHIgM22
- **Neuroprotection**: Metformin, Simvastatin, Lipoic acid derivatives
- **Novel Approaches**: PIPE-307, CNM-Au8, Maresin-1

### Categories Include:
1. **aHSCT** - Autologous hematopoietic stem cell transplantation
2. **Alemtuzumab** - Lemtrada therapy research
3. **Aubagio** - Teriflunomide studies
4. **Bafiertam** - Monomethyl fumarate research
5. **Bexarotene** - RXR agonist studies
6. **Biotin** - High-dose biotin research
7. **Bruton Tyrosine Kinase** - BTK inhibitors
8. **CAR-T** - CAR-T cell therapy
9. **Cladribine** - Mavenclad research
10. **Clemastine fumarate** - Remyelination studies
...and 32 more treatment categories

All categories include both research articles and clinical trials data.

## API Endpoints Used

- `GET /teams/{team_id}/categories/{category_slug}/monthly-counts/` - Monthly statistics
- `GET /teams/{team_id}/articles/category/{category_slug}/` - Articles by category
- `GET /teams/{team_id}/trials/category/{category_slug}/` - Clinical trials by category

## Components

### Observatory.jsx
Main component that handles routing and category selection.

### CategoryCard.jsx
Displays individual category cards with hover effects.

### CategoryDetail.jsx
Shows detailed information about a category with tabs for different data views.

## Styling

The Observatory uses Bootstrap 4 classes along with custom CSS:

- `.observatory-card` - Card hover effects
- `.hover-shadow` - Shadow on hover
- `.observatory-tabs` - Custom tab styling
- `.observatory-chart` - Chart container styling

## Usage

1. Add the Observatory app to your Hugo page:
   ```html
   <div id="root"></div>
   {{ partial "react-app.html" (dict "app" "observatory") }}
   ```

2. Include the app parameter in your page front matter:
   ```yaml
   app: observatory
   ```

3. The app will automatically initialize and load the category data.

## Performance

- Data is loaded lazily (on-demand when tabs are clicked)
- Categories are hardcoded to reduce API calls
- Chart data is cached per category
- Bootstrap tabs provide smooth transitions

## Browser Support

The Observatory app supports all modern browsers that support ES2018+ features.
