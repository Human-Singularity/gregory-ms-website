/**
 * Utility functions for the Gregory MS website
 */

/**
 * Generate a URL for an article
 * @param {object} article - Article object
 * @returns {string} - URL for the article
 */
export function generateArticleURL(article) {
  const articleId = article.article_id;
  const articleSlug = article.title
    .replace(/[^\w\s-]/g, '') // Remove non-word, non-space, non-hyphen characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase();
  
  return `/articles/${articleId}/${articleSlug}`;
}

/**
 * Format a date string to a human-readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  if (isNaN(Date.parse(date))) {
    throw new Error('Invalid date value');
  }
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-UK', options).format(dateObj);
}

/**
 * Update document title and meta tags based on article data
 * @param {object} article - Article object
 */
export function updateTitleAndMeta(article) {
  // Set canonical URL
  const canonicalURL = `https://gregory-ms.com/articles/${article.article_id}/`;
  let canonicalLinkElement = document.querySelector('link[rel="canonical"]');
  
  if (canonicalLinkElement) {
    // If a canonical link element already exists, update the href
    canonicalLinkElement.setAttribute('href', canonicalURL);
  } else {
    // If no canonical link element exists, create a new one
    canonicalLinkElement = document.createElement('link');
    canonicalLinkElement.setAttribute('rel', 'canonical');
    canonicalLinkElement.setAttribute('href', canonicalURL);
    document.head.appendChild(canonicalLinkElement);
  }
  
  // Update the <title> tag
  document.title = article.title;

  // Update the page title
  const titleElement = document.querySelector('h1.title');
  if (titleElement) {
    titleElement.textContent = article.title;
  }
  
  // Truncate the article takeaways for meta description (max 155 chars)
  const truncatedTakeaways = article.takeaways ? article.takeaways.slice(0, 155) : '';

  // Update the meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', truncatedTakeaways);
  }
  
  // Update Open Graph meta tags
  updateOpenGraphMeta(article);
}

/**
 * Update Open Graph meta tags based on article data
 * @param {object} article - Article object
 */
function updateOpenGraphMeta(article) {
  // Helper function to set or create a meta tag
  const setMetaTag = (property, content) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    
    if (metaTag) {
      metaTag.setAttribute('content', content);
    } else {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      metaTag.setAttribute('content', content);
      document.head.appendChild(metaTag);
    }
  };
  
  // Set OG meta tags
  setMetaTag('og:title', article.title);
  setMetaTag('og:type', 'article');
  setMetaTag('og:url', `https://gregory-ms.com/articles/${article.article_id}/`);
  
  if (article.takeaways) {
    setMetaTag('og:description', article.takeaways.slice(0, 155));
  }
}

/**
 * Remove specified nodes from the page
 * Used to clean up the page after React components are loaded
 */
export function removeSpecifiedNodes() {
  // Elements to remove, with fallbacks if selector changes
  const elementsToRemove = [
    // Header subtitle
    '#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > h2',
    'h2.subtitle',
    
    // Header link
    '#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > a',
    'a.header-link',
    
    // Source info
    'div#sourceinfo',
    
    // Metabase dashboard link
    'a#metabaseDashboard',
    'a.dashboard-link',

    // Title of relevant articles section
    '#relevant-research-title',
  ];

  // Remove each element if it exists
  elementsToRemove.forEach(selector => {
    const element = document.querySelector(selector);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
}
