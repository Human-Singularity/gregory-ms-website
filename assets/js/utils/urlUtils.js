/**
 * URL parameter utilities for search functionality
 */

export const urlUtils = {
  /**
   * Get search parameters from URL
   */
  getSearchParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      type: urlParams.get('type') || 'articles',
      q: urlParams.get('q') || '',
      field: urlParams.get('field') || 'all',
      status: urlParams.get('status') || '',
      orcid: urlParams.get('orcid') || '',
      page: parseInt(urlParams.get('page')) || 1
    };
  },

  /**
   * Update URL parameters without page reload
   */
  updateSearchParams(params) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Update or set parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && value !== 1) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    // Update the URL without triggering a page reload
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }
};
