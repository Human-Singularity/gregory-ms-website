import React, { useEffect, useRef } from 'react';

/**
 * BadgeExplanation component - Uses Hugo partial content as single source of truth
 * This component expects the badge explanation content to be available either:
 * 1. As a server-rendered element with data-badge-explanation attribute
 * 2. Or will fetch it from a dedicated endpoint
 * @returns {JSX.Element} - BadgeExplanation component
 */
export function BadgeExplanation() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Method 1: Look for Hugo-rendered content with data attribute
    const preRenderedContent = document.querySelector('[data-badge-explanation-content]');
    
    if (preRenderedContent) {
      // Use the content that Hugo has already rendered
      containerRef.current.innerHTML = preRenderedContent.innerHTML;
      return;
    }

    // Method 2: Look for existing badge explanation on the page
    const existingBadgeExplanation = document.querySelector('.badge-explanation');
    
    if (existingBadgeExplanation) {
      // Clone the existing content to avoid moving it
      const clonedContent = existingBadgeExplanation.cloneNode(true);
      containerRef.current.appendChild(clonedContent);
      return;
    }

    // Method 3: If we're in a pure SPA context, try to fetch the content
    // This would require an endpoint that returns just the partial content
    fetchBadgeExplanationContent()
      .then(content => {
        if (containerRef.current) {
          containerRef.current.innerHTML = content;
        }
      })
      .catch(error => {
        console.warn('Could not load badge explanation content:', error);
        // Show a message or fallback content
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p>Badge explanation content is loading...</p>';
        }
      });
  }, []);

  // Function to fetch badge explanation content from Hugo
  const fetchBadgeExplanationContent = async () => {
    // This would hit an endpoint that serves just the badge-explanation partial
    // You could create a page template that renders only the partial
    const response = await fetch('/partials/badge-explanation/');
    if (!response.ok) {
      throw new Error('Failed to fetch badge explanation content');
    }
    return response.text();
  };

  return <div ref={containerRef} className="badge-explanation-container"></div>;
}

export default BadgeExplanation;
