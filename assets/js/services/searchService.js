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
   * @param {string} params.ordering - Ordering field (e.g., '-discovery_date', 'published_date')
   * @returns {Promise} - Promise with search results
   */
  searchArticles: (params) => {
    return apiClient.post('/articles/search/', {
      team_id: params.team_id || 1, // Default to Team Gregory
      subject_id: params.subject_id || 1, // Default to Multiple Sclerosis
      search: params.search || undefined,
      title: params.title || undefined,
      summary: params.summary || undefined,
      page: params.page || 1,
      ordering: params.ordering || '-published_date', // Ensure newest first ordering
      page_size: params.page_size || undefined // Allow requesting all results
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
   * @param {string} params.ordering - Ordering field (e.g., '-discovery_date', 'published_date')
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
      page: params.page || 1,
      ordering: params.ordering || '-published_date', // Ensure newest first ordering
      page_size: params.page_size || undefined // Allow requesting all results
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
  },

  /**
   * Search authors
   * @param {Object} params - Search parameters
   * @param {number} params.team_id - Team ID (required)
   * @param {number} params.subject_id - Subject ID (required)
   * @param {string} params.full_name - Full name search term
   * @param {string} params.orcid - ORCID identifier search term
   * @param {number} params.page - Page number for pagination
   * @returns {Promise} - Promise with search results
   */
  searchAuthors: (params) => {
    console.log('Sending author search request with params:', params);
    
    // Construct the request parameters
    const requestParams = {
      team_id: params.team_id || 1, // Default to Team Gregory
      subject_id: params.subject_id || 1, // Default to Multiple Sclerosis
      full_name: params.full_name || undefined,
      orcid: params.orcid || undefined,
      page: params.page || 1,
      page_size: params.page_size || undefined // Allow requesting all results
    };
    
    // Clean up undefined values
    Object.keys(requestParams).forEach(key => 
      requestParams[key] === undefined && delete requestParams[key]
    );
    
    // Make the API request using GET method as specified in the documentation
    return apiClient.get('/authors/search/', { params: requestParams })
      .then(response => {
        console.log('Raw author search response:', response);
        return response;
      })
      .catch(error => {
        console.error('Author search error:', error);
        throw error;
      });
  },

  /**
   * Search authors by ORCID directly (uses main authors endpoint)
   * @param {Object} params - Search parameters
   * @param {string} params.orcid - ORCID identifier search term
   * @param {number} params.page - Page number for pagination
   * @returns {Promise} - Promise with search results
   */
  searchAuthorsByOrcid: (params) => {
    console.log('Sending ORCID author search request with params:', params);
    
    // Clean ORCID by removing https://orcid.org/ prefix if present
    let cleanOrcid = params.orcid;
    if (cleanOrcid && cleanOrcid.includes('orcid.org/')) {
      cleanOrcid = cleanOrcid.split('orcid.org/')[1];
    }
    
    // Construct the request parameters for the main authors endpoint
    const requestParams = {
      orcid: cleanOrcid,
      page: params.page || 1,
      page_size: params.page_size || undefined // Allow requesting all results
    };
    
    // Clean up undefined values
    Object.keys(requestParams).forEach(key => 
      requestParams[key] === undefined && delete requestParams[key]
    );
    
    // Make the API request using GET method to the main authors endpoint
    return apiClient.get('/authors/', { params: requestParams })
      .then(response => {
        console.log('Raw ORCID author search response:', response);
        return response;
      })
      .catch(error => {
        console.error('ORCID author search error:', error);
        throw error;
      });
  }
};

export default searchService;
