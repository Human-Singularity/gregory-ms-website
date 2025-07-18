/**
 * CategoryCard component - Displays a category card with name and description
 */
import React from 'react';

/**
 * CategoryCard component
 * @param {Object} props - Component props
 * @param {Object} props.category - Category object with slug, name, and description
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
        <p className="card-text text-muted flex-grow-1">{category.description}</p>
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
