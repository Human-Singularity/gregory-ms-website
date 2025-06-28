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
 * Create a download link for CSV data
 * @param {Blob} blob - CSV data blob
 * @param {string} fileName - File name for download
 */
const downloadCSVFile = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Create a GET request URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} - URL with query parameters
 */
const buildUrlWithParams = (baseUrl, params) => {
  const url = new URL(baseUrl);
  
  // Add each parameter to the URL
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.toString();
};

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
   * @param {boolean} params.exportCSV - Whether to export as CSV
   * @returns {Promise} - Promise with search results
   */
  searchArticles: (params) => {
    // Create request parameters
    const requestParams = {
      team_id: params.team_id || 1, // Default to Team Gregory
      subject_id: params.subject_id || 1, // Default to Multiple Sclerosis
      search: params.search || undefined,
      title: params.title || undefined,
      summary: params.summary || undefined,
      page: params.page || 1,
      page_size: params.page_size || undefined // Allow requesting all results
    };

    // If exporting as CSV, adjust the request
    if (params.exportCSV) {
      // Add CSV-specific parameters
      const csvParams = {
        ...requestParams,
        format: 'csv',
        all_results: true
      };
      
      // Clean up undefined values
      Object.keys(csvParams).forEach(key => 
        csvParams[key] === undefined && delete csvParams[key]
      );

      // APPROACH 1: Direct GET request via window.open (simplest, most reliable)
      console.log('APPROACH 1: Trying direct window.open with GET request for articles');
      const getUrl = buildUrlWithParams(`${API_BASE_URL}/articles/search/`, csvParams);
      console.log('Opening URL:', getUrl);
      window.open(getUrl, '_blank');
      
      return Promise.resolve({ success: true });
    }

    // Regular JSON search
    return apiClient.post('/articles/search/', requestParams)
      .then(response => {
        // Ensure all article_id values are strings for proper prop typing
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          response.data.results = response.data.results.map(article => ({
            ...article,
            article_id: article.article_id ? String(article.article_id) : article.article_id
          }));
        }
        return response;
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
   * @param {boolean} params.exportCSV - Whether to export as CSV
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
      page_size: params.page_size || undefined // Allow requesting all results
    };
    
    // Clean up undefined values
    Object.keys(requestParams).forEach(key => 
      requestParams[key] === undefined && delete requestParams[key]
    );
    
    // If exporting as CSV, adjust the request
    if (params.exportCSV) {
      // Add CSV-specific parameters
      const csvParams = {
        ...requestParams,
        format: 'csv',
        all_results: true
      };

      // APPROACH 1: Direct GET request via window.open (simplest, most reliable)
      console.log('APPROACH 1: Trying direct window.open with GET request for trials');
      const getUrl = buildUrlWithParams(`${API_BASE_URL}/trials/search/`, csvParams);
      console.log('Opening URL:', getUrl);
      window.open(getUrl, '_blank');
      
      return Promise.resolve({ success: true });
    }
    
    // Make the API request
    return apiClient.post('/trials/search/', requestParams)
      .then(response => {
        console.log('Raw trial search response:', response);
        
        // Ensure all trial_id values are strings for proper prop typing
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          response.data.results = response.data.results.map(trial => ({
            ...trial,
            trial_id: trial.trial_id ? String(trial.trial_id) : trial.trial_id
          }));
        } else if (response.data && Array.isArray(response.data)) {
          response.data = response.data.map(trial => ({
            ...trial,
            trial_id: trial.trial_id ? String(trial.trial_id) : trial.trial_id
          }));
        }
        
        return response;
      })
      .catch(error => {
        console.error('Trial search error:', error);
        throw error;
      });
  },

  /**
   * Download search results as CSV
   * @param {Object} params - Search parameters
   * @param {string} params.type - Type of results to download ('articles' or 'trials')
   * @param {number} params.team_id - Team ID (required)
   * @param {number} params.subject_id - Subject ID (required)
   * @param {string} params.search - General search term for title or summary
   * @param {string} params.title - Search term for title only
   * @param {string} params.summary - Search term for summary only
   * @param {string} params.status - Recruitment status (for trials)
   * @returns {Promise} - Promise that resolves when the file is downloaded
   */
  downloadResults: (params) => {
    const { type, team_id, subject_id, search, title, summary, status } = params;
    
    // Validate input parameters
    if (!type || !['articles', 'trials'].includes(type)) {
      return Promise.reject(new Error('Invalid or missing "type" parameter. Must be "articles" or "trials".'));
    }
    
    // Set default values for parameters
    const requestParams = {
      team_id: team_id || 1, // Default to Team Gregory
      subject_id: subject_id || 1, // Default to Multiple Sclerosis
      search: search || undefined,
      title: title || undefined,
      summary: summary || undefined,
      status: type === 'trials' ? status : undefined, // Only include status for trials
      format: 'csv', // Request CSV format
      all_results: true // Request all results
    };
    
    // Clean up undefined values
    Object.keys(requestParams).forEach(key => 
      requestParams[key] === undefined && delete requestParams[key]
    );
    
    // Determine the endpoint based on the type
    const endpoint = type === 'articles' ? '/articles/search/' : '/trials/search/';
    
    // Try three different approaches and log debug info
    
    // APPROACH 1: Direct GET request via window.open (simplest, most reliable)
    console.log('APPROACH 1: Trying direct window.open with GET request');
    const getUrl = buildUrlWithParams(`${API_BASE_URL}${endpoint}`, requestParams);
    console.log('Opening URL:', getUrl);
    window.open(getUrl, '_blank');
    
    // APPROACH 2: Form POST submission (backup method)
    console.log('APPROACH 2: Also trying form POST submission as backup');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${API_BASE_URL}${endpoint}`;
    form.target = '_blank'; 
    
    // Add all parameters to the form
    Object.keys(requestParams).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = requestParams[key];
      form.appendChild(input);
    });
    
    // Append form to the body, submit it, then remove it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Return a resolved promise since we've tried multiple approaches
    return Promise.resolve({ success: true });
  }
};

export default searchService;
