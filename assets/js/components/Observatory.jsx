/**
 * Observatory component - Main observatory page with categories list and details
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryService } from '../services/api';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import CategoryCard from './CategoryCard';
import CategoryDetail from './CategoryDetail';

// Default configuration - make these configurable
const DEFAULT_CONFIG = {
  API_URL: window.ENV_API_URL || 'https://api.gregory-ms.com',
  TEAM_ID: window.ENV_TEAM_ID || 1,
  SUBJECT_ID: window.ENV_SUBJECT_ID || 1
};



// Curated list of categories to show with predefined tags for filtering
// Only category_id and category_tags are set here; other fields are hydrated from the API
const CATEGORY_CURATED = [
  { category_id: 1, category_tags: ['immune reconstitution','DMTs'] },
  { category_id: 2, category_tags: ['remyelination'] },
  { category_id: 3, category_tags: ['immune reconstitution','DMTs'] },
  { category_id: 4, category_tags: ['remyelination','investigational'] },
  { category_id: 5, category_tags: ['DMTs','integrin'] },
  { category_id: 6, category_tags: ['DMTs','anti-CD20'] },
  { category_id: 7, category_tags: ['neuroprotection','investigational'] },
  { category_id: 8, category_tags: ['cell therapy','immunotherapy','investigational'] },
  { category_id: 9, category_tags: ['cell therapy','stem cells','immune reconstitution'] },
  { category_id: 10, category_tags: ['DMTs','S1P'] },
  { category_id: 12, category_tags: ['neuroinflammation','investigational'] },
  { category_id: 22, category_tags: ['investigational'] },
  { category_id: 27, category_tags: ['neuroinflammation','investigational'] },
  { category_id: 28, category_tags: ['DMTs','anti-CD20','off-label'] },
  { category_id: 29, category_tags: ['DMTs','anti-CD20'] },
  { category_id: 30, category_tags: ['immune reconstitution','DMTs'] },
  { category_id: 31, category_tags: ['investigational','immunotherapy'] },
  { category_id: 32, category_tags: ['investigational'] },
  { category_id: 34, category_tags: ['BTKi','investigational'] },
  { category_id: 35, category_tags: ['DMTs','S1P'] },
  { category_id: 36, category_tags: ['DMTs','fumarate'] },
  { category_id: 37, category_tags: ['DMTs'] },
  { category_id: 38, category_tags: ['DMTs','chemo'] },
  { category_id: 39, category_tags: ['DMTs','anti-CD20'] },
  { category_id: 40, category_tags: ['DMTs','S1P'] },
  { category_id: 41, category_tags: ['DMTs','S1P'] },
  { category_id: 42, category_tags: ['DMTs','fumarate'] },
  { category_id: 43, category_tags: ['DMTs','fumarate'] },
  { category_id: 46, category_tags: ['symptomatic'] },
  { category_id: 47, category_tags: ['neuroprotection','remyelination','investigational'] },
  { category_id: 48, category_tags: ['remyelination'] },
  { category_id: 49, category_tags: ['cell therapy','investigational'] },
  { category_id: 50, category_tags: ['BTKi','investigational'] },
  { category_id: 51, category_tags: ['remyelination','investigational'] },
  { category_id: 52, category_tags: ['remyelination','investigational'] },
  { category_id: 53, category_tags: ['investigational'] },
  { category_id: 57, category_tags: ['investigational'] },
  { category_id: 59, category_tags: ['investigational'] },
  { category_id: 66, category_tags: ['investigational'] },
  { category_id: 71, category_tags: ['remyelination'] },
  { category_id: 72, category_tags: ['remyelination','investigational'] },
  { category_id: 73, category_tags: ['remyelination','investigational'] },
  { category_id: 75, category_tags: ['remyelination','investigational'] },
  { category_id: 76, category_tags: ['remyelination','investigational'] },
  { category_id: 77, category_tags: ['remyelination','neuroprotection','investigational'] },
  { category_id: 79, category_tags: ['remyelination','investigational'] },
  { category_id: 81, category_tags: ['neuroprotection','investigational'] },
  { category_id: 87, category_tags: ['investigational'] },
  { category_id: 89, category_tags: ['remyelination','myelin repair','regenerative medicine'] },
  { category_id: 91, category_tags: ['investigational'] },
  { category_id: 94, category_tags: ['neuroprotection','investigational','cognition'] }
];

// Normalize curated array to id/tags shape used by the component
const CATEGORY_IDS = CATEGORY_CURATED.map(({ category_id, category_tags }) => ({ id: category_id, tags: category_tags }));

const CATEGORY_ID_TO_TAGS = new Map(CATEGORY_IDS.map(item => [item.id, item.tags]));
const CURATED_ID_SET = new Set(CATEGORY_IDS.map(item => item.id));

// Map API category object to UI shape expected by components
const mapApiCategoryToUi = (apiCat) => ({
  id: apiCat.id,
  name: apiCat.category_name,
  slug: apiCat.category_slug,
  // Keep both fields for backward compatibility in UI
  description: apiCat.category_description || '',
  category_description: apiCat.category_description || '',
  // Use curated tags from CATEGORY_IDS for filtering (stable taxonomy)
  tags: CATEGORY_ID_TO_TAGS.get(apiCat.id) || [],
  // Extra fields that might be useful
  article_count_total: apiCat.article_count_total,
  trials_count_total: apiCat.trials_count_total,
  authors_count: apiCat.authors_count,
  top_authors: apiCat.top_authors,
});

/**
 * Observatory component
 */
function Observatory({ config = DEFAULT_CONFIG }) {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all unique tags from categories
  const allTags = [...new Set(categories.flatMap(cat => Array.isArray(cat.tags) ? cat.tags : []))].sort();

  // Initialize categories and handle URL params
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setError(null);

      // Get search parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const searchFromUrl = urlParams.get('search') || '';
      const tagsFromUrl = urlParams.get('tags') ? urlParams.get('tags').split(',') : [];

      if (searchFromUrl) setSearchTerm(searchFromUrl);
      if (tagsFromUrl.length > 0) setSelectedTags(tagsFromUrl);

      try {
        // Fetch curated categories in a single request using the new get_categories param
        const ids = CATEGORY_IDS.map(x => x.id);
        
  const respAll = await categoryService.getCategoriesByIdsAll(ids, { 
          team_id: config.TEAM_ID,
          subject_id: config.SUBJECT_ID
        });
        const allResults = respAll?.data?.results || [];
        let fetchedCats = allResults.map(mapApiCategoryToUi);

        // If any curated IDs are missing, fetch them individually
        const fetchedIds = new Set(fetchedCats.map(c => c.id));
        const missingIds = CATEGORY_IDS.map(x => x.id).filter(id => !fetchedIds.has(id));
    if (missingIds.length > 0) {
          try {
      const missResp = await categoryService.getCategoriesByIdsAll(missingIds, { 
              team_id: config.TEAM_ID,
              subject_id: config.SUBJECT_ID
            });
            const missResults = missResp?.data?.results || [];
            const missCats = missResults.map(mapApiCategoryToUi);
            fetchedCats = [...fetchedCats, ...missCats];
          } catch (e) {
            console.warn('Failed batch fetch for missing categories:', e?.message || e);
          }
        }

        if (isMounted) {
          // Set categories from API data
          setCategories(fetchedCats);
        }

        // If URL has a category slug, ensure we have the selected category
        if (categorySlug) {
          // Try to find it in fetched categories
          const fromList = fetchedCats.find(cat => cat.slug === categorySlug);
          if (fromList) {
            if (isMounted) setSelectedCategory(fromList);
          } else {
            // Fetch by slug from API as a fallback
            try {
              const respBySlug = await categoryService.getCategories({ category_slug: categorySlug, include_authors: 'true', max_authors: '10' });
              const resultBySlug = respBySlug?.data?.results?.[0];
              if (resultBySlug && isMounted) {
                setSelectedCategory(mapApiCategoryToUi(resultBySlug));
              } else if (isMounted) {
                setError(`Category "${categorySlug}" not found`);
              }
            } catch (e) {
              console.error('Error fetching category by slug:', e);
              if (isMounted) setError('Failed to load category details');
            }
          }
        }
      } catch (e) {
        console.error('Error loading categories:', e);
        if (isMounted) {
          // Show error when API fails
          setError('Failed to load categories. Please try again later.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => { isMounted = false; };
  }, [categorySlug]);

  // Filter categories based on search term and selected tags
  useEffect(() => {
  let filtered = categories;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(category => {
        const name = (category.name || '').toLowerCase();
        const desc = (category.description || '').toLowerCase();
        const catDesc = (category.category_description || '').toLowerCase();
        return (
          name.includes(searchTerm.toLowerCase()) ||
          desc.includes(searchTerm.toLowerCase()) ||
          catDesc.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(category =>
        selectedTags.every(tag => Array.isArray(category.tags) && category.tags.includes(tag))
      );
    }

  // Sort alphabetically by name for display
  const sorted = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
  setFilteredCategories(sorted);
  }, [searchTerm, selectedTags, categories]);

  // Update URL parameters to persist search and filter state
  const updateUrlParams = (search, tags) => {
    const urlParams = new URLSearchParams();
    if (search.trim()) {
      urlParams.set('search', search.trim());
    }
    if (tags.length > 0) {
      urlParams.set('tags', tags.join(','));
    }
    
    const paramString = urlParams.toString();
    const newUrl = `/observatory${paramString ? `?${paramString}` : ''}`;
    
    // Update URL without causing a page reload
    window.history.replaceState({}, '', newUrl);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    updateUrlParams(newSearchTerm, selectedTags);
  };

  // Handle search form submission (when user presses Enter)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Track search with umami
      if (typeof umami !== 'undefined') {
        umami.track('observatory-search', {
          query: searchTerm.trim(),
          resultCount: filteredCategories.length,
          selectedTags: selectedTags.length > 0 ? selectedTags.join(',') : null
        });
      }
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    updateUrlParams('', selectedTags);
  };

  // Handle tag selection
  const handleTagToggle = (tag) => {
    const isRemoving = selectedTags.includes(tag);
    const newSelectedTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    updateUrlParams(searchTerm, newSelectedTags);

    // Track tag interaction with umami
    if (typeof umami !== 'undefined') {
      umami.track('observatory-tag', {
        tag: tag,
        action: isRemoving ? 'remove' : 'add',
        totalSelectedTags: isRemoving ? selectedTags.length - 1 : selectedTags.length + 1
      });
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    updateUrlParams('', []);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // Preserve current search and filter state in URL when navigating to category
    const urlParams = new URLSearchParams();
    if (searchTerm.trim()) {
      urlParams.set('search', searchTerm.trim());
    }
    if (selectedTags.length > 0) {
      urlParams.set('tags', selectedTags.join(','));
    }
    
    const paramString = urlParams.toString();
    const categoryUrl = `/observatory/category/${category.slug}${paramString ? `?${paramString}` : ''}`;
    
    // Update URL without page reload
    navigate(categoryUrl, { replace: true });
    
    // Track category selection with umami
    if (typeof umami !== 'undefined') {
      umami.track('observatory-category-select', {
        category: category.name,
        slug: category.slug,
        tags: category.tags.join(',')
      });
    }
  };

  // Handle back to categories list
  const handleBackToList = () => {
    setSelectedCategory(null);
    
    // Preserve current search and filter state when going back
    const urlParams = new URLSearchParams();
    if (searchTerm.trim()) {
      urlParams.set('search', searchTerm.trim());
    }
    if (selectedTags.length > 0) {
      urlParams.set('tags', selectedTags.join(','));
    }
    
    const paramString = urlParams.toString();
    const observatoryUrl = `/observatory${paramString ? `?${paramString}` : ''}`;
    
    navigate(observatoryUrl, { replace: true });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger">
              <h4>Error</h4>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="container mt-4">
        {selectedCategory ? (
          <>
            <Helmet>
              <title>{selectedCategory.name} | Gregory MS Observatory</title>
              <meta property="og:title" content={`${selectedCategory.name} | Gregory MS Observatory`} />
              <meta name="description" content={selectedCategory.description} />
              <meta property="og:description" content={selectedCategory.description} />
            </Helmet>
            <CategoryDetail 
              category={selectedCategory} 
              config={config}
              onBack={handleBackToList}
            />
          </>
        ) : (
          <>
            <Helmet>
              <title>MS Research Observatory | Gregory MS</title>
              <meta property="og:title" content="MS Research Observatory | Gregory MS" />
              <meta name="description" content="Track the latest research on treatments and therapies for Multiple Sclerosis." />
              <meta property="og:description" content="Track the latest research on treatments and therapies for Multiple Sclerosis." />
            </Helmet>
            <div className="row">
              <div className="col-md-12">
                {/* Search Bar */}
                <div className="row justify-content-center mb-4">
                  <div className="col-md-6">
                    <form onSubmit={handleSearchSubmit} className="observatory-search">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search treatments (e.g., 'Fingolimod', 'stem cell', 'remyelination')"
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                        <div className="input-group-append">
                          {searchTerm ? (
                            <button
                              className="input-group-text"
                              type="button"
                              onClick={handleClearSearch}
                              title="Clear search"
                              style={{ 
                                border: '1px solid #ced4da',
                                borderLeft: 'none',
                                backgroundColor: '#f8f9fa',
                                width: '38px',
                                minWidth: '38px',
                                height: '38px',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          ) : (
                            <span className="input-group-text" style={{ 
                              width: '38px',
                              minWidth: '38px',
                              height: '38px',
                              padding: '0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className="fa fa-search"></i>
                            </span>
                          )}
                        </div>
                      </div>
                    </form>
                    <div className="observatory-filters-status mt-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Showing {filteredCategories.length} of {categories.length} treatments
                        </small>
                        <button
                          className={`btn btn-sm ${(searchTerm || selectedTags.length > 0) ? 'btn-outline-secondary' : 'btn-outline-light'}`}
                          onClick={handleClearAllFilters}
                          disabled={!searchTerm && selectedTags.length === 0}
                          title="Clear all filters"
                        >
                          <i className="fa fa-times mr-1"></i>
                          Clear all filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tag Filter Pills */}
                {allTags.length > 0 && (
                  <div className="row justify-content-center mb-4">
                    <div className="col-md-8">
                      <div className="observatory-tag-filters">
                        <div className="d-flex flex-wrap justify-content-center">
                          <p className="text-muted align-self-center mr-2">Filter by:</p>
                          {allTags.map(tag => (
                            <button
                              key={tag}
                              className={`btn btn-sm ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => handleTagToggle(tag)}
                              style={{ borderRadius: '20px', fontSize: '0.85rem' }}
                            >
                              {tag}
                              {selectedTags.includes(tag) && (
                                <i className="fa fa-check ml-1"></i>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="row observatory-card">
                {filteredCategories.map((category) => (
                  <div key={category.slug} className="col-sm-6 col-md-4 col-lg-3 mb-4">
                    <CategoryCard 
                      category={category}
                      onSelect={handleCategorySelect}
                    />
                  </div>
                ))}
              </div>
              
              {filteredCategories.length === 0 && (searchTerm || selectedTags.length > 0) && (
                <div className="col-md-12">
                  <div className="alert alert-info text-center">
                    <h5>No treatments found</h5>
                    <p>
                      No treatments match your 
                      {searchTerm && ` search for "${searchTerm}"`}
                      {searchTerm && selectedTags.length > 0 && ' and '}
                      {selectedTags.length > 0 && `selected tags: ${selectedTags.join(', ')}`}
                    </p>
                    <p>Try:</p>
                    <ul className="list">
                      <li>Specific drug names (e.g., "Tecfidera", "Ocrelizumab")</li>
                      <li>Treatment types (e.g., "stem cell", "antibody")</li>
                      <li>Mechanisms (e.g., "remyelination", "neuroprotection")</li>
                      <li>Removing some filters</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </HelmetProvider>
  );
}

export default Observatory;
