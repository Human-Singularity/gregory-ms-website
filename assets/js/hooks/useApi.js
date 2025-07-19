import { useState, useEffect } from 'react';
import { articleService, trialService, sourceService } from '../services/api';

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
          let articlesToDisplay = response.data.results;
          
          // Only filter out irrelevant articles for the 'relevant' page
          if (type === 'relevant') {
            articlesToDisplay = response.data.results.filter(article => {
              // Check if article has subject relevances
              if (article.article_subject_relevances && article.article_subject_relevances.length > 0) {
                // Look for Multiple Sclerosis subject relevance
                const msSubjectRelevance = article.article_subject_relevances.find(
                  relevance => relevance.subject && relevance.subject.subject_name === "Multiple Sclerosis"
                );
                
                // If it's explicitly marked as not relevant, exclude it
                if (msSubjectRelevance && msSubjectRelevance.is_relevant === false) {
                  return false;
                }
              }
              // Include all other articles
              return true;
            });
          }
          
          setArticles(articlesToDisplay);
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
          // Check if the article is marked as not relevant for MS
          const articleData = response.data;
          
          // We still show the article in the single view, as the user has explicitly navigated to it
          // But we could add a notice or warning if needed
          setArticle(articleData);
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

/**
 * Hook for fetching sources with client-side filtering and pagination
 * @param {string} type - Type of sources to fetch ('all', 'science paper', 'trials')
 * @param {object} options - Options for the fetch
 * @returns {object} - Sources data, loading state, error state, and pagination
 */
export function useSources(type = 'all', options = {}) {
  const [allSources, setAllSources] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(options.initialPage || 1);
  const [lastPage, setLastPage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch all sources once
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchAllSources = async () => {
      try {
        // Fetch all sources by getting all pages
        let allSourcesData = [];
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages && isMounted) {
          const response = await sourceService.getSources({ page: currentPage });
          
          if (response.data.results && response.data.results.length > 0) {
            allSourcesData = [...allSourcesData, ...response.data.results];
            
            // Check if there are more pages
            hasMorePages = response.data.next !== null;
            currentPage++;
          } else {
            hasMorePages = false;
          }
        }
        
        if (isMounted) {
          // Store all sources
          setAllSources(allSourcesData);
          // Don't set loading to false here - let the filtering effect handle it
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchAllSources();

    return () => {
      isMounted = false;
    };
  }, []); // Only fetch once

  // Apply filtering and pagination when type or page changes
  useEffect(() => {
    if (allSources.length === 0) return;

    // Apply filtering
    let filteredSources = allSources;
    if (type !== 'all') {
      filteredSources = allSources.filter(source => source.source_for === type);
    }

    // Set total count of filtered sources
    setTotalCount(filteredSources.length);

    // Apply pagination only if we have more than 10 sources and not showing all
    const sourcesPerPage = 10;
    let paginatedSources = filteredSources;
    let totalPages = 1;

    if (filteredSources.length > sourcesPerPage) {
      totalPages = Math.ceil(filteredSources.length / sourcesPerPage);
      const startIndex = (page - 1) * sourcesPerPage;
      const endIndex = startIndex + sourcesPerPage;
      paginatedSources = filteredSources.slice(startIndex, endIndex);
    }

    setSources(paginatedSources);
    setLastPage(totalPages);
    setLoading(false); // Set loading to false after sources are processed
  }, [allSources, type, page]);

  return { 
    sources, 
    loading, 
    error,
    totalCount,
    pagination: {
      page,
      lastPage,
      setPage
    } 
  };
}

/**
 * Hook for fetching a single source
 * @param {string} sourceId - ID of the source to fetch
 * @returns {object} - Source data, loading state, and error state
 */
export function useSource(sourceId) {
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchSource = async () => {
      try {
        const response = await sourceService.getSourceById(sourceId);
        
        if (isMounted) {
          setSource(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    if (sourceId) {
      fetchSource();
    }

    return () => {
      isMounted = false;
    };
  }, [sourceId]);

  return { source, loading, error };
}
