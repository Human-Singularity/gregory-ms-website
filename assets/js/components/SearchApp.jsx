import React, { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';
import { stripHtml, truncateText, convertToCSV, downloadCSV, formatDate } from '../utils/searchUtils';
import ArticleListItem from './ArticleListItem';
import TrialListItem from './TrialListItem';

// Trial status options
const TRIAL_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Recruiting', label: 'Recruiting' },
  { value: 'Active, not recruiting', label: 'Active, not recruiting' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Not yet recruiting', label: 'Not yet recruiting' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Terminated', label: 'Terminated' },
  { value: 'Withdrawn', label: 'Withdrawn' },
  { value: 'Unknown status', label: 'Unknown status' }
];

// Search type options
const SEARCH_TYPE_OPTIONS = [
  { value: 'articles', label: 'Research Articles' },
  { value: 'trials', label: 'Clinical Trials' }
];

/**
 * SearchApp component - Main search application
 * @returns {JSX.Element} - SearchApp component
 */
function SearchApp() {
  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [trialStatus, setTrialStatus] = useState('');
  const [searchType, setSearchType] = useState('articles'); // Default to articles
  
  // Search results
  const [articleResults, setArticleResults] = useState([]);
  const [trialResults, setTrialResults] = useState([]);
  
  // Pagination
  const [articlePage, setArticlePage] = useState(1);
  const [trialPage, setTrialPage] = useState(1);
  const [articleCount, setArticleCount] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const [articleLastPage, setArticleLastPage] = useState(1);
  const [trialLastPage, setTrialLastPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('articles'); // Change default tab to match default search type
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    // Set active tab to match search type
    setActiveTab(searchType);
    
    try {
      if (searchType === 'articles') {
        // Prepare article search parameters
        const articleParams = {
          team_id: 1, // Team Gregory
          subject_id: 1, // Multiple Sclerosis
          page: articlePage
        };
        
        // Set search fields based on selection
        if (searchField === 'all' || searchField === 'title') {
          articleParams.title = searchTerm;
        }
        
        if (searchField === 'all' || searchField === 'summary') {
          articleParams.summary = searchTerm;
        }
        
        if (searchField === 'all') {
          articleParams.search = searchTerm;
          
          // Clear specific fields when using general search
          delete articleParams.title;
          delete articleParams.summary;
        }
        
        // Execute article search
        const articleResponse = await searchService.searchArticles(articleParams);
        console.log('Article response:', articleResponse);
        
        // Update article results
        setArticleResults(articleResponse.data.results || []);
        setArticleCount(articleResponse.data.count || 0);
        setArticleLastPage(Math.ceil((articleResponse.data.count || 0) / 10));
        
        // Reset trial results since we're only searching articles
        setTrialResults([]);
        setTrialCount(0);
        setTrialLastPage(1);
      } else {
        // Prepare trial search parameters
        const trialParams = {
          team_id: 1, // Team Gregory
          subject_id: 1, // Multiple Sclerosis
          page: trialPage,
          status: trialStatus
        };
        
        // Set search fields based on selection
        if (searchField === 'all' || searchField === 'title') {
          trialParams.title = searchTerm;
        }
        
        if (searchField === 'all' || searchField === 'summary') {
          trialParams.summary = searchTerm;
        }
        
        if (searchField === 'all') {
          trialParams.search = searchTerm;
          
          // Clear specific fields when using general search
          delete trialParams.title;
          delete trialParams.summary;
        }
        
        // Execute trial search
        const trialResponse = await searchService.searchTrials(trialParams);
        
        // Update trial results - handling the structured response format
        // The API returns an object with a results array, not directly an array
        console.log('Trial response:', trialResponse);
        
        // Check if the response contains results in the expected format
        if (trialResponse.data && trialResponse.data.results && Array.isArray(trialResponse.data.results)) {
          // Structured response with results array
          setTrialResults(trialResponse.data.results);
          setTrialCount(trialResponse.data.count || trialResponse.data.results.length || 0);
          setTrialLastPage(Math.ceil((trialResponse.data.count || trialResponse.data.results.length || 0) / 10));
        } else if (trialResponse.data && Array.isArray(trialResponse.data)) {
          // Direct array response
          setTrialResults(trialResponse.data);
          setTrialCount(trialResponse.data.length || 0);
          setTrialLastPage(Math.ceil((trialResponse.data.length || 0) / 10));
        } else {
          // Fallback for unexpected format
          setTrialResults([]);
          setTrialCount(0);
          setTrialLastPage(1);
          console.error('Unexpected trial response format:', trialResponse);
        }
        
        // Reset article results since we're only searching trials
        setArticleResults([]);
        setArticleCount(0);
        setArticleLastPage(1);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle article pagination
  const handleArticlePage = async (newPage) => {
    if (newPage < 1 || newPage > articleLastPage) return;
    
    setArticlePage(newPage);
    setIsLoading(true);
    
    try {
      // Prepare article search parameters
      const articleParams = {
        team_id: 1, // Team Gregory
        subject_id: 1, // Multiple Sclerosis
        page: newPage
      };
      
      // Set search fields based on selection
      if (searchField === 'all' || searchField === 'title') {
        articleParams.title = searchTerm;
      }
      
      if (searchField === 'all' || searchField === 'summary') {
        articleParams.summary = searchTerm;
      }
      
      if (searchField === 'all') {
        articleParams.search = searchTerm;
        
        // Clear specific fields when using general search
        delete articleParams.title;
        delete articleParams.summary;
      }
      
      // Execute article search
      const articleResponse = await searchService.searchArticles(articleParams);
      
      // Update article results
      setArticleResults(articleResponse.data.results || []);
    } catch (err) {
      console.error('Article pagination error:', err);
      setError('An error occurred while loading more article results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle trial pagination
  const handleTrialPage = async (newPage) => {
    if (newPage < 1 || newPage > trialLastPage) return;
    
    setTrialPage(newPage);
    setIsLoading(true);
    
    try {
      // Prepare trial search parameters
      const trialParams = {
        team_id: 1, // Team Gregory
        subject_id: 1, // Multiple Sclerosis
        page: newPage,
        status: trialStatus
      };
      
      // Set search fields based on selection
      if (searchField === 'all' || searchField === 'title') {
        trialParams.title = searchTerm;
      }
      
      if (searchField === 'all' || searchField === 'summary') {
        trialParams.summary = searchTerm;
      }
      
      if (searchField === 'all') {
        trialParams.search = searchTerm;
        
        // Clear specific fields when using general search
        delete trialParams.title;
        delete trialParams.summary;
      }
      
      // Execute trial search
      const trialResponse = await searchService.searchTrials(trialParams);
      
      // Update trial results based on the actual response structure
      if (trialResponse.data && trialResponse.data.results && Array.isArray(trialResponse.data.results)) {
        setTrialResults(trialResponse.data.results);
      } else if (trialResponse.data && Array.isArray(trialResponse.data)) {
        setTrialResults(trialResponse.data);
      } else {
        setTrialResults([]);
        console.error('Unexpected trial response format during pagination:', trialResponse);
      }
    } catch (err) {
      console.error('Trial pagination error:', err);
      setError('An error occurred while loading more trial results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export results to CSV
  const handleExport = async (type) => {
    let fileName;
    
    // Show loading state for export
    setIsLoading(true);
    
    try {
      if (type === 'articles') {
        // Prepare article search parameters for all results
        const articleParams = {
          team_id: 1, // Team Gregory
          subject_id: 1, // Multiple Sclerosis
          page: 1,
          page_size: articleCount // Request all results in one go
        };
        
        // Set search fields based on selection
        if (searchField === 'all' || searchField === 'title') {
          articleParams.title = searchTerm;
        }
        
        if (searchField === 'all' || searchField === 'summary') {
          articleParams.summary = searchTerm;
        }
        
        if (searchField === 'all') {
          articleParams.search = searchTerm;
          
          // Clear specific fields when using general search
          delete articleParams.title;
          delete articleParams.summary;
        }
        
        // Execute article search for all results
        const articleResponse = await searchService.searchArticles(articleParams);
        const allArticles = articleResponse.data.results || [];
        
        fileName = `gregory-ms-articles-search-${new Date().toISOString().slice(0, 10)}.csv`;
        const csvContent = convertToCSV(allArticles, type);
        downloadCSV(csvContent, fileName);
        
      } else if (type === 'trials') {
        // Prepare trial search parameters for all results
        const trialParams = {
          team_id: 1, // Team Gregory
          subject_id: 1, // Multiple Sclerosis
          page: 1,
          page_size: trialCount, // Request all results in one go
          status: trialStatus
        };
        
        // Set search fields based on selection
        if (searchField === 'all' || searchField === 'title') {
          trialParams.title = searchTerm;
        }
        
        if (searchField === 'all' || searchField === 'summary') {
          trialParams.summary = searchTerm;
        }
        
        if (searchField === 'all') {
          trialParams.search = searchTerm;
          
          // Clear specific fields when using general search
          delete trialParams.title;
          delete trialParams.summary;
        }
        
        // Execute trial search for all results
        const trialResponse = await searchService.searchTrials(trialParams);
        
        // Handle different response formats
        let allTrials = [];
        if (trialResponse.data && trialResponse.data.results && Array.isArray(trialResponse.data.results)) {
          allTrials = trialResponse.data.results;
        } else if (trialResponse.data && Array.isArray(trialResponse.data)) {
          allTrials = trialResponse.data;
        }
        
        fileName = `gregory-ms-trials-search-${new Date().toISOString().slice(0, 10)}.csv`;
        const csvContent = convertToCSV(allTrials, type);
        downloadCSV(csvContent, fileName);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('An error occurred while exporting the data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render result tabs - No longer needed since we're only showing one type
  const renderTabs = () => {
    if (!hasSearched) return null;
    
    return (
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{searchType === 'articles' ? 'Research Articles' : 'Clinical Trials'} ({searchType === 'articles' ? articleCount : trialCount})</h3>
        
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleExport(searchType)}
          disabled={(searchType === 'articles' ? !articleResults.length : !trialResults.length) || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
              Exporting...
            </>
          ) : (
            <>
              <i className="fas fa-file-download mr-1"></i>
              Export as CSV
            </>
          )}
        </button>
      </div>
    );
  };
  
  // Render pagination
  const renderPagination = (type) => {
    const page = type === 'articles' ? articlePage : trialPage;
    const lastPage = type === 'articles' ? articleLastPage : trialLastPage;
    const handlePage = type === 'articles' ? handleArticlePage : handleTrialPage;
    
    if (lastPage <= 1) return null;
    
    return (
      <nav aria-label="Page navigation">
        <ul className="pagination pagination-primary d-flex justify-content-center">
          {/* First page button */}
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button 
              onClick={() => handlePage(1)} 
              className="page-link" 
              aria-label="First page"
              disabled={page === 1}
            >
              <span aria-hidden="true">
                <i className="fa fa-angle-double-left" aria-hidden="true"></i>
              </span>
            </button>
          </li>
          
          {/* Previous page button */}
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button 
              onClick={() => handlePage(page - 1)} 
              className="page-link" 
              aria-label="Previous page"
              disabled={page === 1}
            >
              <span aria-hidden="true">
                <i className="fa fa-angle-left" aria-hidden="true"></i>
              </span>
            </button>
          </li>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
            let pageNum;
            
            if (lastPage <= 5) {
              // Show all pages if 5 or fewer
              pageNum = i + 1;
            } else if (page <= 3) {
              // Near start
              pageNum = i + 1;
            } else if (page >= lastPage - 2) {
              // Near end
              pageNum = lastPage - 4 + i;
            } else {
              // Middle
              pageNum = page - 2 + i;
            }
            
            return (
              <li 
                key={pageNum} 
                className={`page-item ${pageNum === page ? 'active' : ''}`}
              >
                <button 
                  onClick={() => handlePage(pageNum)} 
                  className="page-link"
                >
                  {pageNum}
                </button>
              </li>
            );
          })}
          
          {/* Next page button */}
          <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
            <button 
              onClick={() => handlePage(page + 1)} 
              className="page-link" 
              aria-label="Next page"
              disabled={page === lastPage}
            >
              <span aria-hidden="true">
                <i className="fa fa-angle-right" aria-hidden="true"></i>
              </span>
            </button>
          </li>
          
          {/* Last page button */}
          <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
            <button 
              onClick={() => handlePage(lastPage)} 
              className="page-link" 
              aria-label="Last page"
              disabled={page === lastPage}
            >
              <span aria-hidden="true">
                <i className="fa fa-angle-double-right" aria-hidden="true"></i>
              </span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  
  // Render article results
  const renderArticles = () => {
    if (!articleResults.length) {
      return <p>No articles found matching your search criteria.</p>;
    }
    
    return (
      <div className="article-results">        
        {renderPagination('articles')}
        
        <div className="list-group article-list">
          {articleResults.map((article) => (
            <ArticleListItem
              key={article.article_id}
              article={article}
              isSearchResult={true}
              showRelevanceIndicators={true}
            />
          ))}
        </div>
        
        {renderPagination('articles')}
      </div>
    );
  };
  
  // Render trial results
  const renderTrials = () => {
    if (!trialResults.length) {
      return <p>No clinical trials found matching your search criteria.</p>;
    }
    
    return (
      <div className="trial-results">        
        {renderPagination('trials')}
        
        <div className="list-group article-list">
          {trialResults.map((trial) => (
            <TrialListItem
              key={trial.id || trial.trial_id || trial.nct_id || Math.random().toString(36)}
              trial={trial}
              isSearchResult={true}
            />
          ))}
        </div>
        
        {renderPagination('trials')}
      </div>
    );
  };
  
  // Render search results
  const renderResults = () => {
    if (isLoading) {
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
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      );
    }
    
    if (!hasSearched) {
      return null;
    }
    
    // Check if there are no results for the selected type
    if ((searchType === 'articles' && articleCount === 0) || 
        (searchType === 'trials' && trialCount === 0)) {
      return (
        <div className="alert alert-info">
          <h4>No results found</h4>
          <p>Your search did not match any {searchType === 'articles' ? 'research articles' : 'clinical trials'}. Please try different keywords or filters.</p>
        </div>
      );
    }
    
    return (
      <div className="search-results">
        {renderTabs()}
        {searchType === 'articles' && renderArticles()}
        {searchType === 'trials' && renderTrials()}
      </div>
    );
  };
  
  return (
    <div className="search-app container mt-5">
      {/* Search Form Container - Centered */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Search Form Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h3 className="mb-0 text-primary">Search GregoryMS Database</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="form-group">
                      <label htmlFor="searchType">Search Type</label>
                      <select 
                        className="form-control"
                        id="searchType"
                        value={searchType}
                        onChange={(e) => {
                          setSearchType(e.target.value);
                          // Update active tab to match search type
                          setActiveTab(e.target.value);
                        }}
                      >
                        {SEARCH_TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-8 mb-3">
                    <div className="form-group">
                      <label htmlFor="searchTerm">Search Terms</label>
                      <input
                        type="text"
                        className="form-control"
                        id="searchTerm"
                        placeholder="Enter search terms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
            
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="form-group">
                      <label htmlFor="searchField">Search In</label>
                      <select 
                        className="form-control"
                        id="searchField"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                      >
                        <option value="all">All Fields</option>
                        <option value="title">Title Only</option>
                        <option value="summary">Abstract/Summary Only</option>
                      </select>
                    </div>
                  </div>
                  
                  {searchType === 'trials' && (
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="trialStatus">Trial Status</label>
                        <select 
                          className="form-control"
                          id="trialStatus"
                          value={trialStatus}
                          onChange={(e) => setTrialStatus(e.target.value)}
                        >
                          {TRIAL_STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
            
                <div className="text-center">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search mr-2"></i>
                        Search {searchType === 'articles' ? 'Articles' : 'Clinical Trials'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Results */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {renderResults()}
        </div>
      </div>
      
      {/* Search Tips - Now appears after results */}
      <div className="row justify-content-center mt-4">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h3 className="mb-0 text-primary">Search Tips</h3>
            </div>
            <div className="card-body">
              <p className="lead">Use this search tool to find relevant research articles or clinical trials related to Multiple Sclerosis.</p>
              
              <h5>Tips for effective searching:</h5>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> First, select whether you want to search for research articles or clinical trials</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> Use specific terms related to treatments, symptoms, or research topics</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> Try different spellings or related terms if you don't find what you're looking for</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> Use the field selector to search in titles only for more specific results</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> For clinical trials, you can filter by recruitment status to find active research opportunities</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> Export your results to CSV for offline reading or sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchApp;
