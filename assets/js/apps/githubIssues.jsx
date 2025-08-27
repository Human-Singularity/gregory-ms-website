/**
 * GitHub Issues app entry point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import GitHubIssues from '../components/GitHubIssues.jsx';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	const rootElement = document.getElementById('github-issues-app');
	
	if (rootElement) {
		// Get configuration from data attributes
		const repository = rootElement.dataset.repository || 'gregory-ms-website';
		const owner = rootElement.dataset.owner || 'Human-Singularity';
		const label = rootElement.dataset.label || null;
		const state = rootElement.dataset.state || 'open';
		
		// Create root and render app
		const root = ReactDOM.createRoot(rootElement);
		root.render(
			<React.StrictMode>
				<GitHubIssues 
					repository={repository}
					owner={owner}
					label={label}
					state={state}
				/>
			</React.StrictMode>
		);
		
		console.log('GitHub Issues app initialized');
	} else {
		console.error('GitHub Issues root element not found');
	}
});

export default GitHubIssues;
