/**
 * AuthorsList component - Displays a list of top authors for a specific category
 */
import React, { useState, useEffect } from 'react';
import { formatOrcidUrl } from '../utils/searchUtils';
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
  const [topCountries, setTopCountries] = useState([]);

  // Load authors when tab becomes active (lazy loading)
  useEffect(() => {
    if (isActive && !hasInitialized) {
      loadAuthors();
      setHasInitialized(true);
    }
  }, [isActive, hasInitialized, category.slug]);

  // Helper function to fetch a specific category by ID using proper endpoints
  const fetchSpecificCategory = async (categoryId) => {
    console.log(`Fetching specific category with ID ${categoryId}...`);
    
    try {
      // Use the categories list endpoint with category_id filter (now that the API bug is fixed)
      console.log(`Using categories API with category_id filter...`);
      
      const response = await axios.get(`${config.API_URL}/categories/`, {
        params: {
          category_id: categoryId,
          team_id: config.TEAM_ID,
          format: 'json',
          include_authors: 'true',
          max_authors: 20,
          sort_by: 'articles_count',
          order: 'desc'
        }
      });
      
      console.log(`Categories API response:`, response.data);
      
      // Should now return only the specific category
      const categoryData = response.data.results?.[0];
      if (categoryData && categoryData.id == categoryId) {
        console.log(`Found category:`, categoryData);
        return categoryData;
      } else {
        console.log(`Category ${categoryId} not found or unexpected response format`);
        throw new Error(`Category ${categoryId} not found in API response`);
      }
      
    } catch (err) {
      console.log(`Categories API failed:`, err.response?.status, err.message);
      throw err;
    }
  };

  // Load authors data
  const loadAuthors = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading authors for category:', category.slug, 'ID:', category.id);
      
      // Try to get the specific category directly by ID
      const categoryData = await fetchSpecificCategory(category.id);
      
      if (categoryData && categoryData.top_authors) {
        const authors = categoryData.top_authors.slice(0, 20) || []; // Ensure we only get top 20
        
        console.log('Found authors for category:', authors.length);
        setAuthors(authors);
        setTotalCount(authors.length);
        calculateTopCountries(authors);
      } else if (categoryData && !categoryData.top_authors) {
        console.log('Category found but no top_authors field available');
        throw new Error('Category found but no author data available - the API may not include author data for this category');
      } else {
        console.log('Category not found in API response');
        throw new Error('Category not found in API response');
      }
      
    } catch (err) {
      console.error('Error loading authors:', err);
      
      // If the categories API fails, try the authors API with category filtering
      if (err.response && (err.response.status === 400 || err.response.status === 404 || err.response.status === 500)) {
        console.log('Categories API failed with status:', err.response.status);
        try {
          console.log('Trying authors API with category_slug filtering...');
          
          // Fallback to authors API with category_slug filtering (this should be safer)
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
          
          console.log('Authors API fallback response:', fallbackResponse.data);
          const authors = fallbackResponse.data.results?.slice(0, 20) || [];
          
          if (authors.length > 0) {
            setAuthors(authors);
            setTotalCount(authors.length);
            calculateTopCountries(authors);
            
            // Show a notice that we're using fallback data
            setError('Using fallback data source for authors (some features may be limited)');
            return; // Success with fallback
          } else {
            throw new Error('No authors found for this category');
          }
          
        } catch (fallbackErr) {
          console.error('Authors API fallback also failed:', fallbackErr);
          // Don't try to fetch all authors - that would be too dangerous with 9000+ records
        }
      }
      
      // Set final error message without trying dangerous fallbacks
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
      setTopCountries([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate top countries from authors data
  const calculateTopCountries = (authorsData) => {
    const countryCount = {};
    const countryStats = {};

    // Count authors by country and sum their articles
    authorsData.forEach(author => {
      const country = author.country || 'Not specified';
      const articlesCount = author.articles_count || author.article_count || 0;
      
      if (!countryCount[country]) {
        countryCount[country] = 0;
        countryStats[country] = { authorsCount: 0, totalArticles: 0 };
      }
      
      countryCount[country]++;
      countryStats[country].authorsCount++;
      countryStats[country].totalArticles += articlesCount;
    });

    // Convert to array and sort by number of authors (then by total articles)
    const sortedCountries = Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        authorsCount: stats.authorsCount,
        totalArticles: stats.totalArticles
      }))
      .sort((a, b) => {
        // Sort by number of authors first, then by total articles
        if (b.authorsCount !== a.authorsCount) {
          return b.authorsCount - a.authorsCount;
        }
        return b.totalArticles - a.totalArticles;
      })
      .slice(0, 10); // Get top 10 countries

    setTopCountries(sortedCountries);
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
          <p className="mt-3 text-muted">Loading authors for {category.name}, this will take a while...</p>
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
                        data-umami-event={`click--author-${(author.author_slug || author.slug || author.author_id)}`}
                        data-umami-event-name={author.full_name || author.name}
                        data-umami-event-id={author.author_id}
                      >
                        <strong>{author.full_name || author.name}</strong>
                      </a>
                      {author.ORCID && (
                        <a 
                          href={formatOrcidUrl(author.ORCID)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2"
                          title="View ORCID Profile"
                          data-umami-event={`click--orcid-${(author.author_slug || author.slug || author.author_id)}`}
                          data-umami-event-name={author.full_name || author.name}
                          data-umami-event-id={author.author_id}
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

          {/* Top Countries Table */}
          {authors.length > 0 && topCountries.length > 0 && (
            <div className="mt-5">
              <h5 className="mb-3">
                <i className="fas fa-globe mr-2 text-info"></i>
                Top Countries by Research Activity
              </h5>
              <p className="text-muted mb-3">
                Countries ranked by number of contributing authors in {category.name} research
              </p>
              
              <table className="table table-striped table-hover table-sm">
                <thead className="thead-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Country</th>
                    <th scope="col">Authors</th>
                    <th scope="col">Total Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {topCountries.map((countryData, index) => (
                    <tr key={countryData.country}>
                      <th scope="row" className="text-muted">{index + 1}</th>
                      <td>
                        <strong>{countryData.country}</strong>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {countryData.authorsCount}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {countryData.totalArticles}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuthorsList;
