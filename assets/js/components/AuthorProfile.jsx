import React, { useEffect, useState } from 'react';
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

  // Fallback to get authorId from URL if useParams doesn't work
  const getAuthorId = () => {
    if (authorId) return authorId;
    
    // Try to get from URL path
    const path = window.location.pathname;
    const match = path.match(/\/articles\/author\/(\d+)/);
    if (match) return match[1];
    
    // Try to get from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };

  const currentAuthorId = getAuthorId();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      if (!currentAuthorId) {
        setError(new Error('No author ID provided'));
        setLoading(false);
        return;
      }

      try {
        // Fetch author details
        const authorResponse = await axios.get(`https://api.gregory-ms.com/authors/${currentAuthorId}/?format=json`);
        
        if (!isMounted) return;
        
        const authorData = authorResponse.data;
        setAuthor(authorData);
        
        // Fetch all articles for this author by paginating through all pages
        let allArticles = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore && isMounted) {
          const articlesResponse = await axios.get(`https://api.gregory-ms.com/articles/author/${currentAuthorId}/?format=json&page=${page}`);
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
          document.title = `${authorData.given_name} ${authorData.family_name} Multiple Sclerosis Research`;
          const h1 = document.querySelector('h1');
          if (h1) {
            h1.textContent = `${authorData.given_name} ${authorData.family_name}`;
          }
          
          // Remove specified nodes from the page
          removeSpecifiedNodes();
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    if (authorId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [currentAuthorId]);

  const generateAvatarUrl = (author) => {
    // Generate a generic avatar based on initials
    const initials = `${author.given_name?.[0] || ''}${author.family_name?.[0] || ''}`.toUpperCase();
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
                              alt={`${author.full_name || `${author.given_name} ${author.family_name}`} avatar`}
                              className="rounded-circle shadow"
                              width="120"
                              height="120"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="text-center text-sm-start flex-grow-1">
                            <h1 className="mb-3 display-6 text-primary">
                              {author.full_name || `${author.given_name} ${author.family_name}`}
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
                                  href={author.ORCID.startsWith('http') ? author.ORCID : `https://orcid.org/${author.ORCID}`}
                                  target='_blank' 
                                  rel='noreferrer'
                                  className="text-decoration-none text-muted"
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
                            apiEndpoint={`https://api.gregory-ms.com/articles/author/${currentAuthorId}/`}
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
                    <AuthorArticleChart authorId={authorId} articles={articles} />
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
