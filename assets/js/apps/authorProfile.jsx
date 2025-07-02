/**
 * Author Profile app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthorProfile } from '../components/AuthorProfile';

/**
 * App component for author profile pages
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/authors/:authorId" element={<AuthorProfile />} />
        <Route path="/authors/:authorId/" element={<AuthorProfile />} />
        <Route path="/authors/:authorId/page/:pageNumber" element={<AuthorProfile />} />
        <Route path="/articles/author/:authorId" element={<AuthorProfile />} />
        <Route path="/articles/author/:authorId/page/:pageNumber" element={<AuthorProfile />} />
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
    
    console.log('Author profile app initialized');
  } else {
    console.error('Root element not found');
  }
});

export default App;
