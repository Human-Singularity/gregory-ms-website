/**
 * API Service - Centralized API calls for Gregory MS
 * Updated to use new endpoint patterns as per API Migration Guide
 */
import axios from 'axios';

// Base API URL
const API_URL = 'https://api.gregory-ms.com';

// Default configuration constants
export const API_CONFIG = {
  DEFAULT_TEAM_ID: 1,
  DEFAULT_SUBJECT_ID: 1,
  DEFAULT_FORMAT: 'json',
  DEFAULT_PAGE_SIZE: 10,
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle deprecation warnings
apiClient.interceptors.response.use(
  (response) => {
    // Log deprecation warnings if present
    if (response.headers['x-deprecation-warning']) {
      console.warn('API Deprecation Warning:', response.headers['x-deprecation-warning']);
      console.warn('Migration Guide:', response.headers['x-migration-guide']);
      console.warn('Deprecated Endpoint:', response.headers['x-deprecated-endpoint']);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Utility function to build query parameters
 * @param {Object} params - Parameters object
 * @returns {URLSearchParams} - URLSearchParams object
 */
export const buildQueryParams = (params = {}) => {
  return new URLSearchParams({
    format: API_CONFIG.DEFAULT_FORMAT,
    ...params
  });
};

/**
 * Utility function to build API endpoint with query parameters
 * @param {string} endpoint - Base endpoint
 * @param {Object} params - Query parameters
 * @returns {string} - Full endpoint URL with parameters
 */
export const buildEndpoint = (endpoint, params = {}) => {
  const queryParams = buildQueryParams(params);
  return `${endpoint}?${queryParams.toString()}`;
};

/**
 * Article related API calls
 */
export const articleService = {
  // Get all articles with pagination - UPDATED to use new endpoint
  getArticles: (page = 1) => 
    apiClient.get(`/articles/?team_id=1&format=json&page=${page}`),
  
  // Get a single article by ID
  getArticleById: (articleId) => 
    apiClient.get(`/articles/${articleId}/?format=json`),
  
  // Get articles by category - UPDATED to use new endpoint
  getArticlesByCategory: (category, page = 1) => 
    apiClient.get(`/articles/?team_id=1&category_slug=${category}&format=json&page=${page}`),
  
  // Get articles by author - UPDATED to use new endpoint
  getArticlesByAuthor: (authorId, page = 1) => 
    apiClient.get(`/articles/?author_id=${authorId}&format=json&page=${page}`),
    
  // Get relevant articles
  getRelevantArticles: (page = 1) => 
    apiClient.get(`/articles/?relevant=true&format=json&page=${page}`),

  // New enhanced search endpoint for articles
  searchArticles: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: 1, // Default team ID
      ...params
    });
    return apiClient.get(`/articles/search/?${queryParams.toString()}`);
  },

  // Enhanced filtering with all available parameters
  getArticlesWithFilters: (filters = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: 1, // Default team ID
      ...filters
    });
    return apiClient.get(`/articles/?${queryParams.toString()}`);
  },
};

/**
 * Trial related API calls - UPDATED to use new endpoints
 */
export const trialService = {
  // Get all trials with pagination - UPDATED to use new endpoint
  getTrials: (page = 1) => 
    apiClient.get(`/trials/?team_id=1&subject_id=1&format=json&page=${page}`),
  
  // Get trials by category - UPDATED to use new endpoint
  getTrialsByCategory: (category, page = 1) => 
    apiClient.get(`/trials/?team_id=1&category_slug=${category}&format=json&page=${page}`),

  // New enhanced search endpoint for trials
  searchTrials: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: 1, // Default team ID
      subject_id: 1, // Default subject ID
      ...params
    });
    return apiClient.get(`/trials/search/?${queryParams.toString()}`);
  },

  // Enhanced filtering with all available parameters
  getTrialsWithFilters: (filters = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: 1, // Default team ID
      ...filters
    });
    return apiClient.get(`/trials/?${queryParams.toString()}`);
  },
};

/**
 * Category related API calls
 * 
 * Updated to use the new monthly_counts=true query parameter approach
 * as documented in the latest API specification.
 */
export const categoryService = {
  // Get monthly counts for a category - Using query parameter approach
  // Supports ml_threshold parameter (0.0-1.0, default: 0.5) for ML prediction filtering
  // Usage: getMonthlyCounts(6, { ml_threshold: '0.8' })
  getMonthlyCounts: (categoryId, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      category_id: categoryId,
      monthly_counts: 'true',
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`).then(response => {
      // Extract monthly_counts from the category response
      if (response.data && response.data.results && response.data.results.length > 0) {
        const categoryData = response.data.results[0];
        if (categoryData.monthly_counts) {
          // Return the monthly_counts object as the data, matching the expected format
          return { data: categoryData.monthly_counts };
        }
      }
      
      // Fallback: return empty monthly counts structure
      console.warn('No monthly_counts found in category response');
      return { 
        data: {
          ml_threshold: 0.5,
          available_models: [],
          monthly_article_counts: [],
          monthly_ml_article_counts_by_model: {},
          monthly_trial_counts: []
        }
      };
    });
  },

  // Get monthly counts by category slug - Alternative for legacy compatibility
  // Supports ml_threshold parameter (0.0-1.0, default: 0.5) for ML prediction filtering
  getMonthlyCountsBySlug: (categorySlug, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      category_slug: categorySlug,
      monthly_counts: 'true',
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`).then(response => {
      // Extract monthly_counts from the category response
      if (response.data && response.data.results && response.data.results.length > 0) {
        const categoryData = response.data.results[0];
        if (categoryData.monthly_counts) {
          // Return the monthly_counts object as the data, matching the expected format
          return { data: categoryData.monthly_counts };
        }
      }
      
      // Fallback: return empty monthly counts structure
      console.warn('No monthly_counts found in category response');
      return { 
        data: {
          ml_threshold: 0.5,
          available_models: [],
          monthly_article_counts: [],
          monthly_ml_article_counts_by_model: {},
          monthly_trial_counts: []
        }
      };
    });
  },

  // Get categories with filtering - ENHANCED with author statistics
  getCategories: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      include_authors: 'true', // Default to include author statistics
      max_authors: '10', // Default to top 10 authors
      team_id: 1, // Default team ID
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`);
  },

  // Get categories without author data for performance
  getCategoriesBasic: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      include_authors: 'false',
      team_id: 1, // Default team ID
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`);
  },

  // Get detailed author statistics for a specific category - CORRECTED endpoint
  getCategoryAuthors: (categoryId, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      category_id: categoryId,
      include_authors: 'true',
      sort_by: 'articles_count',
      order: 'desc',
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`);
  },

  // Alternative method using category_slug
  getCategoryAuthorsBySlug: (categorySlug, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      category_slug: categorySlug,
      include_authors: 'true',
      sort_by: 'articles_count',
      order: 'desc',
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`);
  },

  // Get categories with date filtering for author statistics
  getCategoriesWithDateFilter: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      include_authors: 'true',
      max_authors: '10',
      team_id: 1,
      ...params
    });
    return apiClient.get(`/categories/?${queryParams.toString()}`);
  },
};

/**
 * Subject related API calls - NEW service based on migration guide
 */
export const subjectService = {
  // Get subjects with optional team filtering - UPDATED to use new endpoint
  getSubjects: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...params
    });
    return apiClient.get(`/subjects/?${queryParams.toString()}`);
  },

  // Get subjects for a specific team - UPDATED to use new endpoint
  getSubjectsByTeam: (teamId, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: teamId,
      ...params
    });
    return apiClient.get(`/subjects/?${queryParams.toString()}`);
  },

  // Get a single subject by ID
  getSubject: (subjectId) => 
    apiClient.get(`/subjects/${subjectId}/?format=json`),
};

/**
 * Author related API calls - UPDATED to use new endpoints
 */
export const authorService = {
  // Get author details
  getAuthor: (authorId) => 
    apiClient.get(`/authors/${authorId}/?format=json`),
    
  // Get authors with filtering and sorting - ENHANCED with new capabilities
  getAuthors: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...params
    });
    return apiClient.get(`/authors/?${queryParams.toString()}`);
  },
  
  // Get authors by team and subject with ranking - UPDATED to use new enhanced endpoint
  getAuthorsByTeamSubject: (teamId, subjectId, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: teamId,
      subject_id: subjectId,
      sort_by: 'article_count',
      order: 'desc',
      ...params
    });
    return apiClient.get(`/authors/?${queryParams.toString()}`);
  },

  // Get authors by team and category - NEW endpoint using preferred approach
  getAuthorsByTeamCategory: (teamId, categorySlug, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: teamId,
      category_slug: categorySlug,
      sort_by: 'article_count',
      order: 'desc',
      ...params
    });
    return apiClient.get(`/authors/?${queryParams.toString()}`);
  },

  // Alternative endpoint for authors by team and category (if needed for backward compatibility)
  getAuthorsByTeamCategoryLegacy: (teamId, categorySlug, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...params
    });
    return apiClient.get(`/authors/by_team_category/?team_id=${teamId}&category_slug=${categorySlug}&${queryParams.toString()}`);
  },
  
  // Search authors with enhanced filtering
  searchAuthors: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      ...params
    });
    return apiClient.get(`/authors/search/?${queryParams.toString()}`);
  },

  // Get author's monthly article counts for chart (this endpoint may not exist)
  getAuthorMonthlyCounts: (authorId) => 
    apiClient.get(`/authors/${authorId}/monthly-counts/?format=json`),
};

/**
 * Source related API calls
 */
export const sourceService = {
  // Get all sources with pagination and filtering
  getSources: (params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: 1, // Default team ID
      subject_id: 1, // Default subject ID
      ...params
    });
    return apiClient.get(`/sources/?${queryParams.toString()}`);
  },

  // Get a single source by ID
  getSourceById: (sourceId) => 
    apiClient.get(`/sources/${sourceId}/?format=json`),

  // Get sources by team and subject
  getSourcesByTeamSubject: (teamId, subjectId, params = {}) => {
    const queryParams = new URLSearchParams({
      format: 'json',
      team_id: teamId,
      subject_id: subjectId,
      ...params
    });
    return apiClient.get(`/sources/?${queryParams.toString()}`);
  },
};

export default {
  articleService,
  trialService,
  categoryService,
  authorService,
  subjectService,
  sourceService,
};
