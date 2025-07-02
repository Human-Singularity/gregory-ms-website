import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleList from './ArticleList';
import AuthorArticleChart from './AuthorArticleChart';
import DownloadButton from './DownloadButton';
import { removeSpecifiedNodes, formatNumber } from '../utils.jsx';

/**
 * AuthorProfile component - Displays author information, chart, and their articles
 * @returns {JSX.Element} - AuthorProfile component
 */
export function AuthorProfile() {
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authorId } = useParams();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        const response = await axios.get(`https://api.gregory-ms.com/authors/${authorId}/?format=json`);
        
        if (isMounted) {
          setAuthor(response.data);
          setLoading(false);
          
          // Update document title and header
          document.title = `${response.data.given_name} ${response.data.family_name} Multiple Sclerosis Research`;
          const h1 = document.querySelector('h1');
          if (h1) {
            h1.textContent = `${response.data.given_name} ${response.data.family_name}`;
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
  }, [authorId]);

  const generateAvatarUrl = (author) => {
    // Generate a generic avatar based on initials
    const initials = `${author.given_name?.[0] || ''}${author.family_name?.[0] || ''}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=007bff&color=fff&size=120&rounded=true`;
  };

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
        <h4>Error loading author profile</h4>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="alert alert-warning">
        Author not found.
      </div>
    );
  }

  return (
    <div className="author-profile">
      {/* Author Header Section */}
      <div className="row mb-5">
        <div className="col-md-8">
          <div className="d-flex align-items-center mb-4">
            <img
              src={generateAvatarUrl(author)}
              alt={`${author.full_name || `${author.given_name} ${author.family_name}`} avatar`}
              className="rounded-circle me-4"
              width="120"
              height="120"
              style={{ objectFit: 'cover' }}
            />
            <div>
              <h1 className="mb-2">
                {author.full_name || `${author.given_name} ${author.family_name}`}
              </h1>
              <div className="author-meta">
                <div className="d-flex flex-wrap gap-3 align-items-center mb-2">
                  <span className="badge bg-primary fs-6">
                    {formatNumber(author.articles_count)} Articles
                  </span>
                  {author.country && (
                    <span className="text-muted">
                      <i className="fas fa-globe me-1"></i>
                      {author.country}
                    </span>
                  )}
                </div>
                {author.ORCID && (
                  <div className="text-muted">
                    <strong>ORCID:</strong>{' '}
                    <a 
                      href={author.ORCID.startsWith('http') ? author.ORCID : `https://orcid.org/${author.ORCID}`}
                      target='_blank' 
                      rel='noreferrer'
                      className="text-decoration-none"
                    >
                      {author.ORCID}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 text-md-end">
          <DownloadButton
            apiEndpoint={`https://api.gregory-ms.com/articles/author/${authorId}/`}
          />
        </div>
      </div>

      {/* Publication Timeline Chart */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <AuthorArticleChart authorId={authorId} />
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="mb-0">Published Articles</h3>
            <small className="text-muted">
              {formatNumber(author.articles_count)} total articles
            </small>
          </div>
          
          <ArticleList
            type="author"
            pagePath={`/articles/author/${authorId}`}
            options={{ authorId }}
            displayAsList={true}
          />
        </div>
      </div>
    </div>
  );
}

export default AuthorProfile;
