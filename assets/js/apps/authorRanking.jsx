/**
 * Author Ranking app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthorRanking } from '../components/AuthorRanking';

/**
 * App component for author ranking page
 */
function App() {
  // No router needed since this is a single page app
  // Just render the AuthorRanking component directly
  return <AuthorRanking />;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('AuthorRanking app loading...');
  
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } else {
    console.error('Root element not found. Make sure there is a div with id="root" in your HTML.');
  }
});

export default App;
