import axios from 'axios';

// Define the API base URL with a fallback
const API_BASE_URL = typeof window !== 'undefined' && window.ENV_API_URL 
  ? window.ENV_API_URL 
  : 'https://api.gregory-ms.com';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Search service for articles and clinical trials
 */
export const searchService = {
  /**
   * Search articles
   * @param {Object} params - Search parameters
   * @param {number} params.team_id - Team ID (required)
   * @param {number} params.subject_id - Subject ID (required)
   * @param {string} params.search - General search term for title or summary
   * @param {string} params.title - Search term for title only
   * @param {string} params.summary - Search term for summary only
   * @param {number} params.page - Page number for pagination
   * @returns {Promise} - Promise with search results
   */
  searchArticles: (params) => {
    return apiClient.post('/articles/search/', {
      team_id: params.team_id || 1, // Default to Team Gregory
      subject_id: params.subject_id || 1, // Default to Multiple Sclerosis
      search: params.search || undefined,
      title: params.title || undefined,
      summary: params.summary || undefined,
      page: params.page || 1
    });
  },

  /**
   * Search clinical trials
   * @param {Object} params - Search parameters
   * @param {number} params.team_id - Team ID (required)
   * @param {number} params.subject_id - Subject ID (required)
   * @param {string} params.search - General search term for title or summary
   * @param {string} params.title - Search term for title only
   * @param {string} params.summary - Search term for summary only
   * @param {string} params.status - Recruitment status
   * @param {number} params.page - Page number for pagination
   * @returns {Promise} - Promise with search results
   */
  searchTrials: (params) => {
    console.log('Sending trial search request with params:', params);
    
    // Construct the request parameters
    const requestParams = {
      team_id: params.team_id || 1, // Default to Team Gregory
      subject_id: params.subject_id || 1, // Default to Multiple Sclerosis
      search: params.search || undefined,
      title: params.title || undefined,
      summary: params.summary || undefined,
      status: params.status || undefined,
      page: params.page || 1
    };
    
    // Clean up undefined values
    Object.keys(requestParams).forEach(key => 
      requestParams[key] === undefined && delete requestParams[key]
    );
    
    // Make the API request
    return apiClient.post('/trials/search/', requestParams)
      .then(response => {
        console.log('Raw trial search response:', response);
        return response;
      })
      .catch(error => {
        console.error('Trial search error:', error);
        throw error;
      });
  }
};

export default searchService;
