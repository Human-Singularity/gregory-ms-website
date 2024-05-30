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
					<Route path="/articles/" element={<ArticleList apiEndpoint="https://api.gregory-ms.com/teams/1/articles" page_path='/articles' />} />
					<Route path="/articles/page/:pageNumber" element={<ArticleList apiEndpoint="https://api.gregory-ms.com/teams/1/articles" page_path='/articles' />} />
					<Route path="/articles/:articleId/:articleSlug" element={<SingleArticle />} />
					<Route path="/articles/:articleId" element={<SingleArticle />} />
					<Route path="/articles/author/:authorId" element={AuthorProfile} />
				</Routes>
			</Router>
		);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);