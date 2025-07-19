/**
 * AuthorsList component - Displays a list of top authors for a specific category
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * AuthorsList component
 * @param {Object} props - Component props
 * @param {Object} props.category - Category object with slug, name, and description
 * @param {Object} props.config - Configuration object with API_URL, TEAM_ID, SUBJECT_ID
 * @param {boolean} props.isActive - Whether this tab is currently active
 * @returns {JSX.Element} - AuthorsList component
 */
function AuthorsList({ category, config, isActive }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load authors when tab becomes active (lazy loading)
  useEffect(() => {
    if (isActive && !hasInitialized) {
      loadAuthors();
      setHasInitialized(true);
    }
  }, [isActive, hasInitialized, category.slug]);

  // Load authors data
  const loadAuthors = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading authors for category:', category.slug);
      
      // Use the correct enhanced categories API endpoint with category filtering
      const response = await axios.get(`${config.API_URL}/categories/`, {
        params: {
          category_id: category.id,
          team_id: config.TEAM_ID,
          format: 'json',
          include_authors: 'true',
          max_authors: 20, // Get top 20 authors
          sort_by: 'articles_count',
          order: 'desc'
        }
      });

      console.log('Categories API response:', response.data);

      // Extract the category data and its authors
      const categoryData = response.data.results?.find(cat => cat.id === category.id);
      if (categoryData && categoryData.top_authors) {
        const authors = categoryData.top_authors.slice(0, 20) || []; // Ensure we only get top 20
        
        setAuthors(authors);
        setTotalCount(authors.length);
      } else {
        throw new Error('Category not found or no author data available');
      }
      
    } catch (err) {
      console.error('Error loading authors:', err);
      
      // If the enhanced API is not available, try fallback approach
      if (err.response && (err.response.status === 400 || err.response.status === 500)) {
        try {
          console.log('Enhanced categories API not available, trying authors API...');
          
          // Fallback to authors API with category_slug filtering
          const fallbackResponse = await axios.get(`${config.API_URL}/authors/`, {
            params: {
              team_id: config.TEAM_ID,
              category_slug: category.slug,
              format: 'json',
              page: 1,
              page_size: 20, // Get top 20 authors
              ordering: '-article_count'
            }
          });
          
          const authors = fallbackResponse.data.results?.slice(0, 20) || [];
          setAuthors(authors);
          setTotalCount(authors.length);
          
          return; // Success with fallback
          
        } catch (fallbackErr) {
          console.error('Fallback authors API also failed:', fallbackErr);
          
          // If category filtering is not supported, show all top authors
          try {
            const allAuthorsResponse = await axios.get(`${config.API_URL}/authors/`, {
              params: {
                team_id: config.TEAM_ID,
                format: 'json',
                page: 1,
                page_size: 20, // Get top 20 authors
                ordering: '-article_count'
              }
            });
            
            const allAuthors = allAuthorsResponse.data.results?.slice(0, 20) || [];
            setAuthors(allAuthors);
            setTotalCount(allAuthors.length);
            
            // Show a notice that we're showing all authors instead of category-specific ones
            setError(`Showing all top authors (category-specific filtering will be available soon)`);
            return;
            
          } catch (finalErr) {
            console.error('All attempts failed:', finalErr);
          }
        }
      }
      
      // More detailed error message
      let errorMessage = 'Failed to load authors for this category';
      if (err.response) {
        errorMessage += ` (Status: ${err.response.status})`;
        if (err.response.data && err.response.data.detail) {
          errorMessage += `: ${err.response.data.detail}`;
        }
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      setAuthors([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !hasInitialized) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading authors...</span>
        </div>
        <p className="mt-3 text-muted">Loading authors for {category.name}, this will take a while...</p>
      </div>
    );
  }

  // Error state (but not for notices)
  if (error && !loading && !error.includes('category-specific filtering will be available soon')) {
    return (
      <div className="alert alert-danger">
        <h4>Error Loading Authors</h4>
        <p>{error}</p>
        <button 
          className="btn btn-outline-danger"
          onClick={() => loadAuthors()}
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="authors-list">
      {/* Show notice if we're displaying fallback data */}
      {error && error.includes('category-specific filtering will be available soon') && (
        <div className="alert alert-info mb-4">
          <i className="fas fa-info-circle mr-2"></i>
          {error}
        </div>
      )}
      
      {/* Loading State - Full screen loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading authors...</span>
          </div>
          <p className="mt-3 text-muted">Loading authors for {category.name}...</p>
        </div>
      ) : (
        <>
          {/* Header - Only show when not loading */}
          <div className="mb-4">
            <h4 className="mb-3">
              <i className="fas fa-users mr-2 text-primary"></i>
              Top Authors researching {category.name}
            </h4>
            
            {/* Stats section */}
            <p className="text-muted mb-3">
              {totalCount > 0 ? (
                <>
                  Showing top {Math.min(totalCount, 20)} authors by publication count
                </>
              ) : (
                'No authors found for this category'
              )}
            </p>
          </div>

          {/* Authors Table or Empty State */}
          {authors.length > 0 ? (
            <table className="table table-striped table-hover">
              <thead className="thead-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Author</th>
                  <th scope="col">Articles</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((author, index) => (
                  <tr key={author.author_id}>
                    <th scope="row" className="text-muted">{index + 1}</th>
                    <td>
                      <a 
                        href={`/authors/${author.author_slug || author.slug || author.author_id}/`}
                        className="text-decoration-none"
                        title="View author profile"
                      >
                        <strong>{author.full_name || author.name}</strong>
                      </a>
                      {author.ORCID && (
                        <a 
                          href={author.ORCID} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2"
                          title="View ORCID Profile"
                        >
                          <i className="fab fa-orcid text-success"></i>
                        </a>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {author.articles_count || author.article_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-users fa-3x mb-3"></i>
                <h5>No authors found</h5>
                <p>There are no authors with articles in the {category.name} category.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuthorsList;
