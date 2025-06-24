import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useArticle } from '../hooks/useApi';
import { formatDate, updateTitleAndMeta, removeSpecifiedNodes } from '../utils';

/**
 * SingleArticle component - Displays a single article
 * @returns {JSX.Element} - SingleArticle component
 */
export function SingleArticle() {
  const { articleId, articleSlug } = useParams();
  const { article, loading, error } = useArticle(articleId);

  // Update document title and meta tags when article loads
  useEffect(() => {
    if (article) {
      updateTitleAndMeta(article);
      removeSpecifiedNodes();
      
      // Update canonical link
      const canonicalLink = document.querySelector("link[rel='canonical']");
      const shortLink = `https://gregory-ms.com/articles/${article.article_id}/${articleSlug || ''}`;

      if (canonicalLink) {
        canonicalLink.href = shortLink;
      } else {
        const linkElement = document.createElement("link");
        linkElement.rel = "canonical";
        linkElement.href = shortLink;
        document.head.appendChild(linkElement);
      }
    }
  }, [article, articleSlug]);

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
        <h4>Error loading article</h4>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="alert alert-warning">
        Article not found.
      </div>
    );
  }

  const date = new Date(article.published_date);

  return (
    <>
      <span id="article" className="anchor"></span>
      <div className="row">
        <div className="col-md-8 ml-auto mr-auto">
          <h3 className="title">{article.title}</h3>
          <p>
            <strong>Published:</strong> {formatDate(date)}
            {article.container_title && (
              <> | <strong>Source:</strong> {article.container_title}</>
            )}
          </p>
          
          {article.takeaways && (
            <div className="article-takeaways mb-4">
              <h4>Key Takeaways</h4>
              <p>{article.takeaways}</p>
            </div>
          )}
          
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          
          {article.link && (
            <p className="mt-4">
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                Read Original Article <i className="fas fa-external-link-alt"></i>
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default SingleArticle;
