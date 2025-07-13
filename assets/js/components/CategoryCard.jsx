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
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${category.name}`}
    >
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-primary">{category.name}</h5>
        <p className="card-text text-muted flex-grow-1">{category.description}</p>
        <div className="mt-auto">
          <small className="text-muted">
            <i className="fa fa-flask mr-1"></i>
            Clinical Research
          </small>
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;
