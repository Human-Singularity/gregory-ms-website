/**
 * Observatory app entry point
 * Displays a list of categories and their details
 */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import Observatory from '../components/Observatory';

// Define global variables for browser environment
window.ENV_API_URL = window.ENV_API_URL || 'https://api.gregory-ms.com';

/**
 * App component for observatory
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Observatory />} />
        <Route path="/observatory" element={<Observatory />} />
        <Route path="/observatory/category/:categorySlug" element={<Observatory />} />
      </Routes>
    </Router>
  );
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('Observatory app initialized');
  } else {
    console.error('Observatory root element not found');
  }
});

export default App;
