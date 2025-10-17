# Gregory Observatory Widget

An embeddable JavaScript widget that displays Multiple Sclerosis research data from the Gregory MS API. This widget provides a simplified, standalone version of the observatory feature that can be embedded in any website without requiring React or a build process.

## Features

- **Pure JavaScript** - No build process, no frameworks required
- **Single Category View** - Focuses on one treatment/therapy at a time
- **Three Interactive Tabs**:
  - **Overview** - Monthly chart showing research activity trends
  - **Articles** - Latest scientific articles with ML relevance scores
  - **Clinical Trials** - Active and completed clinical trials
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Chart Visualization** - Uses Chart.js for interactive data visualization
- **Lazy Loading** - Data fetched only when needed
- **Pagination Support** - Load more articles and trials on demand

## Files

- `gregory-observatory-widget.js` - Main widget JavaScript (35KB)
- `gregory-observatory-widget.css` - Widget styles (8KB)
- `gregory-observatory-widget-example.html` - Complete usage example and documentation

## Quick Start

### 1. Include Required Files

Add these to your HTML `<head>`:

```html
<!-- Widget CSS -->
<link rel="stylesheet" href="https://gregory-ms.com/js/gregory-observatory-widget.css">

<!-- Chart.js (required dependency) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- Widget JavaScript -->
<script src="https://gregory-ms.com/js/gregory-observatory-widget.js"></script>
```

### 2. Add Container Element

```html
<div id="gregory-observatory-widget"></div>
```

### 3. Initialize Widget

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    GregoryObservatory.init({
      containerId: 'gregory-observatory-widget',
      categoryId: 6, // Ocrelizumab
      apiUrl: 'https://api.gregory-ms.com',
      teamId: 1,
      subjectId: 1
    });
  });
</script>
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `containerId` | string | Yes | - | ID of the HTML element where widget renders |
| `categoryId` | number | Yes* | - | Category ID to display (e.g., 6 for Ocrelizumab) |
| `categorySlug` | string | Yes* | - | Category slug (e.g., 'ocrelizumab') |
| `apiUrl` | string | No | 'https://api.gregory-ms.com' | Gregory MS API base URL |
| `teamId` | number | No | 1 | Team ID for data filtering |
| `subjectId` | number | No | 1 | Subject ID (1 = Multiple Sclerosis) |

*Either `categoryId` or `categorySlug` is required (not both)

## All Available MS Treatment Categories

Complete list of all 49 categories available in the Gregory MS Observatory:

| Treatment | ID | Slug | Tags |
|-----------|----|----- |------|
| Alemtuzumab | 1 | alemtuzumab | immune reconstitution, DMTs |
| Remyelination | 2 | bexarotene | remyelination |
| Cladribine | 3 | cladribine | immune reconstitution, DMTs |
| Metformin | 4 | metformin | remyelination, investigational |
| Natalizumab | 5 | natalizumab | DMTs, integrin |
| Ocrelizumab | 6 | ocrelizumab | DMTs, anti-CD20 |
| Edaravone | 7 | edaravone | neuroprotection, investigational |
| Treg Therapy | 8 | treg-cell-therapy | cell therapy, immunotherapy, investigational |
| HSCT | 9 | hematopoietic-stem-cell-transplant | cell therapy, stem cells, immune reconstitution |
| Fingolimod | 10 | fingolimod | DMTs, S1P |
| Maresin-1 | 12 | maresin-1 | neuroinflammation, investigational |
| Amiselimod | 22 | amiselimod | investigational |
| Kynurenine | 27 | kynurenine | neuroinflammation, investigational |
| Rituximab | 28 | rituximab | DMTs, anti-CD20, off-label |
| Ofatumumab | 29 | ofatumumab | DMTs, anti-CD20 |
| aHSCT | 30 | ahsct | immune reconstitution, DMTs |
| Frexalimab | 31 | frexalimab | investigational, immunotherapy |
| Foralumab | 32 | foralumab | investigational |
| BTK Inhibitors | 34 | btk-inhibitors | BTKi, investigational |
| Siponimod | 35 | siponimod | DMTs, S1P |
| Dimethyl Fumarate | 36 | tecfidera | DMTs, fumarate |
| Glatiramer Acetate | 37 | glatiramer-acetate | DMTs |
| Mitoxantrone | 38 | mitoxantrone | DMTs, chemo |
| Ublituximab | 39 | ublituximab | DMTs, anti-CD20 |
| Ozanimod | 40 | ozanimod | DMTs, S1P |
| Ponesimod | 41 | ponesimod | DMTs, S1P |
| Diroximel Fumarate | 42 | vumerity | DMTs, fumarate |
| Monomethyl Fumarate | 43 | monomethyl-fumarate | DMTs, fumarate |
| Naltrexone | 46 | naltrexone | symptomatic |
| CNM-Au8 | 47 | cnm-au8 | neuroprotection, remyelination, investigational |
| Biotin | 48 | biotin | remyelination |
| CAR-T | 49 | car-t | cell therapy, investigational |
| BTK Inhibitors | 50 | bruton-tyrosine-kinase | BTKi, investigational |
| bFGF | 51 | bfgf | remyelination, investigational |
| Guanabenz | 52 | guanabenz | remyelination, investigational |
| BIIB091 | 53 | biib091 | investigational |
| BMS-986368 | 57 | bms-986368 | investigational |
| AA147 | 59 | aa147 | investigational |
| Biomaterials & Scaffolds | 66 | biomaterials-and-scaffolds | investigational |
| Clemastine Fumarate | 71 | clemastine-fumarate | remyelination |
| Bazedoxifene | 72 | bazedoxifene | remyelination, investigational |
| Miconazole | 73 | miconazole | remyelination, investigational |
| Clobetasol | 75 | clobetasol | remyelination, investigational |
| Tamoxifen | 76 | tamoxifen | remyelination, investigational |
| Methotrexate | 77 | methotrexate | remyelination, neuroprotection, investigational |
| Domperidone | 79 | domperidone | remyelination, investigational |
| Ebselen | 81 | ebselen | neuroprotection, investigational |
| Anti-Nogo Receptor Therapies | 87 | anti-nogo-receptor-therapies | investigational |
| Induced Pluripotent Stem Cells | 89 | induced-pluripotent-stem-cells | remyelination, myelin repair, regenerative medicine |
| Dihydroartemisinin | 91 | dihydroartemisinin | investigational |
| Donepezil | 94 | donepezil | neuroprotection, investigational, cognition |

### Tag Categories

- **DMTs** (Disease-Modifying Therapies): Approved treatments that modify disease progression
- **Investigational**: Treatments currently under research or clinical trials
- **Remyelination**: Therapies aimed at myelin repair
- **Neuroprotection**: Treatments focused on protecting nerve cells
- **Cell Therapy**: Stem cell and immune cell therapies
- **Anti-CD20**: B-cell depleting therapies
- **S1P**: Sphingosine-1-phosphate receptor modulators
- **BTKi**: Bruton's tyrosine kinase inhibitors
- **Fumarate**: Fumaric acid ester derivatives

## Usage Examples

### Example 1: Using Category ID

```javascript
GregoryObservatory.init({
  containerId: 'my-widget',
  categoryId: 6  // Ocrelizumab
});
```

### Example 2: Using Category Slug

```javascript
GregoryObservatory.init({
  containerId: 'my-widget',
  categorySlug: 'natalizumab'
});
```

### Example 3: Custom Container and API

```javascript
GregoryObservatory.init({
  containerId: 'research-tracker',
  categoryId: 9,  // Stem Cell Therapy
  apiUrl: 'https://api.gregory-ms.com',
  teamId: 1,
  subjectId: 1
});
```

## Chart Data

The widget displays multiple data series in the overview chart:

- **Clinical Trials (Green Bars)** - Monthly count of clinical trials
- **Articles (Blue Line)** - Cumulative total of all articles
- **LightGBM (Orange Dashed)** - ML model predictions (cumulative)
- **LSTM (Red Dashed)** - ML model predictions (cumulative)
- **PubMed BERT (Purple Dashed)** - ML model predictions (cumulative)

The chart shows the last 12 months of data by default.

## Customization

### Custom Colors

To customize chart colors, modify the `chartColors` in the config:

```javascript
GregoryObservatory.config.chartColors = {
  articles: '#007bff',
  trials: '#28a745',
  lgbm: '#fd7e14',
  lstm: '#dc3545',
  pubmedBert: '#6f42c1'
};
```

### Custom Styles

Override CSS classes in your stylesheet:

```css
/* Custom widget container */
.gregory-observatory-widget {
  max-width: 100%;
  box-shadow: none;
}

/* Custom title color */
.gregory-category-title {
  color: #333;
}

/* Custom tab colors */
.gregory-tab.active {
  color: #28a745;
  border-bottom-color: #28a745;
}
```

## API Endpoints Used

The widget uses the following Gregory MS API endpoints:

1. **Categories Endpoint**: `/categories/`
   - Fetches category details including name, description, and author statistics
   - Parameters: `category_id` or `category_slug`, `include_authors`, `team_id`, `subject_id`

2. **Monthly Counts Endpoint**: `/categories/`
   - Fetches monthly article and trial counts for chart
   - Parameters: `category_id`, `monthly_counts=true`

3. **Articles Search Endpoint**: `/articles/search/`
   - Fetches articles related to the category
   - Parameters: `search` (category name), `team_id`, `subject_id`, `page`

4. **Trials Search Endpoint**: `/trials/search/`
   - Fetches clinical trials related to the category
   - Parameters: `search` (category name), `team_id`, `subject_id`, `page`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

*Note: Internet Explorer is not supported*

## Dependencies

- **Chart.js 4.4.0+** - Required for chart visualization
- Modern browser with ES6 support

## Limitations

- **Single Instance**: Currently supports only one widget per page (use unique `containerId` for each)
- **Category Required**: Must specify either `categoryId` or `categorySlug`
- **No Authentication**: Uses public API endpoints only
- **Rate Limiting**: Subject to Gregory MS API rate limits

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify container element ID matches `containerId` in config
3. Ensure Chart.js is loaded before widget script
4. Confirm `categoryId` or `categorySlug` is valid

### Chart Not Rendering

1. Verify Chart.js CDN is accessible
2. Check if category has monthly data available
3. Look for console errors related to Chart.js

### No Data Showing

1. Confirm API is accessible: `https://api.gregory-ms.com/categories/?format=json`
2. Check network tab for failed API requests
3. Verify category ID/slug exists in API

### CORS Issues

The Gregory MS API should have CORS enabled for all origins. If you encounter CORS issues, contact the API administrator.

## Performance

- **Initial Load**: ~50KB (JS + CSS) + Chart.js (~200KB)
- **API Requests**:
  - 1 request on load (category data)
  - 1 request for chart data
  - 1 request per tab switch (articles/trials)
  - Additional requests for pagination

## Security

- All API requests use HTTPS
- No user authentication required
- XSS protection via proper HTML escaping
- External links open in new tab with `rel="noopener noreferrer"`

## Future Enhancements

Potential improvements for future versions:

- [ ] Multiple widget instances on same page
- [ ] Date range selector for chart
- [ ] Export data (CSV, JSON)
- [ ] Print-friendly view
- [ ] Dark mode support
- [ ] Custom color themes
- [ ] Accessibility improvements (ARIA labels)
- [ ] Keyboard navigation
- [ ] Search/filter within articles/trials
- [ ] Embedding via iframe

## Contributing

This widget is part of the Gregory MS project. To contribute:

1. Fork the repository: https://github.com/brunoamaral/gregory-ai
2. Make your changes
3. Submit a pull request

## License

Part of the Gregory MS project. See main repository for license details.

## Support

- **Website**: https://gregory-ms.com
- **API Documentation**: https://api.gregory-ms.com
- **GitHub Issues**: https://github.com/brunoamaral/gregory-ai/issues
- **Email**: Contact through Gregory MS website

## Credits

- **Gregory MS Team** - Development and maintenance
- **Chart.js** - Chart visualization library
- **Gregory MS API** - Data source

## Changelog

### Version 1.0.0 (2025-10-17)

- Initial release
- Single category view with three tabs
- Chart visualization with Chart.js
- Articles and trials lists with pagination
- Responsive design
- Pure JavaScript implementation
