import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatNumber, generateAuthorURL } from '../utils.jsx';

/**
 * AuthorRanking component - Displays a high score ranking table of authors
 * Shows top 10 authors by article count for a given subject and team
 */
export function AuthorRanking() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fixed team and subject IDs as specified in requirements
  const teamId = 1;
  const subjectId = 1;

  useEffect(() => {
    fetchAuthors();
  }, []);

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
        format: 'json',
        timeframe: 'year'
      });

      const response = await axios.get(`https://api.gregory-ms.com/authors/?${params.toString()}`);

      // Take only the top 10 authors
      const authors = response.data.results || [];
      setAuthors(authors.slice(0, 20));
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };



  // Helper function to get the appropriate article count based on timeframe
  const getArticleCount = (author) => {    
    return author.articles_count || author.article_count || 0;
  };

  // Helper function to generate a generic avatar based on initials
  const generateAvatarUrl = (author) => {
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
                  Top 10 authors by article count - This Year
                </p>
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
                  <th scope="col" style={{ width: '120px' }}>
                    Articles

                      <small className="d-block text-muted" style={{ fontWeight: 'normal', fontSize: '0.75rem' }}>
                        (this year)
                      </small>

                  </th>
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
                      <a
                        href={generateAuthorURL(author)}
                        className="d-inline-block"
                        title={`View ${author.full_name || `${author.given_name} ${author.family_name}`}'s profile`}
                        data-umami-event={`click--author-avatar-${author.author_id}`}
                        data-umami-event-name={author.full_name || `${author.given_name} ${author.family_name}`}
                        data-umami-event-id={author.author_id}
                      >
                        <img
                          src={generateAvatarUrl(author)}
                          alt={`${author.full_name} avatar`}
                          className="rounded-circle shadow-sm"
                          width="48"
                          height="48"
                          style={{ objectFit: 'cover', cursor: 'pointer' }}
                        />
                      </a>
                    </td>
                    <td>
                      <div>
                        <a
                          href={generateAuthorURL(author)}
                          className="text-decoration-underline fw-semibold text-primary"
                          data-umami-event={`click--author-name-${author.author_id}`}
                          data-umami-event-name={author.full_name || `${author.given_name} ${author.family_name}`}
                          data-umami-event-id={author.author_id}
                        >
                          {author.full_name || `${author.given_name} ${author.family_name}`}
                        </a>
                        {author.ORCID && (
                          <div className="text-muted small mt-1">
                            <i className="fab fa-orcid mr-2"></i>
                            ORCID: {author.ORCID}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success fs-6 px-3 py-2">
                        <i className="fas fa-file-alt mr-2"></i>
                        {formatNumber(getArticleCount(author))}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">
                        <i className="fas fa-globe mr-2"></i>
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
                        <div className="mr-3">
                          <span className="badge bg-secondary fs-6 px-3 py-2 mb-2">
                            #{index + 1}
                          </span>
                          <a
                            href={generateAuthorURL(author)}
                            className="d-block"
                            title={`View ${author.full_name || `${author.given_name} ${author.family_name}`}'s profile`}
                            data-umami-event={`click--author-mobile-avatar-${author.author_id}`}
                            data-umami-event-name={author.full_name || `${author.given_name} ${author.family_name}`}
                            data-umami-event-id={author.author_id}
                          >
                            <img
                              src={generateAvatarUrl(author)}
                              alt={`${author.full_name} avatar`}
                              className="rounded-circle shadow-sm d-block"
                              width="60"
                              height="60"
                              style={{ objectFit: 'cover', cursor: 'pointer' }}
                            />
                          </a>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-2">
                            <a
                              href={generateAuthorURL(author)}
                              className="text-decoration-underline fw-semibold text-primary"
                              data-umami-event={`click--author-mobile-name-${author.author_id}`}
                              data-umami-event-name={author.full_name || `${author.given_name} ${author.family_name}`}
                              data-umami-event-id={author.author_id}
                            >
                              {author.full_name || `${author.given_name} ${author.family_name}`}
                            </a>
                          </h6>
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="badge bg-success">
                              <i className="fas fa-file-alt mr-2"></i>
                              {formatNumber(getArticleCount(author))} articles
                            </span>
                            {author.country && (
                              <span className="badge bg-light text-dark">
                                <i className="fas fa-globe mr-2"></i>
                                {author.country}
                              </span>
                            )}
                          </div>
                          {author.ORCID && (
                            <div className="text-muted small">
                              <i className="fab fa-orcid mr-2"></i>
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
            <>
            Showing top {authors.length} authors ranked by number of published articles for this year
                <br />
                <em className="text-warning">
                  Note: Total articles are based on our research keywords for Multiple Sclerosis and not the full range of publications by the authors.
                </em>
              </>
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
