import React from 'react';
import PropTypes from 'prop-types';

/**
 * Source component - Displays a single source
 * @param {object} props - Component props
 * @param {object} props.source - Source data
 * @returns {JSX.Element} - Source component
 */
export function Source({ source }) {
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
        return 'badge-primary';
      case 'trials':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className='col-md-6 mb-4'>
      <div className="card card-plain h-100">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <i className={`${getSourceTypeIcon(source.source_for)} mr-2`}></i>
            <span className={`badge ${getSourceTypeBadgeColor(source.source_for)} text-white font-weight-normal`}>
              {source.source_for || 'Source'}
            </span>
          </div>
          
          <h4 className="card-title">
            {source.link ? (
              <a 
                href={source.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {source.name} <i className="fas fa-external-link-alt ml-1"></i>
              </a>
            ) : (
              source.name
            )}
          </h4>
          
          {source.description && (
            <p className="card-description text-muted">
              {source.description}
            </p>
          )}
          
          {!source.description && source.link && (
            <p className="card-description text-muted">
              External source for {source.source_for} data
            </p>
          )}
          
          <div className="mt-auto">
            <small className="text-muted">
              Source ID: {source.source_id}
            </small>
          </div>
        </div>
      </div>
    </div>
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
