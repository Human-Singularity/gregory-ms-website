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
      // Create a unique ID for the iframe
      const iframeId = `download-iframe-${Date.now()}`;
      const iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.name = iframeId;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create a form that targets the iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${API_BASE_URL}/articles/search/`;
      form.target = iframeId;
      form.style.display = 'none';
      
      // Add format parameter
      const formatInput = document.createElement('input');
      formatInput.type = 'hidden';
      formatInput.name = 'format';
      formatInput.value = 'csv';
      form.appendChild(formatInput);
      
      // Add all_results parameter
      const allResultsInput = document.createElement('input');
      allResultsInput.type = 'hidden';
      allResultsInput.name = 'all_results';
      allResultsInput.value = 'true';
      form.appendChild(allResultsInput);
      
      // Add all other parameters
      Object.keys(requestParams).forEach(key => {
        if (requestParams[key] !== undefined) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = requestParams[key];
          form.appendChild(input);
        }
      });
      
      // Append form to the body, submit it
      document.body.appendChild(form);
      form.submit();
      
      // Clean up after a delay to ensure the request has time to process
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 5000);
      
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
      // Create a unique ID for the iframe
      const iframeId = `download-iframe-${Date.now()}`;
      const iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.name = iframeId;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create a form that targets the iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${API_BASE_URL}/trials/search/`;
      form.target = iframeId;
      form.style.display = 'none';
      
      // Add format parameter
      const formatInput = document.createElement('input');
      formatInput.type = 'hidden';
      formatInput.name = 'format';
      formatInput.value = 'csv';
      form.appendChild(formatInput);
      
      // Add all_results parameter
      const allResultsInput = document.createElement('input');
      allResultsInput.type = 'hidden';
      allResultsInput.name = 'all_results';
      allResultsInput.value = 'true';
      form.appendChild(allResultsInput);
      
      // Add all other parameters
      Object.keys(requestParams).forEach(key => {
        if (requestParams[key] !== undefined) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = requestParams[key];
          form.appendChild(input);
        }
      });
      
      // Append form to the body, submit it
      document.body.appendChild(form);
      form.submit();
      
      // Clean up after a delay to ensure the request has time to process
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 5000);
      
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

    // Try using an iframe approach which can help with certain CORS issues
    const iframeId = `download-iframe-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.name = iframeId;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create a form that targets the iframe
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${API_BASE_URL}${endpoint}`;
    form.target = iframeId;
    form.style.display = 'none';
    
    // Add all parameters to the form
    Object.keys(requestParams).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = requestParams[key];
      form.appendChild(input);
    });
    
    // Append form to the body, submit it
    document.body.appendChild(form);
    form.submit();
    
    // Clean up after a delay to ensure the request has time to process
    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 5000);
    
    // Return a resolved promise since we can't track the form submission
    return Promise.resolve({ success: true });
  }
};

export default searchService;
