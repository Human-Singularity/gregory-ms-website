/**
 * Main Articles app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import SingleArticle from '../components/SingleArticle';
import AuthorProfile from '../components/AuthorProfile';

/**
 * Main App component for articles pages
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Article routes */}
        <Route path="/articles/:articleId/:articleSlug" element={<SingleArticle />} />
        <Route path="/articles/:articleId" element={<SingleArticle />} />
        
        {/* Author routes */}
        <Route path="/articles/author/:authorId" element={<AuthorProfile />} />
        <Route path="/articles/author/:authorId/page/:pageNumber" element={<AuthorProfile />} />
        
        {/* Articles list routes */}
        <Route 
          path="/articles/" 
          element={
            <ArticleList 
              type="all" 
              pagePath="/articles" 
            />
          } 
        />
        <Route 
          path="/articles/page/:pageNumber" 
          element={
            <ArticleList 
              type="all" 
              pagePath="/articles" 
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
    
    console.log('Articles app initialized');
  } else {
    console.error('Root element not found');
  }
});

export default App;
