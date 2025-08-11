import React from 'react';
import { formatNumber } from '../utils.jsx';
import { formatOrcidUrl } from '../utils/searchUtils';

/**
 * AuthorListItem component - Displays a single author in search results
 * @param {Object} props - Component props
 * @param {Object} props.author - Author data
 * @param {boolean} props.isSearchResult - Whether this is a search result
 * @returns {JSX.Element} - AuthorListItem component
 */
function AuthorListItem({ author, isSearchResult = false }) {
  if (!author) return null;

  // Create the author profile URL
  const authorUrl = `/authors/${author.author_id}/`;

  return (
    <div className="list-group-item list-group-item-action author-item">
      <div className="d-flex w-100 justify-content-between align-items-start">
        <div className="author-info flex-grow-1">
          <h5 className="mb-2">
            <a 
              href={authorUrl} 
              className="text-primary text-decoration-none"
              data-umami-event={isSearchResult ? `click--search-author-result-${author.author_id}` : `click--author-link-${author.author_id}`}
              data-umami-event-id={author.author_id}
              data-umami-event-name={author.full_name}
            >
              {author.full_name}
            </a>
          </h5>
          
          <div className="author-details">
            <div className="row">
              <div className="col-md-8">
                <p className="mb-1 text-muted">
                  <i className="fas fa-user mr-2"></i>
                  {author.given_name} {author.family_name}
                </p>
                
                {author.country && (
                  <p className="mb-1 text-muted">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {author.country}
                  </p>
                )}
                
        {author.ORCID && (
                  <p className="mb-1">
                    <i className="fab fa-orcid mr-2 text-success"></i>
                    <a 
          href={formatOrcidUrl(author.ORCID)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-success"
                      data-umami-event={`click--external-orcid-${author.author_id}`}
                      data-umami-event-author={author.full_name}
                      data-umami-event-id={author.author_id}
                    >
                      {author.ORCID}
                    </a>
                  </p>
                )}
              </div>
              
              <div className="col-md-4 text-md-right">
                <div className="author-stats">
                  <span className="badge badge-primary badge-pill mb-2">
                    <i className="fas fa-file-alt mr-1"></i>
                    {formatNumber(author.articles_count)} articles
                  </span>
                  
                  <div className="mt-2">
                    <a 
                      href={authorUrl} 
                      className="btn btn-sm btn-primary"
                      data-umami-event={isSearchResult ? `click--search-author-profile-${author.author_id}` : `click--author-profile-${author.author_id}`}
                      data-umami-event-id={author.author_id}
                      data-umami-event-name={author.full_name}
                    >
                      <i className="fas fa-user-circle mr-1"></i>
                      View Profile
                    </a>
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

export default AuthorListItem;
