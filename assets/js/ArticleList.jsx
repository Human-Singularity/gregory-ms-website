import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArticleSnippet } from "./ArticleSnippet";
import { Pagination } from "./Pagination";
import { formatDate } from "./utils";

export function ArticleList({ apiEndpoint, page_path, displayAsList }) {
  const [articles, setArticles] = useState([]);
  const [last_page, setLastPage] = useState(null);

  let { pageNumber } = useParams();
  pageNumber = pageNumber ? parseInt(pageNumber, 10) : 1;

  const [page, setPage] = useState(pageNumber);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`${apiEndpoint}?format=json&page=${page}`);
      setArticles(response.data.results);
      setLastPage(Math.ceil(response.data.count / 10));
    }
    fetchData();
  }, [apiEndpoint, page]);

  const articleContent = displayAsList ? (
    <ol start={page * 10 - 9}>
      {articles.map((article) => (
        <li key={article.article_id}>
          <Link to={`/articles/${article.article_id}/`}>{article.title}</Link> {formatDate(article.published_date)}
        </li>
      ))}
    </ol>
  ) : (
    articles.map((article) => (
      <ArticleSnippet key={article.article_id} article={article} />
    ))
  );

  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <Pagination page={page} setPage={setPage} last_page={last_page} page_path={page_path} />
        </div>
        {articleContent}
        <div className="col-md-12">
          <Pagination page={page} setPage={setPage} last_page={last_page} page_path={page_path} />
        </div>
      </div>
    </div>
  );
}