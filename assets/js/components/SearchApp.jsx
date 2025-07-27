import React, { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';
import { stripHtml, truncateText, formatDate, cleanOrcid, isValidOrcid } from '../utils/searchUtils';
import { urlUtils } from '../utils/urlUtils';
import ArticleListItem from './ArticleListItem';
import TrialListItem from './TrialListItem';
import AuthorListItem from './AuthorListItem';
import Pagination from './Pagination';
import { DownloadButton } from './DownloadButton';

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
  { value: 'trials', label: 'Clinical Trials' },
  { value: 'authors', label: 'Authors' }
];

/**
 * SearchApp component - Main search application
 * @returns {JSX.Element} - SearchApp component
 */
function SearchApp() {
  // Initialize from URL parameters
  const initialParams = urlUtils.getSearchParams();
  
  // Search parameters
  const [searchTerm, setSearchTerm] = useState(initialParams.q);
  const [searchField, setSearchField] = useState(initialParams.field);
  const [trialStatus, setTrialStatus] = useState(initialParams.status);
  const [searchType, setSearchType] = useState(initialParams.type);
  const [orcidSearch, setOrcidSearch] = useState(initialParams.orcid);
  const [authorSearchType, setAuthorSearchType] = useState(initialParams.orcid ? 'orcid' : 'name');
  
  // Search results
  const [articleResults, setArticleResults] = useState([]);
  const [trialResults, setTrialResults] = useState([]);
  const [authorResults, setAuthorResults] = useState([]);
  
  // Pagination
  const [articlePage, setArticlePage] = useState(1);
  const [trialPage, setTrialPage] = useState(1);
  const [authorPage, setAuthorPage] = useState(1);
  const [articleCount, setArticleCount] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const [authorCount, setAuthorCount] = useState(0);
  const [articleLastPage, setArticleLastPage] = useState(1);
  const [trialLastPage, setTrialLastPage] = useState(1);
  const [authorLastPage, setAuthorLastPage] = useState(1);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialParams.type);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate input based on search type
    if (searchType === 'authors' && authorSearchType === 'orcid') {
      if (!orcidSearch.trim()) {
        setError('Please enter an ORCID identifier');
        return;
      }
    } else if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    // Track search submission with umami - use specific event names per type
    if (typeof umami !== 'undefined') {
      umami.track(`search-${searchType}`, {
        query: searchTerm.trim(),
        field: searchField,
        status: trialStatus || 'all'
      });
    }

    // Update URL parameters
    const urlParams = {
      type: searchType,
      page: 1
    };
    
    if (searchType === 'authors' && authorSearchType === 'orcid') {
      urlParams.orcid = cleanOrcid(orcidSearch);
    } else {
      urlParams.q = searchTerm;
      if (searchType !== 'authors') {
        urlParams.field = searchField;
      }
    }
    
    if (searchType === 'trials' && trialStatus) {
      urlParams.status = trialStatus;
    }
    
    urlUtils.updateSearchParams(urlParams);
    
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
        
        // Update article results
        setArticleResults(articleResponse.data.results || []);
        setArticleCount(articleResponse.data.count || 0);
        setArticleLastPage(Math.ceil((articleResponse.data.count || 0) / 10));
        
        // Track successful search result
        if (typeof umami !== 'undefined') {
          umami.track('search-articles-result', {
            query: searchTerm.trim(),
            field: searchField,
            resultCount: articleResponse.data.count || 0
          });
        }
        
        // Reset trial results since we're only searching articles
        setTrialResults([]);
        setTrialCount(0);
        setTrialLastPage(1);
        
        // Reset author results since we're only searching articles
        setAuthorResults([]);
        setAuthorCount(0);
        setAuthorLastPage(1);
      } else if (searchType === 'trials') {
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
        
        // Check if the response contains results in the expected format
        if (trialResponse.data && trialResponse.data.results && Array.isArray(trialResponse.data.results)) {
          // Structured response with results array
          setTrialResults(trialResponse.data.results);
          setTrialCount(trialResponse.data.count || trialResponse.data.results.length || 0);
          setTrialLastPage(Math.ceil((trialResponse.data.count || trialResponse.data.results.length || 0) / 10));
          
          // Track successful search result
          if (typeof umami !== 'undefined') {
            umami.track('search-trials-result', {
              query: searchTerm.trim(),
              field: searchField,
              status: trialStatus || 'all',
              resultCount: trialResponse.data.count || trialResponse.data.results.length || 0
            });
          }
        } else if (trialResponse.data && Array.isArray(trialResponse.data)) {
          // Direct array response
          setTrialResults(trialResponse.data);
          setTrialCount(trialResponse.data.length || 0);
          setTrialLastPage(Math.ceil((trialResponse.data.length || 0) / 10));
          
          // Track successful search result
          if (typeof umami !== 'undefined') {
            umami.track('search-trials-result', {
              query: searchTerm.trim(),
              field: searchField,
              status: trialStatus || 'all',
              resultCount: trialResponse.data.length || 0
            });
          }
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
        
        // Reset author results since we're only searching trials
        setAuthorResults([]);
        setAuthorCount(0);
        setAuthorLastPage(1);
      } else if (searchType === 'authors') {
        // Prepare author search parameters based on search type
        let authorResponse;
        
        if (authorSearchType === 'orcid') {
          // ORCID search - validate and clean ORCID first
          const cleanedOrcid = cleanOrcid(orcidSearch);
          
          if (!cleanedOrcid) {
            setError('Please enter an ORCID identifier');
            setIsLoading(false);
            return;
          }
          
          // Note: ORCID validation is relaxed to allow partial searches
          // Full validation: if (!isValidOrcid(cleanedOrcid)) { ... }
          
          // Use the ORCID-specific search method
          authorResponse = await searchService.searchAuthorsByOrcid({
            orcid: cleanedOrcid,
            page: authorPage
          });
        } else {
          // Name search - use the existing search method
          if (!searchTerm.trim()) {
            setError('Please enter an author name');
            setIsLoading(false);
            return;
          }
          
          const authorParams = {
            team_id: 1, // Team Gregory
            subject_id: 1, // Multiple Sclerosis
            page: authorPage,
            full_name: searchTerm // For authors, we search by full name
          };
          
          authorResponse = await searchService.searchAuthors(authorParams);
        }
        
        // Update author results - handle both response formats
        if (authorResponse.data && authorResponse.data.results && Array.isArray(authorResponse.data.results)) {
          setAuthorResults(authorResponse.data.results);
          setAuthorCount(authorResponse.data.count || authorResponse.data.results.length || 0);
          setAuthorLastPage(Math.ceil((authorResponse.data.count || authorResponse.data.results.length || 0) / 10));
          
          // Track successful search result
          if (typeof umami !== 'undefined') {
            umami.track('search-authors-result', {
              query: authorSearchType === 'orcid' ? cleanOrcid(orcidSearch) : searchTerm.trim(),
              searchType: authorSearchType,
              field: searchField,
              resultCount: authorResponse.data.count || authorResponse.data.results.length || 0
            });
          }
        } else if (authorResponse.data && Array.isArray(authorResponse.data)) {
          setAuthorResults(authorResponse.data);
          setAuthorCount(authorResponse.data.length || 0);
          setAuthorLastPage(Math.ceil((authorResponse.data.length || 0) / 10));
          
          // Track successful search result
          if (typeof umami !== 'undefined') {
            umami.track('search-authors-result', {
              query: authorSearchType === 'orcid' ? cleanOrcid(orcidSearch) : searchTerm.trim(),
              searchType: authorSearchType,
              field: searchField,
              resultCount: authorResponse.data.length || 0
            });
          }
        } else {
          setAuthorResults([]);
          setAuthorCount(0);
          setAuthorLastPage(1);
          console.error('Unexpected author response format:', authorResponse);
        }
        
        // Reset other results since we're only searching authors
        setArticleResults([]);
        setArticleCount(0);
        setArticleLastPage(1);
        setTrialResults([]);
        setTrialCount(0);
        setTrialLastPage(1);
      }

      // Track successful search with umami
      if (typeof umami !== 'undefined') {
        let resultCount = 0;
        if (searchType === 'articles') {
          resultCount = articleCount;
        } else if (searchType === 'trials') {
          resultCount = trialCount;
        } else if (searchType === 'authors') {
          resultCount = authorCount;
        }

        umami.track('search', {
          query: searchTerm.trim(),
          type: searchType,
          field: searchField,
          resultCount: resultCount,
          trialStatus: searchType === 'trials' ? trialStatus : null
        });
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
    
    // Track pagination with umami
    if (typeof umami !== 'undefined') {
      umami.track('search-pagination-articles', {
        page: newPage,
        query: searchTerm.trim(),
        field: searchField,
        totalPages: articleLastPage
      });
    }
    
    setArticlePage(newPage);
    setIsLoading(true);
    
    // Update URL parameters for pagination
    urlUtils.updateSearchParams({
      type: 'articles',
      q: searchTerm,
      field: searchField,
      page: newPage
    });
    
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
    
    // Track pagination with umami
    if (typeof umami !== 'undefined') {
      umami.track('search-pagination-trials', {
        page: newPage,
        query: searchTerm.trim(),
        status: trialStatus,
        totalPages: trialLastPage
      });
    }
    
    setTrialPage(newPage);
    setIsLoading(true);
    
    // Update URL parameters for pagination
    urlUtils.updateSearchParams({
      type: 'trials',
      q: searchTerm,
      status: trialStatus,
      page: newPage
    });
    
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
  
  // Handle author pagination
  const handleAuthorPage = async (newPage) => {
    if (newPage < 1 || newPage > authorLastPage) return;
    
    // Track pagination with umami
    if (typeof umami !== 'undefined') {
      umami.track('search-pagination-authors', {
        page: newPage,
        query: authorSearchType === 'orcid' ? cleanOrcid(orcidSearch) : searchTerm.trim(),
        searchType: authorSearchType,
        field: searchField,
        totalPages: authorLastPage
      });
    }
    
    setAuthorPage(newPage);
    setIsLoading(true);
    
    // Update URL parameters for pagination
    const urlParams = {
      type: 'authors',
      page: newPage
    };
    
    if (authorSearchType === 'orcid') {
      urlParams.orcid = cleanOrcid(orcidSearch);
    } else {
      urlParams.q = searchTerm;
      urlParams.field = searchField;
    }
    
    urlUtils.updateSearchParams(urlParams);
    
    try {
      let authorResponse;
      
      if (authorSearchType === 'orcid') {
        // ORCID search pagination
        authorResponse = await searchService.searchAuthorsByOrcid({
          orcid: cleanOrcid(orcidSearch),
          page: newPage
        });
      } else {
        // Name search pagination
        const authorParams = {
          team_id: 1, // Team Gregory
          subject_id: 1, // Multiple Sclerosis
          page: newPage,
          full_name: searchTerm // For authors, we search by full name
        };
        
        authorResponse = await searchService.searchAuthors(authorParams);
      }
      
      // Update author results based on the actual response structure
      if (authorResponse.data && authorResponse.data.results && Array.isArray(authorResponse.data.results)) {
        setAuthorResults(authorResponse.data.results);
      } else if (authorResponse.data && Array.isArray(authorResponse.data)) {
        setAuthorResults(authorResponse.data);
      } else {
        setAuthorResults([]);
        console.error('Unexpected author response format during pagination:', authorResponse);
      }
    } catch (err) {
      console.error('Author pagination error:', err);
      setError('An error occurred while loading more author results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-search on component mount if URL params exist
  useEffect(() => {
    if (initialParams.q || initialParams.orcid) {
      // Create a fake event object and trigger search
      const fakeEvent = { preventDefault: () => {} };
      handleSearch(fakeEvent);
    }
  }, []); // Empty dependency array to run only on mount
  
  // Render result tabs - No longer needed since we're only showing one type
  const renderTabs = () => {
    if (!hasSearched) return null;
    
    // Get the API base URL from the searchService
    const API_BASE_URL = typeof window !== 'undefined' && window.ENV_API_URL 
      ? window.ENV_API_URL 
      : 'https://api.gregory-ms.com';
    
    // Prepare API endpoint and search parameters based on current search
    const apiEndpoint = `${API_BASE_URL}${searchType === 'articles' ? '/articles/search/' : searchType === 'trials' ? '/trials/search/' : '/authors/search/'}`;
    
    // Build search parameters using the same logic as the actual search
    const searchParams = {
      team_id: 1, // Team Gregory
      subject_id: 1, // Multiple Sclerosis
    };
    
    if (searchType === 'authors') {
      if (authorSearchType === 'orcid') {
        searchParams.orcid = cleanOrcid(orcidSearch);
      } else {
        searchParams.full_name = searchTerm;
      }
    } else if (searchType === 'articles' || searchType === 'trials') {
      // Use the same parameter logic as the actual search
      if (searchField === 'all' || searchField === 'title') {
        searchParams.title = searchTerm;
      }
      
      if (searchField === 'all' || searchField === 'summary') {
        searchParams.summary = searchTerm;
      }
      
      if (searchField === 'all') {
        searchParams.search = searchTerm;
        // Clear specific fields when using general search (same as actual search logic)
        delete searchParams.title;
        delete searchParams.summary;
      }
      
      // Add proper ordering to ensure results match what users see in the UI
      searchParams.ordering = '-published_date';
      
      // Add trial status filter for trials
      if (searchType === 'trials' && trialStatus) {
        searchParams.status = trialStatus;
      }
    }
    
    // Generate a descriptive filename based on search type and date
    const fileName = `gregory-ms-${searchType}-search-${new Date().toISOString().slice(0, 10)}.csv`;
    
    return (
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{searchType === 'articles' ? 'Research Articles' : searchType === 'trials' ? 'Clinical Trials' : 'Authors'} ({searchType === 'articles' ? articleCount : searchType === 'trials' ? trialCount : authorCount})</h3>
        
        <DownloadButton
          apiEndpoint={apiEndpoint}
          fileName={fileName}
          searchParams={{
            ...searchParams,
            expectedCount: searchType === 'articles' ? articleCount : searchType === 'trials' ? trialCount : authorCount,
          }}
        />
      </div>
    );
  };
  
  // Render pagination
  const renderPagination = (type) => {
    const page = type === 'articles' ? articlePage : type === 'trials' ? trialPage : authorPage;
    const lastPage = type === 'articles' ? articleLastPage : type === 'trials' ? trialLastPage : authorLastPage;
    const handlePage = type === 'articles' ? handleArticlePage : type === 'trials' ? handleTrialPage : handleAuthorPage;
    
    if (lastPage <= 1) return null;
    
    return (
      <div className="d-flex justify-content-center my-4">
        <Pagination
          currentPage={page}
          totalPages={lastPage}
          onPageChange={handlePage}
          size="medium"
          className="mb-0"
        />
      </div>
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
        
        <div className="list-group article-list d-flex justify-content-center flex-wrap">
          {articleResults.map((article) => (
            <ArticleListItem
              key={String(article.article_id)}
              article={{ ...article, article_id: String(article.article_id) }}
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
        
        <div className="list-group article-list d-flex justify-content-center flex-wrap">
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
  
  // Render author results
  const renderAuthors = () => {
    if (!authorResults.length) {
      return <p>No authors found matching your search criteria.</p>;
    }
    
    return (
      <div className="author-results">        
        {renderPagination('authors')}
        
        <div className="list-group author-list d-flex justify-content-center flex-wrap">
          {authorResults.map((author) => (
            <AuthorListItem
              key={author.author_id || Math.random().toString(36)}
              author={author}
              isSearchResult={true}
            />
          ))}
        </div>
        
        {renderPagination('authors')}
        
        {/* Show search info for single results */}
        {authorResults.length === 1 && (
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle mr-2"></i>
            Found 1 author matching your search criteria.
          </div>
        )}
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
        (searchType === 'trials' && trialCount === 0) ||
        (searchType === 'authors' && authorCount === 0)) {
      return (
        <div className="alert alert-info">
          <h4>No results found</h4>
          <p>Your search did not match any {searchType === 'articles' ? 'research articles' : searchType === 'trials' ? 'clinical trials' : 'authors'}. Please try different keywords or filters.</p>
        </div>
      );
    }
    
    return (
      <div className="search-results">
        {renderTabs()}
        {searchType === 'articles' && renderArticles()}
        {searchType === 'trials' && renderTrials()}
        {searchType === 'authors' && renderAuthors()}
      </div>
    );
  };
  
  return (
    <div className="search-app container mt-5">
      {/* Search Form Container - Centered */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Search Form Card with Tabs */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h3 className="mb-0 text-primary ml-3">Search GregoryMS Database</h3>
            </div>
            
            {/* Tab Navigation */}
            <div className="card-header p-0">
              <ul className="nav nav-tabs card-header-tabs" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link ${searchType === 'articles' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchType('articles');
                      setActiveTab('articles');
                      // Update URL parameters for new search type
                      urlUtils.updateSearchParams({
                        type: 'articles',
                        q: searchTerm,
                        field: searchField,
                        page: 1
                      });
                      // Reset results when switching tabs
                      setResults([]);
                      setCurrentPage(1);
                      setTotalPages(1);
                      setTotalCount(0);
                      setHasSearched(false);
                    }}
                    type="button"
                    data-umami-event="click--search-tab-articles"
                  >
                    <i className="fas fa-file-alt mr-2"></i>
                    Research Articles
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${searchType === 'trials' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchType('trials');
                      setActiveTab('trials');
                      // Update URL parameters for new search type
                      urlUtils.updateSearchParams({
                        type: 'trials',
                        q: searchTerm,
                        status: trialStatus,
                        page: 1
                      });
                      // Reset results when switching tabs
                      setResults([]);
                      setCurrentPage(1);
                      setTotalPages(1);
                      setTotalCount(0);
                      setHasSearched(false);
                    }}
                    type="button"
                    data-umami-event="click--search-tab-trials"
                  >
                    <i className="fas fa-flask mr-2"></i>
                    Clinical Trials
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${searchType === 'authors' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchType('authors');
                      setActiveTab('authors');
                      // Update URL parameters for new search type
                      const urlParams = {
                        type: 'authors',
                        page: 1
                      };
                      
                      if (authorSearchType === 'orcid' && orcidSearch) {
                        urlParams.orcid = cleanOrcid(orcidSearch);
                      } else if (searchTerm) {
                        urlParams.q = searchTerm;
                        urlParams.field = searchField;
                      }
                      
                      urlUtils.updateSearchParams(urlParams);
                      // Reset results when switching tabs
                      setResults([]);
                      setCurrentPage(1);
                      setTotalPages(1);
                      setTotalCount(0);
                      setHasSearched(false);
                    }}
                    type="button"
                    data-umami-event="click--search-tab-authors"
                  >
                    <i className="fas fa-user-graduate mr-2"></i>
                    Authors
                  </button>
                </li>
              </ul>
            </div>

            {/* Tab Content */}
            <div className="card-body">
              <div className="tab-content">
                {/* Articles Tab */}
                {searchType === 'articles' && (
                  <div className="tab-pane fade show active">
                    <div className="mb-3">
                      <h5 className="text-primary mb-3">
                        <i className="fas fa-file-alt mr-2"></i>
                        Search Research Articles
                      </h5>
                      <p className="text-muted">Find peer-reviewed research articles about Multiple Sclerosis treatments, studies, and findings.</p>
                    </div>
                    
                    <form onSubmit={handleSearch}>
                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <div className="form-group">
                            <label htmlFor="searchTerm">Search Terms</label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="searchTerm"
                              placeholder="Enter keywords, treatments, or research topics..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-4 mb-3">
                          <div className="form-group">
                            <label htmlFor="searchField">Search In</label>
                            <select 
                              className="form-control"
                              id="searchField"
                              value={searchField}
                              onChange={(e) => {
                                setSearchField(e.target.value);
                                // Track field selection change
                                if (typeof umami !== 'undefined') {
                                  umami.track('search-field-change', {
                                    field: e.target.value,
                                    type: searchType
                                  });
                                }
                              }}
                            >
                              <option value="all">All Fields</option>
                              <option value="title">Title Only</option>
                              <option value="summary">Abstract/Summary Only</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg px-5"
                          disabled={isLoading}
                          data-umami-event="click--search-articles-button"
                          data-umami-event-term={searchTerm}
                          data-umami-event-field={searchField}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                              Searching Articles...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-search mr-2"></i>
                              Search Articles
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Clinical Trials Tab */}
                {searchType === 'trials' && (
                  <div className="tab-pane fade show active">
                    <div className="mb-3">
                      <h5 className="text-primary mb-3">
                        <i className="fas fa-flask mr-2"></i>
                        Search Clinical Trials
                      </h5>
                      <p className="text-muted">Find ongoing and completed clinical trials for Multiple Sclerosis treatments and research studies.</p>
                    </div>
                    
                    <form onSubmit={handleSearch}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <label htmlFor="searchTerm">Search Terms</label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="searchTerm"
                              placeholder="Enter treatment names, trial topics..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-3 mb-3">
                          <div className="form-group">
                            <label htmlFor="searchField">Search In</label>
                            <select 
                              className="form-control"
                              id="searchField"
                              value={searchField}
                              onChange={(e) => {
                                setSearchField(e.target.value);
                                // Track field selection change
                                if (typeof umami !== 'undefined') {
                                  umami.track('search-field-change', {
                                    field: e.target.value,
                                    type: searchType
                                  });
                                }
                              }}
                            >
                              <option value="all">All Fields</option>
                              <option value="title">Title Only</option>
                              <option value="summary">Abstract/Summary Only</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="col-md-3 mb-3">
                          <div className="form-group">
                            <label htmlFor="trialStatus">Trial Status</label>
                            <select 
                              className="form-control"
                              id="trialStatus"
                              value={trialStatus}
                              onChange={(e) => {
                                setTrialStatus(e.target.value);
                                // Track trial status change
                                if (typeof umami !== 'undefined') {
                                  umami.track('search-status-change', {
                                    status: e.target.value,
                                    type: searchType
                                  });
                                }
                              }}
                            >
                              {TRIAL_STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg px-5"
                          disabled={isLoading}
                          data-umami-event="click--search-trials-button"
                          data-umami-event-term={searchTerm}
                          data-umami-event-status={trialStatus}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                              Searching Trials...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-search mr-2"></i>
                              Search Clinical Trials
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Authors Tab */}
                {searchType === 'authors' && (
                  <div className="tab-pane fade show active">
                    <div className="mb-3">
                      <h5 className="text-primary mb-3">
                        <i className="fas fa-user-graduate mr-2"></i>
                        Search Authors
                      </h5>
                      <p className="text-muted">Find researchers and authors who have published Multiple Sclerosis research articles.</p>
                    </div>
                    
                    {/* Author Search Type Selection */}
                    <div className="mb-4">
                      <div className="btn-group w-100" role="group" aria-label="Author search type">
                        <button
                          type="button"
                          className={`btn ${authorSearchType === 'name' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => {
                            setAuthorSearchType('name');
                            // Track search type change
                            if (typeof umami !== 'undefined') {
                              umami.track('search-author-type-change', {
                                type: 'name'
                              });
                            }
                          }}
                        >
                          <i className="fas fa-user mr-2"></i>
                          Search by Name
                        </button>
                        <button
                          type="button"
                          className={`btn ${authorSearchType === 'orcid' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => {
                            setAuthorSearchType('orcid');
                            // Track search type change
                            if (typeof umami !== 'undefined') {
                              umami.track('search-author-type-change', {
                                type: 'orcid'
                              });
                            }
                          }}
                        >
                          <i className="fas fa-id-badge mr-2"></i>
                          Search by ORCID
                        </button>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSearch}>
                      {authorSearchType === 'name' ? (
                        <div className="row">
                          <div className="col-md-8 mb-3">
                            <div className="form-group">
                              <label htmlFor="searchTerm">Author Name</label>
                              <input
                                type="text"
                                className="form-control form-control-lg"
                                id="searchTerm"
                                placeholder="Enter author's full name or partial name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="col-md-4 mb-3 d-flex align-items-end">
                            <div className="form-group w-100">
                              <small className="text-muted">
                                <i className="fas fa-info-circle mr-1"></i>
                                Search by first name, last name, or full name
                              </small>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="row">
                          <div className="col-md-8 mb-3">
                            <div className="form-group">
                              <label htmlFor="orcidSearch">ORCID Identifier</label>
                              <input
                                type="text"
                                className="form-control form-control-lg"
                                id="orcidSearch"
                                placeholder="Enter ORCID ID (e.g., 0000-0000-0000-0000 or https://orcid.org/0000-0000-0000-0000)"
                                value={orcidSearch}
                                onChange={(e) => setOrcidSearch(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="col-md-4 mb-3 d-flex align-items-end">
                            <div className="form-group w-100">
                              <small className="text-muted">
                                <i className="fas fa-info-circle mr-1"></i>
                                ORCID URL prefixes will be automatically removed
                              </small>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg px-5"
                          disabled={isLoading}
                          data-umami-event="click--search-authors-button"
                          data-umami-event-term={authorSearchType === 'name' ? searchTerm : cleanOrcid(orcidSearch)}
                          data-umami-event-type={authorSearchType}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                              Searching Authors...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-search mr-2"></i>
                              Search Authors
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Results */}
      <div className="d-flex justify-content-center">
        <div className="col-lg-10 mx-auto">
          {renderResults()}
        </div>
      </div>
      
      {/* Search Tips - Now appears after results */}
      <div className="row justify-content-center mt-4">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h3 className="mb-0 text-primary ml-3">Search Tips</h3>
            </div>
            <div className="card-body">
              <p className="lead">Use this search tool to find research articles, clinical trials, or authors related to Multiple Sclerosis.</p>
              
              <h5>Tips for effective searching:</h5>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> First, select whether you want to search for research articles, clinical trials, or authors</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> Use specific terms related to treatments, symptoms, or research topics</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> Try different spellings or related terms if you don't find what you're looking for</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> For articles and trials, use the field selector to search in titles only for more specific results</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> For authors, search by full name or use their ORCID identifier for precise results</li>
                <li className="list-group-item"><i className="fas fa-check-circle text-success mr-2"></i> ORCID searches accept both the ID (0000-0000-0000-0000) and full URLs</li>
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
