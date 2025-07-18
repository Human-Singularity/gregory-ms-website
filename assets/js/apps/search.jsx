/**
 * Search app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import SearchApp from '../components/SearchApp';

// Define global variables for browser environment
window.ENV_API_URL = window.ENV_API_URL || 'https://api.gregory-ms.com';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('search-root');
  
  if (rootElement) {
    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <SearchApp />
      </React.StrictMode>
    );
    
    console.log('Search app initialized');
  } else {
    console.error('Search root element not found');
  }
});

export default SearchApp;
