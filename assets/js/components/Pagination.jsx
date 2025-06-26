import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable pagination component
 * @param {object} props - Component props
 * @param {string} props.pagePath - Base path for pagination links
 * @param {number} props.page - Current page number
 * @param {number} props.lastPage - Last page number
 * @param {function} props.setPage - Function to set the page
 * @returns {JSX.Element} - Pagination component
 */
export function Pagination({ pagePath, page, lastPage, setPage }) {
  const navigate = useNavigate();
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > lastPage) return;
    
    setPage(newPage);
    
    if (pagePath) {
      navigate(`${pagePath}/page/${newPage}`);
    }
  };

  // Don't render pagination if there's only one page
  if (lastPage <= 1) return null;

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination pagination-primary m-4 d-flex justify-content-center">
        {/* First page button */}
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button 
            onClick={() => handlePageChange(1)} 
            className="page-link" 
            aria-label="Go to the first page"
            disabled={page === 1}
          >
            <span aria-hidden="true">
              <i className="fa fa-angle-double-left" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        
        {/* Previous page button */}
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button 
            onClick={() => handlePageChange(page - 1)} 
            className="page-link" 
            aria-label="Go to previous page"
            disabled={page === 1}
          >
            <span aria-hidden="true">
              <i className="fa fa-angle-left" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        
        {/* Page numbers */}
        {page > 2 && (
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => handlePageChange(page - 2)}
            >
              {page - 2}
            </button>
          </li>
        )}
        
        {page > 1 && (
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => handlePageChange(page - 1)}
            >
              {page - 1}
            </button>
          </li>
        )}
        
        {/* Current page */}
        <li className="page-item active">
          <button className="page-link">
            {page}
          </button>
        </li>
        
        {/* Next pages */}
        {page < lastPage && (
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </button>
          </li>
        )}
        
        {page < lastPage - 1 && (
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => handlePageChange(page + 2)}
            >
              {page + 2}
            </button>
          </li>
        )}
        
        {/* Ellipsis if needed */}
        {page < lastPage - 2 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        
        {/* Last page if not already visible */}
        {page < lastPage - 2 && (
          <li className="page-item">
            <button 
              className="page-link" 
              onClick={() => handlePageChange(lastPage)}
            >
              {lastPage}
            </button>
          </li>
        )}
        
        {/* Next page button */}
        <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
          <button 
            onClick={() => handlePageChange(page + 1)} 
            className="page-link" 
            aria-label="Go to next page"
            disabled={page === lastPage}
          >
            <span aria-hidden="true">
              <i className="fa fa-angle-right" aria-hidden="true"></i>
            </span>
          </button>
        </li>
        
        {/* Last page button */}
        <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
          <button 
            onClick={() => handlePageChange(lastPage)} 
            className="page-link" 
            aria-label="Go to the last page"
            disabled={page === lastPage}
          >
            <span aria-hidden="true">
              <i className="fa fa-angle-double-right" aria-hidden="true"></i>
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  pagePath: PropTypes.string,
  page: PropTypes.number.isRequired,
  lastPage: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired
};

export default Pagination;
