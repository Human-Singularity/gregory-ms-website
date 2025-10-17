# Gregory Observatory Widget - Troubleshooting

## Files
- `gregory-observatory-widget.js` - Main widget code
- `gregory-observatory-widget.css` - Widget styles
- `gregory-observatory-widget-example.html` - Full documentation and examples
- `test-widget.html` - Debug/test page with console logging

## Quick Test

Open `test-widget.html` in your browser to see debug output and test the widget locally.

## Common Issues

### 1. Widget shows loading animation but no content

**Symptoms:**
- Loading spinner appears
- Content never loads
- No errors in console

**Possible causes:**
1. **CORS issues** - Check browser console for CORS errors
2. **API not accessible** - Test API directly: `curl https://api.gregory-ms.com/categories/?format=json&category_id=6`
3. **Chart.js not loaded** - Ensure Chart.js CDN is accessible
4. **Container not found** - Verify the container ID matches `containerId` in config

**Debug steps:**
```javascript
// Add these console logs to check state
console.log('Category loaded:', GregoryObservatory.state.category);
console.log('Monthly data:', GregoryObservatory.state.monthlyData);
console.log('Loading state:', GregoryObservatory.state.loading);
```

### 2. Chart not rendering

**Symptoms:**
- Category name and tabs appear
- Chart area is empty or shows "No chart data"

**Possible causes:**
1. Monthly counts API returns null
2. No data in last 12 months
3. Chart.js not loaded

**Fix:**
- Check if API returns monthly_counts: `curl "https://api.gregory-ms.com/categories/?format=json&category_id=6&monthly_counts=true"`
- Verify Chart.js loaded: `console.log(typeof Chart)`

### 3. Articles/Trials tabs empty

**Symptoms:**
- Overview tab works
- Articles or Trials tab shows "No data found"

**Possible causes:**
1. Search API not returning results
2. Category name doesn't match articles/trials

**Fix:**
- Test search API: `curl "https://api.gregory-ms.com/articles/search/?format=json&search=Ocrelizumab&team_id=1"`

## Manual Testing

### Test 1: Basic Load
```html
<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="gregory-observatory-widget.css">
	<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
	<div id="test-widget"></div>
	<script src="gregory-observatory-widget.js"></script>
	<script>
		GregoryObservatory.init({
			containerId: 'test-widget',
			categoryId: 6
		});

		// Check after 3 seconds
		setTimeout(() => {
			console.log('Category:', GregoryObservatory.state.category);
			console.log('Loading:', GregoryObservatory.state.loading);
		}, 3000);
	</script>
</body>
</html>
```

### Test 2: Check API Directly
```bash
# Test category endpoint
curl "https://api.gregory-ms.com/categories/?format=json&category_id=6&include_authors=true"

# Test monthly counts
curl "https://api.gregory-ms.com/categories/?format=json&category_id=6&monthly_counts=true"

# Test articles search
curl "https://api.gregory-ms.com/articles/search/?format=json&search=Ocrelizumab&team_id=1&page_size=5"

# Test trials search
curl "https://api.gregory-ms.com/trials/search/?format=json&search=Ocrelizumab&team_id=1&page_size=5"
```

### Test 3: Browser Console
```javascript
// Check if widget is loaded
console.log(typeof GregoryObservatory); // should be 'object'

// Check if Chart.js is loaded
console.log(typeof Chart); // should be 'function'

// Check current state
console.log(GregoryObservatory.state);

// Manually trigger render
GregoryObservatory.render();
```

## Debugging Checklist

- [ ] Chart.js CDN is accessible
- [ ] Container element exists with correct ID
- [ ] API endpoints return 200 status
- [ ] No CORS errors in console
- [ ] Category ID or slug is valid
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows successful API requests

## Network Issues

If you're testing locally (file://), you may encounter CORS issues. Solutions:

1. **Use a local server:**
   ```bash
   # Python
   python3 -m http.server 8000

   # Node.js
   npx http-server
   ```

2. **Use the example page:**
   - Open `gregory-observatory-widget-example.html` directly from a web server

## Support

If issues persist:
1. Open `test-widget.html` in your browser
2. Copy the console output
3. Report the issue with console logs and network tab screenshots
