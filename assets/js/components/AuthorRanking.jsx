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
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading author rankings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error Loading Author Rankings</h4>
        <p>Unable to load author rankings. Please try again later.</p>
        <small className="text-muted">{error.message}</small>
      </div>
    );
  }

  return (
    <div className="author-ranking">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Top Authors Ranking</h2>
          <p className="text-muted mb-0">
            Top 20 authors by article count - {getTimeframeLabel()}
          </p>
        </div>
        <div className="dropdown">
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            id="timeframeDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {getTimeframeLabel()}
          </button>
          <ul className="dropdown-menu" aria-labelledby="timeframeDropdown">
            <li>
              <button
                className={`dropdown-item ${timeframe === 'all' ? 'active' : ''}`}
                onClick={() => setTimeframe('all')}
              >
                All Time
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${timeframe === 'this_year' ? 'active' : ''}`}
                onClick={() => setTimeframe('this_year')}
              >
                This Year
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${timeframe === 'last_year' ? 'active' : ''}`}
                onClick={() => setTimeframe('last_year')}
              >
                Last Year
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${timeframe === 'last_two_years' ? 'active' : ''}`}
                onClick={() => setTimeframe('last_two_years')}
              >
                Last Two Years
              </button>
            </li>
          </ul>
        </div>
      </div>

      {authors.length === 0 ? (
        <div className="alert alert-info">
          <h5>No Authors Found</h5>
          <p>No authors found for the selected timeframe.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col" style={{ width: '80px' }}>Rank</th>
                <th scope="col" style={{ width: '60px' }}>Avatar</th>
                <th scope="col">Author</th>
                <th scope="col" style={{ width: '120px' }}>Articles</th>
                <th scope="col" style={{ width: '100px' }}>Country</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author, index) => (
                <tr key={author.author_id}>
                  <td>
                    <span className="badge bg-primary fs-6">
                      #{index + 1}
                    </span>
                  </td>
                  <td>
                    <img
                      src={generateAvatarUrl(author)}
                      alt={`${author.full_name} avatar`}
                      className="rounded-circle"
                      width="40"
                      height="40"
                      style={{ objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    <a
                      href={`/authors/${author.author_id}/`}
                      className="text-decoration-none fw-medium"
                    >
                      {author.full_name || `${author.given_name} ${author.family_name}`}
                    </a>
                    {author.ORCID && (
                      <div className="text-muted small">
                        ORCID: {author.ORCID}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-success fs-6">
                      {formatNumber(author.articles_count || 0)}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">
                      {author.country || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  );
}

export default AuthorRanking;
