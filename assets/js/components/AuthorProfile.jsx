import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleList from './ArticleList';
import ArticleListItem from './ArticleListItem';
import AuthorArticleChart from './AuthorArticleChart';
import DownloadButton from './DownloadButton';
import Pagination from './Pagination';
import { removeSpecifiedNodes, formatNumber } from '../utils.jsx';

/**
 * AuthorProfile component - Displays author information, chart, and their articles
 * @returns {JSX.Element} - AuthorProfile component
 */
export function AuthorProfile() {
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(10);
  const { authorId } = useParams();
  const fetchedRef = useRef(null); // Track which author we've already fetched

  // Fallback to get authorId from URL if useParams doesn't work
  const getAuthorId = () => {
    if (authorId && /^\d+$/.test(authorId)) return authorId;
    
    // Try to get from URL path for /authors/123/ pattern - only numeric IDs
    const path = window.location.pathname;
    const match = path.match(/\/authors\/(\d+)\/?$/);
    if (match) return match[1];
    
    // Legacy: Try to get from query parameter (for backward compatibility)
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    if (queryId && /^\d+$/.test(queryId)) return queryId;
    
    return null;
  };

  const currentAuthorId = useMemo(() => getAuthorId(), [authorId]);

  useEffect(() => {
    let isMounted = true;
    let currentFetch = null; // Track the current fetch operation
    
    console.log('🔄 useEffect triggered for authorId:', currentAuthorId);
    console.log('🔄 fetchedRef.current:', fetchedRef.current);
    
    if (!currentAuthorId) {
      console.log('❌ No authorId provided');
      setError(new Error('No author ID provided'));
      setLoading(false);
      return;
    }
    
    // Check if we're already fetching or have fetched this author
    if (fetchedRef.current === currentAuthorId && author) {
      console.log('⚠️ Already fetched author:', currentAuthorId, 'and have data');
      setLoading(false); // Make sure loading is false if we already have data
      return;
    }
    
    setLoading(true);
    setError(null); // Clear any previous errors
    
    async function fetchData() {
      console.log('fetchData called with authorId:', currentAuthorId);
      
      // Double check - prevent duplicate fetches for the same author
      if (fetchedRef.current === currentAuthorId) {
        console.log('Data already fetched for author:', currentAuthorId, '- skipping API call');
        if (isMounted) setLoading(false);
        return;
      }

      try {
        console.log('Making API call for author:', currentAuthorId);
        fetchedRef.current = currentAuthorId; // Mark as being fetched BEFORE the API call
        
        // Fetch author details
        const authorUrl = `https://api.gregory-ms.com/authors/?author_id=${currentAuthorId}&format=json`;
        console.log('Making request to:', authorUrl);
        
        let authorResponse;
        
        try {
          console.log('🚀 Starting fetch request...');
          const response = await fetch(authorUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Explicitly set CORS mode
          });
          
          console.log('📡 Fetch response received');
          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const authorData = await response.json();
          console.log('📦 JSON data parsed:', authorData);
          
          // Create an axios-like response object for compatibility
          authorResponse = {
            data: authorData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          };
          
          console.log('✅ API request successful!');
          console.log('Response status:', authorResponse.status);
          console.log('Response data:', authorResponse.data);
          
        } catch (apiError) {
          console.error('❌ API request failed:', apiError);
          console.error('Error name:', apiError.name);
          console.error('Error message:', apiError.message);
          console.error('Error stack:', apiError.stack);
          throw apiError; // Re-throw to be caught by outer catch
        }
        
        console.log('🔍 About to check isMounted:', isMounted);
        if (!isMounted) {
          console.log('⚠️ Component unmounted, returning early');
          fetchedRef.current = null; // Reset so it can be fetched again if component remounts
          return;
        }
        
        console.log('🔍 About to process response...');
        console.log('Author API response status:', authorResponse.status);
        console.log('Author API response data:', authorResponse.data);
        console.log('Response data type:', typeof authorResponse.data);
        console.log('Is response data array?', Array.isArray(authorResponse.data));
        
        // Handle the response - it might be an array or a single object
        let authorData;
        if (Array.isArray(authorResponse.data)) {
          // If it's an array, take the first result
          console.log('Response is array with length:', authorResponse.data.length);
          authorData = authorResponse.data[0];
        } else if (authorResponse.data.results && Array.isArray(authorResponse.data.results)) {
          // If it's a paginated response with results array
          console.log('Response has results array with length:', authorResponse.data.results.length);
          authorData = authorResponse.data.results[0];
        } else {
          // If it's a direct object
          console.log('Response is direct object');
          authorData = authorResponse.data;
        }
        
        console.log('🔍 Final processed author data:', authorData);
        console.log('🔍 Author data type:', typeof authorData);
        console.log('🔍 Author data details:', JSON.stringify(authorData, null, 2));
        
        if (!authorData) {
          console.error('❌ No author data found after processing response');
          throw new Error('Author not found in API response');
        }
        
        console.log('🎯 About to setAuthor with:', authorData);
        setAuthor(authorData);
        console.log('✅ setAuthor completed');
        
        // Fetch all articles for this author by paginating through all pages
        let allArticles = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore && isMounted) {
          const articlesResponse = await axios.get(`https://api.gregory-ms.com/articles/?author_id=${currentAuthorId}&format=json&page=${page}`);
          const pageResults = articlesResponse.data.results || [];
          allArticles = [...allArticles, ...pageResults];
          
          // Check if there are more pages
          hasMore = articlesResponse.data.next !== null;
          page++;
        }
        
        if (isMounted) {
          setArticles(allArticles);
          setLoading(false);
          
          // Update document title and header
          const fullName = authorData.full_name || 
                          authorData.name || 
                          `${authorData.given_name || ''} ${authorData.family_name || ''}`.trim() ||
                          'Unknown Author';
          
          document.title = `${fullName} Multiple Sclerosis Research`;
          const h1 = document.querySelector('h1');
          if (h1) {
            h1.textContent = fullName;
          }
          
          // Remove specified nodes from the page
          removeSpecifiedNodes();
        }
      } catch (err) {
        console.error('API Error details:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        if (isMounted) {
          fetchedRef.current = null; // Reset on error so we can retry
          
          // More specific error handling
          if (err.response?.status === 404) {
            setError(new Error(`Author with ID ${currentAuthorId} was not found in our database.`));
          } else if (err.response?.status >= 400 && err.response?.status < 500) {
            setError(new Error(`Invalid request: ${err.response?.data?.detail || err.message}`));
          } else if (err.response?.status >= 500) {
            setError(new Error('Server error. Please try again later.'));
          } else {
            setError(new Error(`Failed to load author: ${err.message}`));
          }
          
          setLoading(false);
        } else {
          console.log('⚠️ Component unmounted during error handling');
          fetchedRef.current = null; // Reset so it can be retried
        }
      }
    }

    // Only fetch if we haven't already fetched this author
    currentFetch = fetchData();

    return () => {
      console.log('🧹 Cleanup function called');
      isMounted = false;
      // Don't reset fetchedRef here - let it persist across remounts
      // fetchedRef will be reset if there's an error or unmount during fetch
    };
  }, [currentAuthorId]);

  const generateAvatarUrl = (author) => {
    // Generate a generic avatar based on initials
    const givenName = author.given_name || author.first_name || '';
    const familyName = author.family_name || author.last_name || '';
    const fullName = author.full_name || author.name || '';
    
    let initials = '';
    if (givenName && familyName) {
      initials = `${givenName[0] || ''}${familyName[0] || ''}`.toUpperCase();
    } else if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        initials = `${nameParts[0][0] || ''}${nameParts[nameParts.length - 1][0] || ''}`.toUpperCase();
      } else {
        initials = (nameParts[0] && nameParts[0][0]) ? nameParts[0][0].toUpperCase() : 'A';
      }
    } else {
      initials = 'A';
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=007bff&color=fff&size=120&rounded=true`;
  };

  // Pagination calculations
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to articles section
    const articlesSection = document.querySelector('.articles-section');
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="sr-only">Loading author profile...</span>
          </div>
        </div>
        <h5 className="text-muted">Loading author profile...</h5>
        <p className="text-muted mb-0">Please wait while we fetch the author information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        <div className="mb-3">
          <i className="fas fa-exclamation-triangle fa-3x"></i>
        </div>
        <h4>Error Loading Author Profile</h4>
        <p>Unable to load the author profile. Please try again later.</p>
        <small className="text-muted">{error.message}</small>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="alert alert-warning text-center">
        <div className="mb-3">
          <i className="fas fa-user-slash fa-3x"></i>
        </div>
        <h4>Author Not Found</h4>
        <p>The requested author could not be found in our database.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="author-profile">
            {/* Author Header Section */}
            <div className="row mb-5">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body py-4">
                    <div className="row align-items-center">
                      <div className="col-lg-8 col-md-7">
                        <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start">
                          <div className="mb-3 mb-sm-0 me-sm-4 text-center">
                            <img
                              src={generateAvatarUrl(author)}
                              alt={`${author.full_name || author.name || `${author.given_name || ''} ${author.family_name || ''}`.trim() || 'Unknown Author'} avatar`}
                              className="rounded-circle shadow"
                              width="120"
                              height="120"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="text-center text-sm-start flex-grow-1">
                            <h1 className="mb-3 display-6 text-primary">
                              {author.full_name || 
                               author.name || 
                               `${author.given_name || ''} ${author.family_name || ''}`.trim() ||
                               'Unknown Author'}
                            </h1>
                            <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-3 align-items-center mb-3">
                              <span className="badge bg-primary fs-6 px-3 py-2">
                                <i className="fas fa-file-alt mr-2"></i>
                                {formatNumber(author.articles_count)} Articles
                              </span>
                              {author.country && (
                                <span className="text-muted fs-6">
                                  <i className="fas fa-globe mr-2"></i>
                                  {author.country}
                                </span>
                              )}
                            </div>
                            {author.ORCID && (
                              <div className="text-muted mb-3">
                                <i className="fab fa-orcid mr-2"></i>
                                <a 
                                  href={author.ORCID}
                                  target='_blank' 
                                  rel='noreferrer'
                                  className="text-decoration-none text-muted"
                                  data-umami-event="click--author-orcid"
                                  data-umami-event-author={author.name}
                                >
                                  ORCID: {author.ORCID}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4 col-md-5 mt-4 mt-md-0">
                        <div className="text-center text-md-end">
                          <DownloadButton
                            apiEndpoint={`https://api.gregory-ms.com/articles/?author_id=${currentAuthorId}`}
                            className="btn btn-outline-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Publication Timeline Chart */}
            <div className="row mb-5">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light border-bottom-0">
                    <h3 className="mb-0 text-primary">
                      <i className="fas fa-chart-line mr-3"></i>
                      Publication Timeline
                    </h3>
                    <small className="text-muted">Monthly publication activity over time</small>
                  </div>
                  <div className="card-body">
                    <AuthorArticleChart authorId={currentAuthorId} articles={articles} />
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Section */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm articles-section">
                  <div className="card-header bg-light border-bottom-0">
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between">
                      <div>
                        <h3 className="mb-1 text-primary">
                          <i className="fas fa-file-alt mr-3"></i>
                          Published Articles
                        </h3>
                        <small className="text-muted">
                          {formatNumber(articles.length)} total articles
                          {articles.length > 0 && (
                            <span className="ms-2">
                              • Showing {indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, articles.length)} of {articles.length}
                            </span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-0">
                    {articles.length > 0 ? (
                      <>
                        <div className="list-group list-group-flush">
                          {currentArticles.map(article => (
                            <ArticleListItem 
                              key={article.article_id}
                              article={article}
                              isSearchResult={true}
                              showRelevanceIndicators={true}
                            />
                          ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="d-flex justify-content-center py-4 bg-light border-top">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={handlePageChange}
                              size="small"
                              className="mb-0"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">No articles found for this author.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorProfile;
