import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, generateArticleURL } from '../utils';

/**
 * ArticleSnippet component - Displays a preview of an article
 * @param {object} props - Component props
 * @param {object} props.article - Article data
 * @param {boolean} props.showRelevanceIndicators - Whether to show relevance indicators
 * @returns {JSX.Element} - ArticleSnippet component
 */
export function ArticleSnippet({ article, showRelevanceIndicators = false }) {
  if (!article) return null;

  const date = new Date(article.published_date);
  const articleUrl = generateArticleURL(article);
  
  return (
    <div className='col-md-6'>
      <div className="card card-plain card-blog">
        <div className="card-body">
          {formatDate(date)} 
          <h4 className="card-title">
            <Link to={articleUrl}>{article.title}</Link>
          </h4>
          <p className="card-description">
            {article.takeaways}
          </p>
          <p className="author text-wrap">
            <span className="badge badge-info text-white font-weight-normal">
              {article.container_title}
            </span>
            
            {showRelevanceIndicators && (
              <>
                {article.ml_prediction_gnb && (
                  <span className="ml-1 text-white badge badge-success font-weight-normal">
                    AI prediction
                  </span>
                )}
                {article.relevant && (
                  <span className="ml-1 text-white badge badge-primary font-weight-normal">
                    manual selection
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

ArticleSnippet.propTypes = {
  article: PropTypes.shape({
    article_id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    published_date: PropTypes.string.isRequired,
    takeaways: PropTypes.string,
    container_title: PropTypes.string,
    ml_prediction_gnb: PropTypes.bool,
    relevant: PropTypes.bool
  }).isRequired,
  showRelevanceIndicators: PropTypes.bool
};

export default ArticleSnippet;
