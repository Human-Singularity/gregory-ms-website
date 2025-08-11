/**
 * Strip HTML tags from a string
 * @param {string} html - String containing HTML
 * @returns {string} - String with HTML tags removed
 */
export function stripHtml(html) {
  if (!html) return '';
  
  // Create a temporary element
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Return the text content
  return doc.body.textContent || '';
}

/**
 * Format a date string
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format options
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} text - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated string
 */
export function truncateText(text, length = 300) {
  if (!text) return '';
  if (text.length <= length) return text;
  
  // Truncate and add ellipsis
  return text.substring(0, length) + '...';
}

/**
 * Convert search results to CSV format
 * @param {Array} data - Array of search results
 * @param {string} type - Type of data ('articles' or 'trials')
 * @returns {string} - CSV data
 */
export function convertToCSV(data, type) {
  if (!data || !data.length) return '';
  
  let csvContent = '';
  let headers = [];
  
  // Define headers based on data type
  if (type === 'articles') {
    headers = ['Title', 'Authors', 'Published Date', 'Link', 'Summary'];
  } else if (type === 'trials') {
    headers = ['Title', 'Status', 'Published Date', 'Link', 'Summary'];
  } else {
    return '';
  }
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    let row = [];
    
    if (type === 'articles') {
      // Format authors
      const authors = item.authors && item.authors.length 
        ? item.authors.map(a => `${a.given_name || ''} ${a.family_name || ''}`).join('; ')
        : '';
      
      row = [
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${authors.replace(/"/g, '""')}"`,
        item.published_date ? formatDate(item.published_date) : '',
        `"${item.link || ''}"`,
        `"${stripHtml(item.summary || '').replace(/"/g, '""')}"`
      ];
    } else if (type === 'trials') {
      row = [
        `"${(item.title || '').replace(/"/g, '""')}"`,
        item.status || item.overall_status || '',
        item.published_date || item.last_update_posted ? formatDate(item.published_date || item.last_update_posted) : '',
        `"${item.link || item.url || (item.nct_id ? `https://clinicaltrials.gov/study/${item.nct_id}` : '')}"`,
        `"${stripHtml(item.summary || item.brief_summary || '').replace(/"/g, '""')}"`
      ];
    }
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
}

/**
 * Download data as a CSV file
 * @param {string} csvContent - CSV content
 * @param {string} fileName - File name
 */
export function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Clean ORCID identifier by removing URL prefix
 * @param {string} orcid - ORCID identifier or URL
 * @returns {string} - Clean ORCID identifier
 */
export function cleanOrcid(orcid) {
  if (!orcid) return '';
  
  // Remove https://orcid.org/ prefix if present
  if (orcid.includes('orcid.org/')) {
    return orcid.split('orcid.org/')[1];
  }
  
  // Remove any other common URL prefixes
  if (orcid.startsWith('http://') || orcid.startsWith('https://')) {
    const url = new URL(orcid);
    return url.pathname.replace('/', '');
  }
  
  return orcid.trim();
}

/**
 * Validate ORCID format
 * @param {string} orcid - ORCID identifier
 * @returns {boolean} - True if valid ORCID format
 */
export function isValidOrcid(orcid) {
  if (!orcid) return false;
  
  // Clean the ORCID first
  const cleanedOrcid = cleanOrcid(orcid);
  
  // ORCID format: 0000-0000-0000-0000 (4 groups of 4 digits separated by dashes)
  // The last digit can be X
  const orcidPattern = /^\d{4}-\d{4}-\d{4}-(\d{3}[\dX])$/;
  
  return orcidPattern.test(cleanedOrcid);
}

/**
 * Format an ORCID value into a clickable URL
 * Accepts raw IDs (0000-0000-0000-0000) or full/partial URLs and
 * always returns a URL like https://orcid.org/0000-0000-0000-0000
 * @param {string} orcid - ORCID identifier or URL
 * @returns {string} - Formatted ORCID profile URL, or empty string if missing
 */
export function formatOrcidUrl(orcid) {
  if (!orcid) return '';
  const id = cleanOrcid(orcid);
  if (!id) return '';
  return `https://orcid.org/${id}`;
}
