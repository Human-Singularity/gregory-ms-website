import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../utils';

/**
 * Trial component - Displays a single clinical trial
 * @param {object} props - Component props
 * @param {object} props.trial - Trial data
 * @returns {JSX.Element} - Trial component
 */
export function Trial({ trial }) {
  if (!trial) return null;

  const date = new Date(trial.published_date);
  
  return (
    <div className='col-md-6'>
      <div className="card card-plain card-blog">
        <div className="card-body">
          {formatDate(date)}
          <h4 className="card-title">
            <a 
              href={trial.link} 
              target="_blank" 
              rel="noopener noreferrer"
              data-umami-event="click--trial-external"
              data-umami-event-title={trial.title}
              data-umami-event-id={trial.trial_id}
            >
              {trial.title} <i className="fas fa-external-link-square-alt"></i>
            </a>
          </h4>
          <p className="card-description">
            {trial.takeaways}
          </p>
          <p className="author">
            <span className="badge badge-info text-white font-weight-normal">
              {trial.container_title}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

Trial.propTypes = {
  trial: PropTypes.shape({
    trial_id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    published_date: PropTypes.string.isRequired,
    takeaways: PropTypes.string,
    container_title: PropTypes.string,
    link: PropTypes.string
  }).isRequired
};

export default Trial;
