import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { useArticles } from '../hooks/useApi';
import ArticleListItem from './ArticleListItem';
import Pagination from './Pagination';
import BadgeExplanation from './BadgeExplanation';
import { formatDate } from '../utils';

/**
 * ArticleList component - Displays a list of articles with pagination
 * @param {object} props - Component props
 * @param {string} props.type - Type of articles to fetch ('all', 'relevant', 'author', 'category')
 * @param {string} props.pagePath - Base path for pagination links
 * @param {object} props.options - Additional options for the API call
 * @param {boolean} props.displayAsList - Whether to display as a list or grid
 * @returns {JSX.Element} - ArticleList component
 */
export function ArticleList({ 
  type = 'all', 
  pagePath, 
  options = {}, 
  displayAsList = false 
}) {
  // Get page number from URL params
  const { pageNumber } = useParams();
  const initialPage = pageNumber ? parseInt(pageNumber, 10) : 1;
  
  // Use the custom hook to fetch articles
  const { 
    articles, 
    loading, 
    error, 
    pagination: { page, lastPage, setPage }
  } = useArticles(type, { ...options, initialPage });

  // Add logging to see what's being filtered out
  useEffect(() => {
    if (type === 'relevant' && articles.length > 0) {
      console.log(`Showing ${articles.length} articles that are relevant for MS`);
    }
  }, [articles, type]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error loading articles</h4>
        <p>{error.message}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="alert alert-info">
        No articles found.
      </div>
    );
  }

  // Always render as a list view with ArticleListItem components for better readability
  const articlesContent = displayAsList ? (
    <ol start={(page * 10) - 9} className="article-list-numbered" aria-label="Numbered list of articles">
      {articles.map((article) => (
        <li key={article.article_id}>
          <Link 
            to={`/articles/${article.article_id}/`}
            aria-label={`${article.title}, published on ${formatDate(article.published_date)}`}
          >
            {article.title}
          </Link> 
          {' '}<span className="article-date" aria-hidden="true">{formatDate(article.published_date)}</span>
        </li>
      ))}
    </ol>
  ) : (
    <div className="list-group article-list" role="list" aria-label="Article list">
      {articles.map((article) => (
        <ArticleListItem
          key={article.article_id} 
          article={article} 
          showRelevanceIndicators={type === 'relevant'}
        />
      ))}
    </div>
  );

  return (
    <div className="article-list-container" role="region" aria-label={`${type} articles`}>
      <Pagination 
        pagePath={pagePath}
        page={page}
        lastPage={lastPage}
        setPage={setPage}
      />
      
      {articlesContent}
      
      <Pagination 
        pagePath={pagePath}
        page={page}
        lastPage={lastPage}
        setPage={setPage}
      />

      {type === 'relevant' && <BadgeExplanation />}
    </div>
  );
}

ArticleList.propTypes = {
  type: PropTypes.oneOf(['all', 'relevant', 'author', 'category']),
  pagePath: PropTypes.string,
  options: PropTypes.object,
  displayAsList: PropTypes.bool
};

export default ArticleList;
