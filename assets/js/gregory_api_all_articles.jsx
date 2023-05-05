import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SingleArticle } from './SingleArticle';
import { ArticleList } from './ArticleList';

function App() {
		return (
			<Router>
				<Routes>
					<Route path="/articles/" element={<ArticleList apiEndpoint="https://api.gregory-ms.com/articles" page_path='/articles' />} />
					<Route path="/articles/page/:page" element={<ArticleList apiEndpoint="https://api.gregory-ms.com/articles" page_path='/articles' />} />
					<Route path="/articles/:articleId/:articleSlug" element={<SingleArticle />} />
					<Route path="/articles/:articleId" element={<SingleArticle />} />
				</Routes>
			</Router>
		);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);