import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../utils';
import { stripHtml, truncateText } from '../utils/searchUtils';

/**
 * TrialListItem component - Displays a clinical trial in a list format
 * @param {object} props - Component props
 * @param {object} props.trial - Trial data
 * @param {boolean} props.isSearchResult - Whether this is being displayed in search results
 * @returns {JSX.Element} - TrialListItem component
 */
export function TrialListItem({ 
  trial, 
  isSearchResult = false 
}) {
  if (!trial) return null;

  const trialUrl = trial.link || trial.url || `https://clinicaltrials.gov/study/${trial.nct_id}`;
  const trialStatus = trial.status || trial.recruitment_status || trial.overall_status || 'Unknown Status';
  const isRecruiting = trialStatus === 'Recruiting' || trial.recruitment_status === 'Recruiting';
  
  return (
    <div className="list-group-item list-group-item-action flex-column align-items-start" role="article" aria-labelledby={`trial-title-${trial.trial_id || trial.nct_id || trial.id}`}>
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">
          <a 
            href={trialUrl}
            target="_blank" 
            rel="noopener noreferrer"
            id={`trial-title-${trial.trial_id || trial.nct_id || trial.id}`}
            data-umami-event={isSearchResult ? 'click--search-trial-result' : 'click--trial-link'}
            data-umami-event-id={trial.trial_id || trial.nct_id || trial.id}
            data-umami-event-title={trial.title || 'Unnamed Trial'}
            data-umami-event-status={trialStatus}
          >
            {trial.title || 'Unnamed Trial'}
          </a>
        </h5>
        <small className="text-muted publication-date" aria-label={`Last updated on ${formatDate(trial.published_date || trial.last_update_posted)}`}>
          {formatDate(trial.published_date || trial.last_update_posted)}
        </small>
      </div>
      
      <div className="article-metadata mb-2">
        {/* Trial Status */}
        <span 
          className={`badge ${isRecruiting ? 'badge-success' : 'badge-secondary'} mr-2`} 
          aria-label={`Trial status: ${trialStatus}`}
        >
          {trialStatus}
        </span>
        
        {/* Phase */}
        {trial.phase && (
          <span className="badge badge-journal mr-2" aria-label={`Trial phase: ${trial.phase}`}>
            {trial.phase}
          </span>
        )}
        
        {/* Location */}
        {trial.location && (
          <span className="badge badge-info mr-2" aria-label={`Location: ${trial.location}`}>
            {trial.location}
          </span>
        )}
      </div>
      
      {/* Sponsor/Organization */}
      {(trial.sponsor || trial.lead_sponsor) && (
        <p className="article-authors mb-1" aria-label="Trial sponsor">
          <small>
            <i className="fas fa-hospital mr-1" aria-hidden="true"></i>
            <strong>Sponsor:</strong> {trial.sponsor || trial.lead_sponsor}
          </small>
        </p>
      )}
      
      {/* Summary */}
      {(trial.summary || trial.brief_summary || trial.detailed_description) && (
        <p className="article-summary" aria-label="Trial summary">
          {truncateText(stripHtml(trial.summary || trial.brief_summary || trial.detailed_description), 300)}
        </p>
      )}
      
      {/* Links */}
      <div className="article-links">
        <small>
          <a 
            href={trialUrl}
            target="_blank" 
            rel="noopener noreferrer" 
            className="source-link"
            aria-label="View trial details (opens in new tab)"
          >
            <i className="fas fa-external-link-alt mr-1" aria-hidden="true"></i>
            View trial details
          </a>
        </small>
      </div>
    </div>
  );
}

TrialListItem.propTypes = {
  trial: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    trial_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nct_id: PropTypes.string,
    title: PropTypes.string,
    published_date: PropTypes.string,
    last_update_posted: PropTypes.string,
    status: PropTypes.string,
    recruitment_status: PropTypes.string,
    overall_status: PropTypes.string,
    phase: PropTypes.string,
    location: PropTypes.string,
    sponsor: PropTypes.string,
    lead_sponsor: PropTypes.string,
    summary: PropTypes.string,
    brief_summary: PropTypes.string,
    detailed_description: PropTypes.string,
    link: PropTypes.string,
    url: PropTypes.string
  }).isRequired,
  isSearchResult: PropTypes.bool
};

export default TrialListItem;
