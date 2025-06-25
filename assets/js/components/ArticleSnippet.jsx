import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, generateArticleURL } from '../utils';
import { 
  getMostRecentPredictions, 
  generatePredictionBadgeClassName, 
  formatAlgorithmName, 
  formatPredictionScore,
  generateBadgeTitle
} from '../utils/badge-utils';

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
  
  // Get the most recent ML predictions for each algorithm
  const recentPredictions = getMostRecentPredictions(article);
  
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
          <p className="author">
            {article.container_title && (
              <span className="badge badge-info text-white font-weight-normal">
                {article.container_title}
              </span>
            )}
            
            {showRelevanceIndicators && recentPredictions.length > 0 && (
              <span className="ml-2">
                {recentPredictions.map((prediction, index) => {
                  const badgeClassName = generatePredictionBadgeClassName(prediction);
                  const badgeTitle = generateBadgeTitle(prediction);
                  const algorithmName = formatAlgorithmName(prediction.algorithm);
                  const score = formatPredictionScore(prediction.probability_score);
                  
                  return (
                    <span 
                      key={index}
                      className={`badge ml-1 ${badgeClassName}`}
                      title={badgeTitle}
                    >
                      <strong>{algorithmName}</strong>: {score}
                    </span>
                  );
                })}
              </span>
            )}
            
            {showRelevanceIndicators && article.relevant && (
              <span className="ml-1 text-white badge badge-primary font-weight-normal expert-selection">
                Expert Selection
              </span>
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
  showRelevanceIndicators: PropTypes.bool
};

export default ArticleSnippet;
