import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArticleSnippet } from "./ArticleSnippet";
import { Pagination } from "./Pagination";

export function ArticleList({ apiEndpoint, page_path }) {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [last_page, setLastPage] = useState(null);

	useEffect(() => {
		async function fetchData() {
			const response = await axios.get(`${apiEndpoint}?format=json&page=${page}`);
			setArticles(response.data.results);
			setLastPage(Math.ceil(response.data.count / 10));
		}
		fetchData();
	}, [apiEndpoint, page]);

	return (
		<div>
			<p>
				<a className="btn btn-info btn-round btn-lg font-weight-bold mx-auto" data-umami-event="click--relevant-articles-on-articles-page" href="/relevant/">Filter by relevant articles <i className="text-muted text-info fas fa-arrow-right" style={{ transform: ".4s", boxShadow: ".4s" }}></i></a>
			</p>
			<div className="row">
				<div className="col-md-12">
					<Pagination page={page} setPage={setPage} last_page={last_page} page_path={page_path} />
				</div>
				{articles.map((article) => (
					<ArticleSnippet key={article.article_id} article={article} />
				))}
				<div className="col-md-12">
					<Pagination page={page} setPage={setPage} last_page={last_page} page_path={page_path} />
				</div>
			</div>
		</div>
	);
}
