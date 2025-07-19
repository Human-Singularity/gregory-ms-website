import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { renderMarkdown, truncateText } from '../utils/markdown';

/**
 * Source component - Displays a single source as a table row with expandable description
 * @param {object} props - Component props
 * @param {object} props.source - Source data
 * @returns {JSX.Element} - Source component
 */
export function Source({ source }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!source) return null;

  const getSourceTypeIcon = (sourceFor) => {
    switch (sourceFor?.toLowerCase()) {
      case 'science paper':
        return 'fas fa-flask';
      case 'trials':
        return 'fas fa-user-md';
      default:
        return 'fas fa-link';
    }
  };

  const getSourceTypeBadgeColor = (sourceFor) => {
    switch (sourceFor?.toLowerCase()) {
      case 'science paper':
        return 'badge-info';
      case 'trials':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  // Check if description is long enough to need expansion
  const needsExpansion = source.description && source.description.length > 200;
  const displayDescription = needsExpansion && !isExpanded 
    ? truncateText(source.description, 200)
    : source.description;

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <tr className="source-row">
        <td className="align-middle">
          <div className="d-flex align-items-center">
            <i className={`${getSourceTypeIcon(source.source_for)} mr-2 text-primary`}></i>
            <span className={`badge ${getSourceTypeBadgeColor(source.source_for)} text-white font-weight-normal`}>
              {source.source_for || 'Source'}
            </span>
          </div>
        </td>
        <td className="align-middle">
          <div className="source-name">
            {source.link ? (
              <a 
                href={source.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-decoration-none font-weight-semibold"
                data-umami-event="click--source-external"
                data-umami-event-source={source.name}
                data-umami-event-type={source.source_for}
              >
                {source.name} <i className="fas fa-external-link-alt ml-1"></i>
              </a>
            ) : (
              <span className="font-weight-semibold">{source.name}</span>
            )}
          </div>
        </td>
        <td className="align-middle">
          {source.description ? (
            <div className="source-description">
              <div 
                className="description-content"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(displayDescription) 
                }}
              />
              
              {/* Expand/Collapse Button */}
              {needsExpansion && (
                <button
                  className="btn btn-link btn-sm p-0 text-primary mt-1"
                  onClick={toggleExpansion}
                  data-umami-event="click--source-expand"
                  data-umami-event-source={source.name}
                  data-umami-event-expanded={isExpanded}
                >
                  <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} mr-1`}></i>
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          ) : (
            <span className="text-muted">No description available</span>
          )}
        </td>
        <td className="align-middle text-center">
          {source.link && (
            <a 
              href={source.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
              data-umami-event="click--source-visit"
              data-umami-event-source={source.name}
            >
              <i className="fas fa-external-link-alt mr-1"></i>
              Visit
            </a>
          )}
        </td>
      </tr>
    </>
  );
}

Source.propTypes = {
  source: PropTypes.shape({
    source_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    source_for: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    subject_id: PropTypes.number,
    team_id: PropTypes.number,
  }).isRequired,
};

export default Source;
