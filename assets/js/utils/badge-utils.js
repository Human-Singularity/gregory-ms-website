/**
 * Badge utilities and components for Gregory MS
 * This file contains utility functions and components for displaying badges consistently
 * throughout the application.
 */

/**
 * Get ML prediction relevance level based on score
 * @param {number} score - Prediction score (0-1)
 * @returns {string} - Relevance level: 'high', 'medium', or 'low'
 */
export const getRelevanceLevel = (score) => {
  if (score >= 0.7) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
};

/**
 * Get badge color class based on prediction value
 * @param {number} value - Prediction score (0-1)
 * @returns {string} - CSS class for the badge color
 */
export const getBadgeColorClass = (value) => {
  const level = getRelevanceLevel(value);
  return `badge-${level}-relevance`;
};

/**
 * Get the most recent ML prediction for each algorithm
 * @param {object} article - Article data with ml_predictions
 * @returns {array} - Array of most recent predictions by algorithm
 */
export const getMostRecentPredictions = (article) => {
  if (!article.ml_predictions || !Array.isArray(article.ml_predictions) || article.ml_predictions.length === 0) {
    return [];
  }
  
  // Group predictions by algorithm
  const predictionsByAlgorithm = {};
  
  article.ml_predictions.forEach(prediction => {
    const algorithm = prediction.algorithm;
    
    // If we haven't seen this algorithm yet, or this prediction is newer
    if (!predictionsByAlgorithm[algorithm] || 
        new Date(prediction.created_date) > new Date(predictionsByAlgorithm[algorithm].created_date)) {
      predictionsByAlgorithm[algorithm] = prediction;
    }
  });
  
  // Convert the grouped predictions back to an array
  return Object.values(predictionsByAlgorithm);
};

/**
 * Format the algorithm name for display
 * @param {string} algorithm - Full algorithm name
 * @returns {string} - Formatted algorithm name for display
 */
export const formatAlgorithmName = (algorithm) => {
  // Special handling for known algorithm names
  if (algorithm.includes('pubmed_bert')) {
    return 'PUBMED-BERT';
  } else if (algorithm.includes('lgbm_tfidf')) {
    return 'LGBM-TFIDF';
  } else if (algorithm.includes('lstm')) {
    return 'LSTM';
  }
  
  // For other algorithms, use the full name with underscore replaced by hyphen
  return algorithm.replace(/_/g, '-').toUpperCase();
};

/**
 * Format a prediction score for display
 * @param {number} score - Prediction score (0-1)
 * @returns {string} - Formatted score with 2 decimal places
 */
export const formatPredictionScore = (score) => {
  return score.toFixed(2);
};

/**
 * Generate badge title with algorithm details
 * @param {object} prediction - Prediction object
 * @returns {string} - Title for the badge tooltip
 */
export const generateBadgeTitle = (prediction) => {
  return `Algorithm: ${prediction.algorithm} (${prediction.model_version})`;
};

/**
 * Generate a class name for the prediction badge
 * @param {object} prediction - Prediction object
 * @returns {string} - CSS class name for the badge
 */
export const generatePredictionBadgeClassName = (prediction) => {
  const relevanceLevel = getRelevanceLevel(prediction.probability_score);
  const algorithmSlug = prediction.algorithm.toLowerCase().replace(/_/g, '-');
  
  return `ml-prediction relevance-${relevanceLevel} algorithm-${algorithmSlug}`;
};
