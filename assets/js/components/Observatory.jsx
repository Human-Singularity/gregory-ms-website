/**
 * Observatory component - Main observatory page with categories list and details
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CategoryCard from './CategoryCard';
import CategoryDetail from './CategoryDetail';

// Default configuration - make these configurable
const DEFAULT_CONFIG = {
  API_URL: window.ENV_API_URL || 'https://api.gregory-ms.com',
  TEAM_ID: window.ENV_TEAM_ID || 1,
  SUBJECT_ID: window.ENV_SUBJECT_ID || 1
};

// MS research categories from the Gregory database
const CATEGORIES = [
	{ tags:['immune reconstitution','DMTs'], id: 30, name: 'aHSCT', slug: 'ahsct', description: 'Autologous hematopoietic stem cell transplantation research and clinical trials.' },
	{ tags:['immune reconstitution','DMTs'], id: 1, name: 'Alemtuzumab', slug: 'alemtuzumab', description: 'Research on Alemtuzumab (Lemtrada) for treating relapsing forms of multiple sclerosis.' },
	{ tags:['DMTs'], id: 37, name: 'Teriflunomide', slug: 'teriflunomide', description: 'Studies on Aubagio (teriflunomide) for relapsing-remitting multiple sclerosis.' },
	{ tags:['DMTs','fumarate'], id: 43, name: 'Monomethyl Fumarate', slug: 'monomethyl-fumarate', description: 'Research on Bafiertam (monomethyl fumarate) for multiple sclerosis treatment.' },
	{ tags:['remyelination'], id: 2, name: 'Bexarotene', slug: 'bexarotene', description: 'Studies on Bexarotene as an RXR agonist for potential remyelination therapy.' },
	{ tags:['remyelination'], id: 48, name: 'Biotin', slug: 'biotin', description: 'High-dose biotin research for progressive multiple sclerosis treatment.' },
	{ tags:['BTKi','investigational'], id: 50, name: 'Bruton Tyrosine Kinase', slug: 'btk-inhibitors', description: 'BTK inhibitors research for multiple sclerosis treatment.' },
	{ tags:['cell therapy','investigational'], id: 49, name: 'CAR-T', slug: 'car-t', description: 'CAR-T cell therapy research for multiple sclerosis treatment.' },
	{ tags:['immune reconstitution','DMTs'], id: 3, name: 'Cladribine', slug: 'cladribine', description: 'Research on Cladribine (Mavenclad) for multiple sclerosis treatment.' },
	{ tags:['remyelination'], id: 71, name: 'Clemastine fumarate', slug: 'clemastine-fumarate', description: 'Studies on Clemastine fumarate for promoting remyelination in multiple sclerosis.' },
	{ tags:['neuroprotection','remyelination','investigational'], id: 47, name: 'CNM-Au8', slug: 'cnm-au8', description: 'Research on CNM-Au8 gold nanocrystal suspension for multiple sclerosis treatment.' },
	{ tags:['remyelination','investigational'], id: 79, name: 'Domperidone', slug: 'domperidone', description: 'Studies on Domperidone for promoting oligodendrocyte differentiation.' },
	{ tags:['neuroprotection','investigational'], id: 81, name: 'Ebselen', slug: 'ebselen', description: 'Research on Ebselen as an antioxidant for multiple sclerosis treatment.' },
	{ tags:['remyelination','investigational'], id: 52, name: 'Elezanumab', slug: 'elezanumab', description: 'Studies on Elezanumab for multiple sclerosis treatment.' },
	{ tags:['DMTs','S1P'], id: 35, name: 'Fingolimod', slug: 'fingolimod', description: 'Research on Fingolimod (Gilenya) for relapsing-remitting multiple sclerosis.' },
	{ tags:['investigational','immunotherapy'], id: 32, name: 'Foralumab', slug: 'foralumab', description: 'Studies on Foralumab for multiple sclerosis treatment.' },
	{ tags:['investigational','immunotherapy'], id: 31, name: 'Frexalimab', slug: 'frexalimab', description: 'Research on Frexalimab anti-CD40L antibody for relapsing multiple sclerosis.' },
	{ tags:['remyelination','investigational'], id: 76, name: 'GSK239512', slug: 'gsk239512', description: 'Studies on GSK239512 H3 histamine receptor antagonist for remyelination.' },
	{ tags:['remyelination','neuroprotection','investigational'], id: 77, name: 'Ibudilast (MN-166)', slug: 'ibudilast-mn-166', description: 'Research on Ibudilast as a PDE4 inhibitor for neuroprotection and remyelination.' },
	{ tags:['neuroinflammation','investigational'], id: 27, name: 'Kynurenine', slug: 'kynurenine', description: 'Studies on Kynurenine pathway in multiple sclerosis.' },
	{ tags:['remyelination','investigational'], id: 75, name: 'Liothyronine (T3)', slug: 'liothyronine-t3', description: 'Research on Liothyronine thyroid hormone for boosting myelin gene expression.' },
	{ tags:['neuroinflammation','investigational'], id: 12, name: 'Maresin-1', slug: 'maresin-1', description: 'Studies on Maresin-1 for inflammation control in multiple sclerosis.' },
	{ tags:['remyelination','investigational'], id: 4, name: 'Metformin', slug: 'metformin', description: 'Research on Metformin as a metabolic modulator for rejuvenating oligodendrocyte precursor cells.' },
	{ tags:['symptomatic'], id: 46, name: 'Naltrexone', slug: 'naltrexone', description: 'Low-dose naltrexone research for multiple sclerosis symptom management.' },
	{ tags:['DMTs','integrin'], id: 5, name: 'Natalizumab', slug: 'natalizumab', description: 'Studies on Natalizumab (Tysabri) for multiple sclerosis treatment.' },
	{ tags:['DMTs','chemo'], id: 38, name: 'Mitoxantrone', slug: 'mitoxantrone', description: 'Research on Novantrone (mitoxantrone) for multiple sclerosis treatment.' },
	{ tags:['DMTs','anti-CD20'], id: 6, name: 'Ocrelizumab', slug: 'ocrelizumab', description: 'Studies on Ocrelizumab anti-CD20 therapy for multiple sclerosis.' },
	{ tags:['DMTs','anti-CD20'], id: 29, name: 'Ofatumumab', slug: 'ofatumumab', description: 'Research on Ofatumumab (Kesimpta) for multiple sclerosis treatment.' },
	{ tags:['remyelination','investigational'], id: 72, name: 'Opicinumab (BIIB033)', slug: 'opicinumab-biib033', description: 'Studies on Opicinumab anti-LINGO-1 antibody for remyelination.' },
	{ tags:['DMTs','S1P'], id: 40, name: 'Ozanimod', slug: 'ozanimod', description: 'Research on Ozanimod (Zeposia) for multiple sclerosis treatment.' },
	{ tags:['remyelination','investigational'], id: 51, name: 'PIPE-307', slug: 'pipe-307', description: 'Studies on PIPE-307 for enhancing myelin repair in multiple sclerosis.' },
	{ tags:['DMTs','S1P'], id: 41, name: 'Ponesimod', slug: 'ponesimod', description: 'Research on Ponesimod (Ponvory) for multiple sclerosis treatment.' },
	{ tags:['remyelination','investigational'], id: 73, name: 'rHIgM22', slug: 'rhigm22', description: 'Studies on rHIgM22 human IgM antibody for remyelination.' },
	{ tags:['DMTs','anti-CD20','off-label'], id: 28, name: 'Rituximab', slug: 'rituximab', description: 'Research on Rituximab monoclonal antibody for multiple sclerosis treatment.' },
	{ tags:['neuroprotection','investigational'], id: 7, name: 'Simvastatin', slug: 'simvastatin', description: 'Research on Simvastatin for neuroprotection in multiple sclerosis.' },
	{ tags:['DMTs','S1P'], id: 10, name: 'Siponimod', slug: 'siponimod', description: 'Studies on Siponimod (Mayzent) for secondary progressive multiple sclerosis.' },
	{ tags:['cell therapy','immunotherapy','investigational'], id: 8, name: 'Tcelna', slug: 'tcelna', description: 'Research on Tcelna for multiple sclerosis treatment.' },
	{ tags:['DMTs','fumarate'], id: 36, name: 'Dimethyl Fumarate', slug: 'dimethyl-fumarate', description: 'Studies on Tecfidera (dimethyl fumarate) for relapsing-remitting multiple sclerosis.' },
	{ tags:['BTKi','investigational'], id: 34, name: 'Tolebrutinib', slug: 'tolebrutinib', description: 'Research on Tolebrutinib BTK inhibitor for multiple sclerosis treatment.' },
	{ tags:['DMTs','anti-CD20'], id: 39, name: 'Ublituximab', slug: 'ublituximab', description: 'Studies on Ublituximab (Briumvi) for relapsing multiple sclerosis.' },
	{ tags:['DMTs','fumarate'], id: 42, name: 'diroximel Fumarate', slug: 'diroximel-fumarate', description: 'Research on Vumerity (diroximel fumarate) for multiple sclerosis treatment.' }
];

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
  const allTags = [...new Set(CATEGORIES.flatMap(cat => cat.tags))].sort();

  // Initialize categories and handle URL params
  useEffect(() => {
    setCategories(CATEGORIES);
    setFilteredCategories(CATEGORIES);
    
    if (categorySlug) {
      const category = CATEGORIES.find(cat => cat.slug === categorySlug);
      if (category) {
        setSelectedCategory(category);
      } else {
        setError(`Category "${categorySlug}" not found`);
      }
    }
    
    setLoading(false);
  }, [categorySlug]);

  // Filter categories based on search term and selected tags
  useEffect(() => {
    let filtered = categories;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(category =>
        selectedTags.every(tag => category.tags.includes(tag))
      );
    }

    setFilteredCategories(filtered);
  }, [searchTerm, selectedTags, categories]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle tag selection
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Update URL without page reload
    navigate(`/observatory/category/${category.slug}`, { replace: true });
  };

  // Handle back to categories list
  const handleBackToList = () => {
    setSelectedCategory(null);
    navigate('/observatory', { replace: true });
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
    <div className="container mt-4">
      {selectedCategory ? (
        <CategoryDetail 
          category={selectedCategory} 
          config={config}
          onBack={handleBackToList}
        />
      ) : (
        <div className="row">
          <div className="col-md-12">
            {/* Search Bar */}
            <div className="row justify-content-center mb-4">
              <div className="col-md-6">
                <div className="input-group observatory-search">
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
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleClearSearch}
                        title="Clear search"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    ) : (
                      <span className="input-group-text">
                        <i className="fa fa-search"></i>
                      </span>
                    )}
                  </div>
                </div>
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
                      <small className="text-muted align-self-center mr-2">Filter by:</small>
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
                  {selectedTags.length > 0 && ` selected tags: ${selectedTags.join(', ')}`}
                </p>
                <p>Try:</p>
                <ul className="list-unstyled">
                  <li>• Specific drug names (e.g., "Tecfidera", "Ocrelizumab")</li>
                  <li>• Treatment types (e.g., "stem cell", "antibody")</li>
                  <li>• Mechanisms (e.g., "remyelination", "neuroprotection")</li>
                  <li>• Removing some filters</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Observatory;
