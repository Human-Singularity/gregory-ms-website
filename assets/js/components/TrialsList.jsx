import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useTrials } from '../hooks/useApi';
import Pagination from './Pagination';
import Trial from './Trial';

/**
 * TrialsList component - Displays a list of clinical trials with pagination
 * @param {object} props - Component props
 * @param {string} props.type - Type of trials to fetch ('all', 'category')
 * @param {string} props.pagePath - Base path for pagination links
 * @param {object} props.options - Additional options for the API call
 * @returns {JSX.Element} - TrialsList component
 */
export function TrialsList({
  type = 'all',
  pagePath = '/trials',
  options = {}
}) {
  // Get page number from URL params
  const { pageNumber } = useParams();
  const initialPage = pageNumber ? parseInt(pageNumber, 10) : 1;
  
  // Use the custom hook to fetch trials
  const { 
    trials, 
    loading, 
    error, 
    pagination: { page, lastPage, setPage }
  } = useTrials(type, { ...options, initialPage });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error loading trials</h4>
        <p>{error.message}</p>
      </div>
    );
  }

  if (trials.length === 0) {
    return (
      <div className="alert alert-info">
        No clinical trials found.
      </div>
    );
  }

  return (
    <div className="trials-list-container">
      <div className="row">
        <div className="col-md-12">
          <Pagination 
            pagePath={pagePath}
            page={page}
            lastPage={lastPage}
            setPage={setPage}
          />
        </div>
        
        {trials.map((trial) => (
          <Trial key={trial.trial_id} trial={trial} />
        ))}
        
        <div className="col-md-12">
          <Pagination 
            pagePath={pagePath}
            page={page}
            lastPage={lastPage}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}

TrialsList.propTypes = {
  type: PropTypes.oneOf(['all', 'category']),
  pagePath: PropTypes.string,
  options: PropTypes.object
};

export default TrialsList;
