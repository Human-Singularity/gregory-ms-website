/**
 * Trials app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrialsList from '../components/TrialsList';

/**
 * App component for trials pages
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Trials list routes */}
        <Route 
          path="/trials/" 
          element={
            <TrialsList 
              type="all" 
              pagePath="/trials" 
            />
          } 
        />
        <Route 
          path="/trials/page/:pageNumber" 
          element={
            <TrialsList 
              type="all" 
              pagePath="/trials" 
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
    
    console.log('Trials app initialized');
  } else {
    console.error('Root element not found');
  }
});

export default App;
