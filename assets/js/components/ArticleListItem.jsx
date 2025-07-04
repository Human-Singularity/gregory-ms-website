import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, generateArticleURL, generateAuthorURL } from '../utils';
import { stripHtml, truncateText } from '../utils/searchUtils';
import { 
  getMostRecentPredictions, 
  generatePredictionBadgeClassName, 
  formatAlgorithmName, 
  formatPredictionScore,
  generateBadgeTitle
} from '../utils/badge-utils';

/**
 * ArticleListItem component - Displays an article in a list format
 * @param {object} props - Component props
 * @param {object} props.article - Article data
 * @param {boolean} props.showRelevanceIndicators - Whether to show relevance indicators
 * @param {boolean} props.isSearchResult - Whether this is being displayed in search results
 * @returns {JSX.Element} - ArticleListItem component
 */
export function ArticleListItem({ 
  article, 
  showRelevanceIndicators = false,
  isSearchResult = false 
}) {
  if (!article) return null;

  // Get the most recent ML predictions for each algorithm
  const recentPredictions = article.ml_predictions ? getMostRecentPredictions(article) : [];
  const articleUrl = generateArticleURL(article);
  
  // Determine if we should use a Link or an anchor tag
  const LinkComponent = isSearchResult ? 'a' : Link;
  const linkProps = isSearchResult 
    ? { href: `/articles/${article.article_id}/`, target: "_blank", rel: "noopener noreferrer" }
    : { to: articleUrl };

  return (
    <div className="list-group-item list-group-item-action flex-column align-items-start" role="article" aria-labelledby={`article-title-${article.article_id}`}>
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">
          <LinkComponent {...linkProps} id={`article-title-${article.article_id}`}>
            {article.title}
          </LinkComponent>
        </h5>
        <small className="text-muted publication-date" aria-label={`Published on ${formatDate(article.published_date)}`}>
          {formatDate(article.published_date)}
        </small>
      </div>
      
      <div className="article-metadata mb-2">
        {/* Journal/Source */}
        {article.container_title && (
          <span className="badge badge-journal mr-2" aria-label={`Published in: ${article.container_title}`}>
            {article.container_title}
          </span>
        )}
        
        {/* ML Predictions - highlighted with improved visual treatment */}
        {showRelevanceIndicators && recentPredictions.length > 0 && (
          <div className="ml-predictions-container" aria-label="Machine learning predictions">
            {recentPredictions.map((prediction, index) => {
              const badgeClassName = generatePredictionBadgeClassName(prediction);
              const badgeTitle = generateBadgeTitle(prediction);
              const algorithmName = formatAlgorithmName(prediction.algorithm);
              const score = formatPredictionScore(prediction.probability_score);
              
              return (
                <span 
                  key={index}
                  className={`badge prediction-badge mr-2 ${badgeClassName}`}
                  title={badgeTitle}
                  aria-label={`${algorithmName} prediction: ${score}`}
                >
                  {algorithmName}: {score}
                </span>
              );
            })}
          </div>
        )}
        
        {/* Expert Selection Badge */}
        {showRelevanceIndicators && article.relevant && (
          <span 
            className="badge badge-expert font-weight-normal mr-2" 
            aria-label="Selected by experts as relevant"
          >
            Expert Selection
          </span>
        )}
      </div>
      
      {/* Authors */}
      {article.authors && article.authors.length > 0 && (
        <p className="article-authors mb-1" aria-label="Article authors">
          <small>
            <i className="fas fa-user-edit mr-1" aria-hidden="true"></i>
            <strong>Authors:</strong> {article.authors.map((author, index) => (
              <span key={author.author_id || index}>
                {author.author_id ? (
                  <a 
                    href={generateAuthorURL(author)} 
                    className="author-profile-link"
                    title={`View profile for ${author.given_name || ''} ${author.family_name || ''}`}
                  >
                    {`${author.given_name || ''} ${author.family_name || ''}`.trim()}
                  </a>
                ) : (
                  `${author.given_name || ''} ${author.family_name || ''}`.trim()
                )}
                {index < article.authors.length - 1 && ', '}
              </span>
            ))}
          </small>
        </p>
      )}
      
      {/* Summary/Takeaways */}
      {(article.summary || article.takeaways) && (
        <p className="article-summary" aria-label="Article summary">
          {truncateText(stripHtml(article.summary || article.takeaways), 300)}
        </p>
      )}
      
      {/* Links */}
      <div className="article-links">
        {/* Original source link */}
        {article.link && (
          <small className="mr-3">
            <a 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="source-link"
              aria-label="View original source (opens in new tab)"
            >
              <i className="fas fa-external-link-alt mr-1" aria-hidden="true"></i>
              View original source
            </a>
          </small>
        )}
        
        {/* View full article link - only for non-search results */}
        {!isSearchResult && (
          <small>
            <Link 
              to={articleUrl} 
              className="full-article-link"
              aria-label="Read full article details"
            >
              <i className="fas fa-book-open mr-1" aria-hidden="true"></i>
              Read full article
            </Link>
          </small>
        )}
      </div>
    </div>
  );
}

ArticleListItem.propTypes = {
  article: PropTypes.shape({
    article_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    published_date: PropTypes.string.isRequired,
    takeaways: PropTypes.string,
    summary: PropTypes.string,
    container_title: PropTypes.string,
    link: PropTypes.string,
    authors: PropTypes.arrayOf(PropTypes.shape({
      given_name: PropTypes.string,
      family_name: PropTypes.string
    })),
    ml_predictions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      algorithm: PropTypes.string,
      model_version: PropTypes.string,
      probability_score: PropTypes.number,
      predicted_relevant: PropTypes.bool,
      created_date: PropTypes.string,
      subject: PropTypes.number
    })),
    relevant: PropTypes.bool
  }).isRequired,
  showRelevanceIndicators: PropTypes.bool,
  isSearchResult: PropTypes.bool
};

export default ArticleListItem;
