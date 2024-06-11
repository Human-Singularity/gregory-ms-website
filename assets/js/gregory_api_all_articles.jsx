import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SingleArticle } from './SingleArticle';
import { ArticleList } from './ArticleList';
import { AuthorProfile } from './AuthorProfile';

function App() {
		return (
			<Router>
				<Routes>
					<Route path="/articles/:articleId/:articleSlug" element={<SingleArticle />} />
					<Route path="/articles/:articleId" element={<SingleArticle />} />
					<Route path="/articles/author/:authorId" element={AuthorProfile} />
					<Route path="/articles/" element={<ArticleList apiEndpoint="https://api.gregory-ms.com/teams/1/articles" page_path='/articles' />} />
					<Route path="/articles/page/:pageNumber" element={<ArticleList apiEndpoint="https://api.gregory-ms.com/teams/1/articles" page_path='/articles' />} />
				</Routes>
			</Router>
		);
}

// Create a root if it doesn't exist yet
const rootElement = document.getElementById("root");
if (!rootElement._reactRootContainer) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
} else {
    // If the root already exists, just render the App
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}