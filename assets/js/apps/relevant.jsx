/**
 * Relevant Articles app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import SingleArticle from '../components/SingleArticle';

/**
 * App component for relevant articles pages
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Single article routes */}
        <Route path="/articles/:articleId/:articleSlug" element={<SingleArticle />} />
        <Route path="/articles/:articleId" element={<SingleArticle />} />
        
        {/* Relevant articles list routes */}
        <Route 
          path="/relevant/" 
          element={
            <ArticleList 
              type="relevant" 
              pagePath="/relevant" 
            />
          } 
        />
        <Route 
          path="/relevant/page/:pageNumber" 
          element={
            <ArticleList 
              type="relevant" 
              pagePath="/relevant" 
            />
          } 
        />
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
    
    console.log('Relevant articles app initialized');
  } else {
    console.error('Root element not found');
  }
});

export default App;
