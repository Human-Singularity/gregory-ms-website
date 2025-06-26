import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleList from './ArticleList';
import DownloadButton from './DownloadButton';
import { removeSpecifiedNodes } from '../utils';

/**
 * AuthorProfile component - Displays author information and their articles
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
      <div className="author-info mb-4">
        <div><strong>Author ID</strong>: {author.author_id}</div>
        <div><strong>Articles Count</strong>: {author.articles_count}</div>
        {author.ORCID && (
          <div>
            <strong>ORCID</strong>: 
            <a 
              href={author.ORCID} 
              target='_blank' 
              rel='noreferrer'
            >
              {author.ORCID}
            </a>
          </div>
        )}
      </div>
      
      <DownloadButton
        apiEndpoint={`https://api.gregory-ms.com/articles/author/${authorId}/`}
      />
      
      <ArticleList
        type="author"
        pagePath={`/articles/author/${authorId}`}
        options={{ authorId }}
        displayAsList={true}
      />
    </div>
  );
}

export default AuthorProfile;
