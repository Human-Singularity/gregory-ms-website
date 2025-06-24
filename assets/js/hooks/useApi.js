import { useState, useEffect } from 'react';
import { articleService, trialService } from '../services/api';

/**
 * Hook for fetching articles with pagination
 * @param {string} type - Type of articles to fetch ('all', 'relevant', 'author', 'category')
 * @param {object} options - Options for the fetch
 * @returns {object} - Articles data, loading state, error state, and pagination
 */
export function useArticles(type = 'all', options = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(options.initialPage || 1);
  const [lastPage, setLastPage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchArticles = async () => {
      try {
        let response;
        
        switch (type) {
          case 'relevant':
            response = await articleService.getRelevantArticles(page);
            break;
          case 'author':
            response = await articleService.getArticlesByAuthor(options.authorId, page);
            break;
          case 'category':
            response = await articleService.getArticlesByCategory(options.category, page);
            break;
          default:
            response = await articleService.getArticles(page);
        }

        if (isMounted) {
          setArticles(response.data.results);
          setLastPage(Math.ceil(response.data.count / 10));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [type, page, options.authorId, options.category]);

  return { 
    articles, 
    loading, 
    error,
    pagination: {
      page,
      lastPage,
      setPage
    } 
  };
}

/**
 * Hook for fetching a single article
 * @param {string} articleId - ID of the article to fetch
 * @returns {object} - Article data, loading state, and error state
 */
export function useArticle(articleId) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchArticle = async () => {
      try {
        const response = await articleService.getArticleById(articleId);
        
        if (isMounted) {
          setArticle(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    if (articleId) {
      fetchArticle();
    }

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  return { article, loading, error };
}

/**
 * Hook for fetching trials with pagination
 * @param {string} type - Type of trials to fetch ('all', 'category')
 * @param {object} options - Options for the fetch
 * @returns {object} - Trials data, loading state, error state, and pagination
 */
export function useTrials(type = 'all', options = {}) {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(options.initialPage || 1);
  const [lastPage, setLastPage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchTrials = async () => {
      try {
        let response;
        
        switch (type) {
          case 'category':
            response = await trialService.getTrialsByCategory(options.category, page);
            break;
          default:
            response = await trialService.getTrials(page);
        }

        if (isMounted) {
          setTrials(response.data.results);
          setLastPage(Math.ceil(response.data.count / 10));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchTrials();

    return () => {
      isMounted = false;
    };
  }, [type, page, options.category]);

  return { 
    trials, 
    loading, 
    error,
    pagination: {
      page,
      lastPage,
      setPage
    } 
  };
}
