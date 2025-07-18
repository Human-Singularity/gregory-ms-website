/**
 * Main Sources app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SourceList from '../components/SourceList';

/**
 * Main App component for sources pages
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Sources list routes */}
        <Route 
          path="/sources/" 
          element={
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="mb-4">
                    <h1 className="text-center mb-3">Our Data Sources</h1>
                    <p className="text-center text-muted lead">
                      Learn about the trusted sources we use to gather Multiple Sclerosis research and clinical trial information
                    </p>
                  </div>
                  <SourceList 
                    type="all" 
                    pagePath="/sources" 
                  />
                </div>
              </div>
            </div>
          } 
        />
        <Route 
          path="/sources/page/:pageNumber" 
          element={
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="mb-4">
                    <h1 className="text-center mb-3">Our Data Sources</h1>
                    <p className="text-center text-muted lead">
                      Learn about the trusted sources we use to gather Multiple Sclerosis research and clinical trial information
                    </p>
                  </div>
                  <SourceList 
                    type="all" 
                    pagePath="/sources" 
                  />
                </div>
              </div>
            </div>
          } 
        />

        {/* Filtered routes */}
        <Route 
          path="/sources/science-papers" 
          element={
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="mb-4">
                    <h1 className="text-center mb-3">Science Paper Sources</h1>
                    <p className="text-center text-muted lead">
                      Academic and research sources for scientific papers and studies
                    </p>
                  </div>
                  <SourceList 
                    type="science paper" 
                    pagePath="/sources/science-papers" 
                  />
                </div>
              </div>
            </div>
          } 
        />
        <Route 
          path="/sources/science-papers/page/:pageNumber" 
          element={
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="mb-4">
                    <h1 className="text-center mb-3">Science Paper Sources</h1>
                    <p className="text-center text-muted lead">
                      Academic and research sources for scientific papers and studies
                    </p>
                  </div>
                  <SourceList 
                    type="science paper" 
                    pagePath="/sources/science-papers" 
                  />
                </div>
              </div>
            </div>
          } 
        />

        <Route 
          path="/sources/trials" 
          element={
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="mb-4">
                    <h1 className="text-center mb-3">Clinical Trial Sources</h1>
                    <p className="text-center text-muted lead">
                      Registries and databases for clinical trials and medical studies
                    </p>
                  </div>
                  <SourceList 
                    type="trials" 
                    pagePath="/sources/trials" 
                  />
                </div>
              </div>
            </div>
          } 
        />
        <Route 
          path="/sources/trials/page/:pageNumber" 
          element={
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="mb-4">
                    <h1 className="text-center mb-3">Clinical Trial Sources</h1>
                    <p className="text-center text-muted lead">
                      Registries and databases for clinical trials and medical studies
                    </p>
                  </div>
                  <SourceList 
                    type="trials" 
                    pagePath="/sources/trials" 
                  />
                </div>
              </div>
            </div>
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
    
    console.log('Sources app initialized');
  } else {
    console.error('Root element not found for sources app');
  }
});

export default App;
