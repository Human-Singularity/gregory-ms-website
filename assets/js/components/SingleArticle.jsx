import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useArticle } from '../hooks/useApi';
import { formatDate, updateTitleAndMeta, removeSpecifiedNodes } from '../utils';
import { 
  getMostRecentPredictions, 
  generatePredictionBadgeClassName, 
  formatAlgorithmName, 
  formatPredictionScore,
  generateBadgeTitle
} from '../utils/badge-utils';

/**
 * SingleArticle component - Displays a single article with improved readability
 * @returns {JSX.Element} - SingleArticle component
 */
export function SingleArticle() {
  const { articleId, articleSlug } = useParams();
  const { article, loading, error } = useArticle(articleId);

  // Update document title and meta tags when article loads
  useEffect(() => {
    if (article) {
      updateTitleAndMeta(article);
      
      // Remove elements that interfere with the reading experience
      removeSpecifiedNodes();
      
      // Remove the header for better focus on content
      const pageHeader = document.querySelector('.page-header');
      if (pageHeader) {
        pageHeader.style.display = 'none';
      }
      
      // Apply article reading container class to body
      document.body.classList.add('article-reading-page');
      
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
      
      // Inject full article content if present and not already rendered
      const articleContentElement = document.getElementById('article-content');
      if (articleContentElement && article.content && articleContentElement.innerHTML.trim() === '') {
        articleContentElement.innerHTML = article.content;
      }
      
      // Inject abstract if present and not already rendered
      const abstractElement = document.getElementById('abstract');
      if (abstractElement && article.summary && abstractElement.innerHTML.trim() === '') {
        abstractElement.innerHTML = article.summary;
      }
      
      // Render authors with ORCID links if available
      const authorsElement = document.getElementById('article-authors');
      if (authorsElement && article.authors && article.authors.length > 0) {
        // Clear any existing content
        authorsElement.innerHTML = '';
        
        // Create a formatted list of authors with ORCID links
        article.authors.forEach((author, index) => {
          const authorSpan = document.createElement('span');
          authorSpan.className = 'author-name';
          
          // Add author name
          const nameText = document.createTextNode(author.full_name || `${author.given_name} ${author.family_name}`);
          authorSpan.appendChild(nameText);
          
          // Add ORCID link if available
          if (author.ORCID) {
            const orcidLink = document.createElement('a');
            orcidLink.href = author.ORCID;
            orcidLink.className = 'author-orcid';
            orcidLink.target = '_blank';
            orcidLink.rel = 'noopener noreferrer';
            orcidLink.title = `ORCID: ${author.ORCID}`;
            
            const orcidIcon = document.createElement('i');
            orcidIcon.className = 'fab fa-orcid';
            orcidLink.appendChild(orcidIcon);
            
            authorSpan.appendChild(document.createTextNode(' '));
            authorSpan.appendChild(orcidLink);
          }
          
          // Add separator between authors
          if (index < article.authors.length - 1) {
            authorSpan.appendChild(document.createTextNode(', '));
          }
          
          authorsElement.appendChild(authorSpan);
        });
      }
      
      // Update publisher and container title (journal)
      const publisherElement = document.getElementById('article-publisher');
      if (publisherElement && article.publisher) {
        publisherElement.textContent = article.publisher;
      }
      
      const journalElement = document.getElementById('article-journal');
      if (journalElement && article.container_title) {
        journalElement.textContent = article.container_title;
      }
      
      // Update subjects/categories
      const subjectsElement = document.getElementById('article-subjects');
      if (subjectsElement && article.subjects && article.subjects.length > 0) {
        // Clear any existing content
        subjectsElement.innerHTML = '';
        
        article.subjects.forEach((subject, index) => {
          const subjectBadge = document.createElement('span');
          subjectBadge.className = 'badge badge-info';
          subjectBadge.textContent = subject.subject_name;
          subjectsElement.appendChild(subjectBadge);
        });
      }
      
      // Update sources
      const sourcesElement = document.getElementById('article-sources');
      if (sourcesElement && article.sources && article.sources.length > 0) {
        sourcesElement.textContent = article.sources.join(', ');
      }
      
      // Update clinical trials
      const trialsElement = document.getElementById('article-trials');
      if (trialsElement && article.clinical_trials && article.clinical_trials.length > 0) {
        // Clear any existing content
        trialsElement.innerHTML = '';
        
        article.clinical_trials.forEach(trial => {
          const trialLink = document.createElement('a');
          trialLink.href = `https://gregory-ms.com/trials/${trial.id}`;
          trialLink.textContent = trial.title || `Trial #${trial.id}`;
          trialLink.className = 'trial-link mr-2';
          trialsElement.appendChild(trialLink);
        });
      }
      
      // Update the rest of the standard fields
      const dataFields = [
        { id: 'article-id', value: article.article_id },
        { id: 'article-link', value: article.link, isLink: true },
        { id: 'article-doi', value: article.doi, isLink: true, prefix: 'https://doi.org/' },
        { id: 'article-published-date', value: article.published_date ? formatDate(article.published_date) : null },
        { id: 'article-discovery-date', value: article.discovery_date ? formatDate(article.discovery_date) : null },
        { id: 'article-relevant', value: article.relevant ? 'Yes' : 'No' },
        { id: 'article-access', value: article.access }
      ];
      
      dataFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && field.value) {
          if (field.isLink) {
            element.href = field.prefix ? field.prefix + field.value : field.value;
            element.textContent = field.value;
          } else {
            element.textContent = field.value;
          }
        }
      });
      
      // Update ML predictions
      const mlPredictionsElement = document.getElementById('article-ml-predictions');
      if (mlPredictionsElement && article.ml_predictions && article.ml_predictions.length > 0) {
        // Clear any existing content
        mlPredictionsElement.innerHTML = '';
        
        // Get the most recent predictions by algorithm
        const recentPredictions = getMostRecentPredictions(article);
        
        // Add ML prediction badges with standardized styles
        recentPredictions.forEach(prediction => {
          const badgeClassName = generatePredictionBadgeClassName(prediction);
          const badgeTitle = generateBadgeTitle(prediction);
          const algorithmName = formatAlgorithmName(prediction.algorithm);
          const score = formatPredictionScore(prediction.probability_score);
          
          const badge = document.createElement('span');
          badge.className = `badge m-1 p-2 ${badgeClassName}`;
          badge.title = badgeTitle;
          
          // Apply inline styles as a fallback
          if (prediction.probability_score >= 0.7) {
            badge.style.backgroundColor = '#007f5f';
            badge.style.color = '#ffffff';
          } else if (prediction.probability_score >= 0.3) {
            badge.style.backgroundColor = '#ff9500';
            badge.style.color = '#000000';
          } else {
            badge.style.backgroundColor = '#d00000';
            badge.style.color = '#ffffff';
          }
          
          const algorithmNameEl = document.createElement('strong');
          algorithmNameEl.textContent = algorithmName;
          
          badge.appendChild(algorithmNameEl);
          badge.appendChild(document.createTextNode(`: ${score}`));
          
          mlPredictionsElement.appendChild(badge);
        });
      }
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('article-reading-page');
    };
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
      <div className="alert alert-info">
        <h4>Article not found</h4>
        <p>The article you are looking for could not be found.</p>
      </div>
    );
  }

  return (
    <div className="article-reading-container">
      <article>
        <header>
          <h1 className="mb-3 mt-5 pt-5">{article.title}</h1>
          {article.subtitle && <h2 className="text-muted mb-4">{article.subtitle}</h2>}
          
          <div className="article-meta">
            <div className="article-meta-item">
              <i className="far fa-calendar-alt mr-1"></i>
              <time dateTime={article.published_date || article.date}>
                {formatDate(article.published_date || article.date)}
              </time>
            </div>
            {article.reading_time && (
              <div className="article-meta-item">
                <i className="far fa-clock mr-1"></i>
                <span>{article.reading_time} min read</span>
              </div>
            )}
            {article.container_title && (
              <div className="article-meta-item">
                <i className="far fa-newspaper mr-1"></i>
                <span>{article.container_title}</span>
              </div>
            )}
            {article.doi && (
              <div className="article-meta-item">
                <i className="fas fa-link mr-1"></i>
                <span>DOI: <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer">{article.doi}</a></span>
              </div>
            )}
            {article.publisher && (
              <div className="article-meta-item">
                <i className="fas fa-building mr-1"></i>
                <span>{article.publisher}</span>
              </div>
            )}
            {article.access && (
              <div className="article-meta-item">
                <i className="fas fa-lock-open mr-1"></i>
                <span>Access: {article.access}</span>
              </div>
            )}
          </div>
        </header>
        
        {/* Authors section with ORCID links */}
        {article.authors && article.authors.length > 0 && (
          <div className="article-authors">
            <h4><i className="fas fa-users mr-2"></i>Authors</h4>
            <div className="authors-list">
              {article.authors.map((author, index) => (
                <span key={author.author_id || index} className="author-item">
                  <span className="author-name">{author.full_name || `${author.given_name} ${author.family_name}`}</span>
                  {author.ORCID && (
                    <a href={author.ORCID} className="author-orcid ml-1" target="_blank" rel="noopener noreferrer" title={`ORCID: ${author.ORCID}`}>
                      <i className="fab fa-orcid"></i>
                    </a>
                  )}
                  {index < article.authors.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Takeaways section */}
        {article.takeaways && (
          <div className="article-takeaways">
            <h4><i className="fas fa-lightbulb mr-2"></i>Main Takeaways</h4>
            <p>{article.takeaways}</p>
          </div>
        )}
        
        {/* Abstract section */}
        {article.summary && (
          <div className="article-abstract" id="abstract">
            <h4>Abstract</h4>
            <div dangerouslySetInnerHTML={{ __html: article.summary }} />
          </div>
        )}
        
        {/* Main article content will be rendered from the server-side template or injected via JavaScript */}
        <div id="article-content" className="article-content">
          {article.content && (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          )}
        </div>
        
        {/* ML Predictions section */}
        {article.ml_predictions && article.ml_predictions.length > 0 && (
          <div className="article-ml-predictions mt-4">
            <h4><i className="fas fa-robot mr-2"></i>ML Relevance Predictions</h4>
            <div className="d-flex flex-wrap prediction-badges">
              {getMostRecentPredictions(article).map((prediction, index) => {
                const badgeClassName = generatePredictionBadgeClassName(prediction);
                const badgeTitle = generateBadgeTitle(prediction);
                const algorithmName = formatAlgorithmName(prediction.algorithm);
                const score = formatPredictionScore(prediction.probability_score);
                
                return (
                  <span 
                    key={index}
                    className={`badge m-1 p-2 ${badgeClassName}`} 
                    title={badgeTitle}
                  >
                  {algorithmName}: {score}
                  </span>
                );
              })}
            </div>
            <p className="text-muted mt-2 small">
              <i className="fas fa-info-circle mr-1"></i> Predictions represent the relevance score from our machine learning models.
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

export default SingleArticle;
