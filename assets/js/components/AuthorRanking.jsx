import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatNumber } from '../utils.jsx';

/**
 * AuthorRanking component - Displays a high score ranking table of authors
 * Shows top 20 authors by article count for a given subject and team
 */
export function AuthorRanking() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'this_year', 'last_year', 'last_two_years'
  
  // Fixed team and subject IDs as specified in requirements
  const teamId = 1;
  const subjectId = 1;

  useEffect(() => {
    fetchAuthors();
  }, [timeframe]);

  const fetchAuthors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters for the correct endpoint
      const params = new URLSearchParams({
        team_id: teamId,
        subject_id: subjectId,
        sort_by: 'article_count',
        order: 'desc',
        format: 'json'
      });

      // Add timeframe filtering
      if (timeframe !== 'all') {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        if (timeframe === 'this_year') {
          params.append('timeframe', 'year');
        } else if (timeframe === 'last_year') {
          params.append('date_from', `${currentYear - 1}-01-01`);
          params.append('date_to', `${currentYear - 1}-12-31`);
        } else if (timeframe === 'last_two_years') {
          params.append('date_from', `${currentYear - 2}-01-01`);
          params.append('date_to', `${currentYear}-12-31`);
        }
      }

      console.log('Making API call to:', `https://api.gregory-ms.com/authors/?${params.toString()}`);
      
      const response = await axios.get(`https://api.gregory-ms.com/authors/?${params.toString()}`);

      // Take only the top 20 authors
      const authors = response.data.results || [];
      setAuthors(authors.slice(0, 20));
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'this_year':
        return 'This Year';
      case 'last_year':
        return 'Last Year';
      case 'last_two_years':
        return 'Last Two Years';
      default:
        return 'All Time';
    }
  };

  const generateAvatarUrl = (author) => {
    // Generate a generic avatar based on initials
    const initials = `${author.given_name?.[0] || ''}${author.family_name?.[0] || ''}`.toUpperCase();
    // Using a service like UI Avatars for consistent generic avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=007bff&color=fff&size=48&rounded=true`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="sr-only">Loading author rankings...</span>
          </div>
        </div>
        <h5 className="text-muted">Loading author rankings...</h5>
        <p className="text-muted mb-0">Please wait while we fetch the top authors.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        <div className="mb-3">
          <i className="fas fa-exclamation-triangle fa-3x"></i>
        </div>
        <h4>Error Loading Author Rankings</h4>
        <p>Unable to load author rankings. Please try again later.</p>
        <small className="text-muted">{error.message}</small>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="author-ranking">
            {/* Header Section */}
            <div className="row mb-4">
              <div className="col-lg-8 col-md-7 mb-3 mb-md-0">
                <h2 className="mb-2 text-primary">Top Authors Ranking</h2>
                <p className="text-muted mb-0 lead">
                  Top 20 authors by article count - {getTimeframeLabel()}
                </p>
              </div>
              <div className="col-lg-4 col-md-5 d-flex justify-content-md-end">
                <div className="dropdown w-100 w-md-auto">
                  <button
                    className="btn btn-outline-primary dropdown-toggle w-100 w-md-auto"
                    type="button"
                    id="timeframeDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-calendar-alt me-2"></i>
                    {getTimeframeLabel()}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="timeframeDropdown">
                    <li>
                      <button
                        className={`dropdown-item ${timeframe === 'all' ? 'active' : ''}`}
                        onClick={() => setTimeframe('all')}
                      >
                        <i className="fas fa-infinity me-2"></i>
                        All Time
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${timeframe === 'this_year' ? 'active' : ''}`}
                        onClick={() => setTimeframe('this_year')}
                      >
                        <i className="fas fa-calendar-year me-2"></i>
                        This Year
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${timeframe === 'last_year' ? 'active' : ''}`}
                        onClick={() => setTimeframe('last_year')}
                      >
                        <i className="fas fa-calendar-minus me-2"></i>
                        Last Year
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${timeframe === 'last_two_years' ? 'active' : ''}`}
                        onClick={() => setTimeframe('last_two_years')}
                      >
                        <i className="fas fa-calendar-week me-2"></i>
                        Last Two Years
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

      {authors.length === 0 ? (
        <div className="alert alert-info text-center">
          <div className="mb-3">
            <i className="fas fa-users fa-3x text-muted"></i>
          </div>
          <h5>No Authors Found</h5>
          <p>No authors found for the selected timeframe.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-responsive d-none d-lg-block">
            <table className="table table-striped table-hover shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th scope="col" style={{ width: '80px' }}>Rank</th>
                  <th scope="col" style={{ width: '60px' }}>Avatar</th>
                  <th scope="col">Author</th>
                  <th scope="col" style={{ width: '120px' }}>Articles</th>
                  <th scope="col" style={{ width: '120px' }}>Country</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author, index) => (
                  <tr key={author.author_id} className="align-middle">
                    <td>
                      <span className="badge bg-secondary fs-6 px-3 py-2">
                        #{index + 1}
                      </span>
                    </td>
                    <td>
                      <img
                        src={generateAvatarUrl(author)}
                        alt={`${author.full_name} avatar`}
                        className="rounded-circle shadow-sm"
                        width="48"
                        height="48"
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div>
                        <a
                          href={`/articles/author/${author.author_id}/`}
                          className="text-decoration-none fw-semibold text-primary"
                        >
                          {author.full_name || `${author.given_name} ${author.family_name}`}
                        </a>
                        {author.ORCID && (
                          <div className="text-muted small mt-1">
                            <i className="fab fa-orcid me-1"></i>
                            ORCID: {author.ORCID}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success fs-6 px-3 py-2">
                        <i className="fas fa-file-alt me-1"></i>
                        {formatNumber(author.articles_count || 0)}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        <i className="fas fa-globe me-1"></i>
                        {author.country || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="d-lg-none">
            <div className="row g-3">
              {authors.map((author, index) => (
                <div key={author.author_id} className="col-12">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <span className="badge bg-secondary fs-6 px-3 py-2 mb-2">
                            #{index + 1}
                          </span>
                          <img
                            src={generateAvatarUrl(author)}
                            alt={`${author.full_name} avatar`}
                            className="rounded-circle shadow-sm d-block"
                            width="60"
                            height="60"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-2">
                            <a
                              href={`/articles/author/${author.author_id}/`}
                              className="text-decoration-none fw-semibold text-primary"
                            >
                              {author.full_name || `${author.given_name} ${author.family_name}`}
                            </a>
                          </h6>
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="badge bg-success">
                              <i className="fas fa-file-alt me-1"></i>
                              {formatNumber(author.articles_count || 0)} articles
                            </span>
                            {author.country && (
                              <span className="badge bg-light text-dark">
                                <i className="fas fa-globe me-1"></i>
                                {author.country}
                              </span>
                            )}
                          </div>
                          {author.ORCID && (
                            <div className="text-muted small">
                              <i className="fab fa-orcid me-1"></i>
                              ORCID: {author.ORCID}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {authors.length > 0 && (
        <div className="mt-4 text-center text-muted">
          <small>
            Showing top {authors.length} authors ranked by number of published articles
            {timeframe !== 'all' && ` for ${getTimeframeLabel().toLowerCase()}`}
          </small>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorRanking;
