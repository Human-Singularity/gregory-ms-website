/**
 * CategoryCard component - Displays a category card with name and description
 */
import React from 'react';

/**
 * CategoryCard component
 * @param {Object} props - Component props
 * @param {Object} props.category - Category object with slug, name, description, and optional category_description
 * @param {Function} props.onSelect - Callback function when category is selected
 */
function CategoryCard({ category, onSelect }) {
  const handleClick = () => {
    onSelect(category);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(category);
    }
  };

  // Function to truncate description for card display
  const getTruncatedDescription = (category) => {
    // Use category_description if available, otherwise fall back to description
    const fullDescription = category.category_description || category.description || '';
    
    if (!fullDescription.trim()) {
      return '';
    }
    
    // Strip basic markdown formatting for clean card display
    let cleanDescription = fullDescription
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown links but keep the text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove markdown bold/italic
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Remove markdown code
      .replace(/`([^`]+)`/g, '$1')
      // Clean up multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .trim();
    
    // Truncate to approximately 100 characters, ending at word boundary
    if (cleanDescription.length <= 100) {
      return cleanDescription;
    }
    
    // Find the last space before 100 characters to avoid cutting words
    const truncated = cleanDescription.substring(0, 100);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  return (
    <div 
      className="card h-100 shadow-sm hover-shadow"
      onClick={handleClick}
      onKeyUp={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${category.name}`}
      data-umami-event="click--category-card"
      data-umami-event-category={category.name}
      data-umami-event-slug={category.slug}
    >
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-primary mb-2">{category.name}</h5>
        <p className="card-text text-muted flex-grow-1">{getTruncatedDescription(category)}</p>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-end">
            {category.tags && category.tags.length > 0 && (
              <div className="d-flex flex-wrap">
                  <span 
                    className="text-muted mr-2 small"
                  >
                    <i className="fa fa-tag mr-1"></i>
      {category.tags.join(', ')}
                  </span>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;
