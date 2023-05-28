import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ArticleSnippet } from "./ArticleSnippet";
import { Pagination } from "./Pagination";

export function ArticleList({ apiEndpoint, page_path }) {
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

  return (
    <div>
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