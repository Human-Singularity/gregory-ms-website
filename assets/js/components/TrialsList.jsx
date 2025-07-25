import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useTrials } from '../hooks/useApi';
import Pagination from './Pagination';
import TrialListItem from './TrialListItem';

/**
 * TrialsList component - Displays a list of clinical trials with pagination
 * @param {object} props - Component props
 * @param {string} props.type - Type of trials to fetch ('all', 'category')
 * @param {object} props.options - Additional options for the API call
 * @returns {JSX.Element} - TrialsList component
 */
export function TrialsList({
  type = 'all',
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
    <div className="trials-list-container" role="region" aria-label="Clinical trials">
      {lastPage > 1 && (
        <div className="d-flex justify-content-center my-4">
          <Pagination 
            currentPage={page}
            totalPages={lastPage}
            onPageChange={setPage}
            size="medium"
            className="mb-0"
          />
        </div>
      )}
      
      <div className="list-group article-list">
        {trials.map((trial) => (
          <TrialListItem key={trial.trial_id || trial.nct_id || trial.id} trial={trial} />
        ))}
      </div>
      
      {lastPage > 1 && (
        <div className="d-flex justify-content-center my-4">
          <Pagination 
            currentPage={page}
            totalPages={lastPage}
            onPageChange={setPage}
            size="medium"
            className="mb-0"
          />
        </div>
      )}
    </div>
  );
}

TrialsList.propTypes = {
  type: PropTypes.oneOf(['all', 'category']),
  options: PropTypes.object
};

export default TrialsList;
