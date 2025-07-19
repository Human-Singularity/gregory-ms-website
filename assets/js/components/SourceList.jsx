import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useSources } from '../hooks/useApi';
import Source from './Source';
import Pagination from './Pagination';

/**
 * SourceList component - Displays a list of sources with filtering and pagination
 * @param {object} props - Component props
 * @param {string} props.type - Type of sources to fetch ('all', 'science paper', 'trials')
 * @param {string} props.pagePath - Base path for pagination links
 * @param {object} props.options - Additional options for the API call
 * @returns {JSX.Element} - SourceList component
 */
export function SourceList({ 
  type = 'all', 
  pagePath = '/sources',
  options = {}
}) {
  // Get page number from URL params
  const { pageNumber } = useParams();
  const initialPage = pageNumber ? parseInt(pageNumber, 10) : 1;
  
  // Local state for filtering
  const [filterType, setFilterType] = useState(type);
  
  // Use the custom hook to fetch sources
  const { 
    sources, 
    loading, 
    error,
    totalCount,
    pagination: { page, lastPage, setPage }
  } = useSources(filterType, { ...options, initialPage });

  // Update page when URL changes
  useEffect(() => {
    if (pageNumber) {
      setPage(parseInt(pageNumber, 10));
    }
  }, [pageNumber, setPage]);

  // Handle filter change
  const handleFilterChange = (newType) => {
    setFilterType(newType);
    setPage(1); // Reset to first page when filter changes
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-3">Loading sources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Sources</h4>
        <p>There was an error loading the sources. Please try again later.</p>
        <hr />
        <p className="mb-0">
          <small>Error details: {error.message}</small>
        </p>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="text-muted">
          <i className="fas fa-search fa-3x mb-3"></i>
          <h4>No Sources Found</h4>
          <p>No sources match your current filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sources-list">
      {/* Filter Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Filter Sources</h5>
                <span className="badge badge-secondary">
                  {totalCount} source{totalCount !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="" role="group" aria-label="Source filters">
                <button
                  type="button"
                  className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterChange('all')}
                  data-umami-event="click--filter-all"
                >
                  <i className="fas fa-list mr-2"></i>All Sources
                </button>
                <button
                  type="button"
                  className={`btn ${filterType === 'science paper' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterChange('science paper')}
                  data-umami-event="click--filter-science-papers"
                >
                  <i className="fas fa-flask mr-2"></i>Science Papers
                </button>
                <button
                  type="button"
                  className={`btn ${filterType === 'trials' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterChange('trials')}
                  data-umami-event="click--filter-clinical-trials"
                >
                  <i className="fas fa-user-md mr-2"></i>Clinical Trials
                </button>
              </div>
              {filterType !== 'all' && (
                <p className="text-muted mb-0 mt-2">
                  <small>
                    <i className="fas fa-filter mr-1"></i>
                    Showing sources for: <strong>{filterType}</strong>
                  </small>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-striped table-hover sources-table">
              <thead className="thead-light">
                <tr>
                  <th scope="col" width="15%">Type</th>
                  <th scope="col" width="25%">Source Name</th>
                  <th scope="col" width="50%">Description</th>
                  <th scope="col" width="10%" className="text-center">Link</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <Source key={source.source_id} source={source} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <Pagination 
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="text-center text-muted">
            <small>
              Showing {sources.length} sources 
              {filterType !== 'all' && ` for ${filterType}`}
              {lastPage > 1 && ` (page ${page} of ${lastPage})`}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

SourceList.propTypes = {
  type: PropTypes.oneOf(['all', 'science paper', 'trials']),
  pagePath: PropTypes.string,
  options: PropTypes.object,
};

export default SourceList;
