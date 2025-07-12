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
  { id: 30, name: 'aHSCT', slug: 'ahsct', description: 'Autologous hematopoietic stem cell transplantation research and clinical trials.' },
  { id: 1, name: 'Alemtuzumab', slug: 'alemtuzumab', description: 'Research on Alemtuzumab (Lemtrada) for treating relapsing forms of multiple sclerosis.' },
  { id: 37, name: 'Aubagio', slug: 'aubagio', description: 'Studies on Aubagio (teriflunomide) for relapsing-remitting multiple sclerosis.' },
  { id: 43, name: 'Bafiertam', slug: 'bafiertam', description: 'Research on Bafiertam (monomethyl fumarate) for multiple sclerosis treatment.' },
  { id: 2, name: 'Bexarotene', slug: 'bexarotene', description: 'Studies on Bexarotene as an RXR agonist for potential remyelination therapy.' },
  { id: 48, name: 'Biotin', slug: 'biotin', description: 'High-dose biotin research for progressive multiple sclerosis treatment.' },
  { id: 50, name: 'Bruton Tyrosine Kinase', slug: 'btk-inhibitors', description: 'BTK inhibitors research for multiple sclerosis treatment.' },
  { id: 49, name: 'CAR-T', slug: 'car-t', description: 'CAR-T cell therapy research for multiple sclerosis treatment.' },
  { id: 3, name: 'Cladribine', slug: 'cladribine', description: 'Research on Cladribine (Mavenclad) for multiple sclerosis treatment.' },
  { id: 71, name: 'Clemastine fumarate', slug: 'clemastine-fumarate', description: 'Studies on Clemastine fumarate for promoting remyelination in multiple sclerosis.' },
  { id: 47, name: 'CNM-Au8', slug: 'cnm-au8', description: 'Research on CNM-Au8 gold nanocrystal suspension for multiple sclerosis treatment.' },
  { id: 79, name: 'Domperidone', slug: 'domperidone', description: 'Studies on Domperidone for promoting oligodendrocyte differentiation.' },
  { id: 81, name: 'Ebselen', slug: 'ebselen', description: 'Research on Ebselen as an antioxidant for multiple sclerosis treatment.' },
  { id: 52, name: 'Elezanumab', slug: 'elezanumab', description: 'Studies on Elezanumab for multiple sclerosis treatment.' },
  { id: 35, name: 'Fingolimod', slug: 'fingolimod', description: 'Research on Fingolimod (Gilenya) for relapsing-remitting multiple sclerosis.' },
  { id: 32, name: 'Foralumab', slug: 'foralumab', description: 'Studies on Foralumab for multiple sclerosis treatment.' },
  { id: 31, name: 'Frexalimab', slug: 'frexalimab', description: 'Research on Frexalimab anti-CD40L antibody for relapsing multiple sclerosis.' },
  { id: 76, name: 'GSK239512', slug: 'gsk239512', description: 'Studies on GSK239512 H3 histamine receptor antagonist for remyelination.' },
  { id: 77, name: 'Ibudilast (MN-166)', slug: 'ibudilast-mn-166', description: 'Research on Ibudilast as a PDE4 inhibitor for neuroprotection and remyelination.' },
  { id: 27, name: 'Kynurenine', slug: 'kynurenine', description: 'Studies on Kynurenine pathway in multiple sclerosis.' },
  { id: 75, name: 'Liothyronine (T3)', slug: 'liothyronine-t3', description: 'Research on Liothyronine thyroid hormone for boosting myelin gene expression.' },
  { id: 12, name: 'Maresin-1', slug: 'maresin-1', description: 'Studies on Maresin-1 for inflammation control in multiple sclerosis.' },
  { id: 4, name: 'Metformin', slug: 'metformin', description: 'Research on Metformin as a metabolic modulator for rejuvenating oligodendrocyte precursor cells.' },
  { id: 46, name: 'Naltrexone', slug: 'naltrexone', description: 'Low-dose naltrexone research for multiple sclerosis symptom management.' },
  { id: 5, name: 'Natalizumab', slug: 'natalizumab', description: 'Studies on Natalizumab (Tysabri) for multiple sclerosis treatment.' },
  { id: 38, name: 'Novantrone', slug: 'novantrone', description: 'Research on Novantrone (mitoxantrone) for multiple sclerosis treatment.' },
  { id: 6, name: 'Ocrelizumab', slug: 'ocrelizumab', description: 'Studies on Ocrelizumab anti-CD20 therapy for multiple sclerosis.' },
  { id: 29, name: 'Ofatumumab', slug: 'ofatumumab', description: 'Research on Ofatumumab (Kesimpta) for multiple sclerosis treatment.' },
  { id: 72, name: 'Opicinumab (BIIB033)', slug: 'opicinumab-biib033', description: 'Studies on Opicinumab anti-LINGO-1 antibody for remyelination.' },
  { id: 40, name: 'Ozanimod', slug: 'ozanimod', description: 'Research on Ozanimod (Zeposia) for multiple sclerosis treatment.' },
  { id: 51, name: 'PIPE-307', slug: 'pipe-307', description: 'Studies on PIPE-307 for enhancing myelin repair in multiple sclerosis.' },
  { id: 41, name: 'Ponesimod', slug: 'ponesimod', description: 'Research on Ponesimod (Ponvory) for multiple sclerosis treatment.' },
  { id: 73, name: 'rHIgM22', slug: 'rhigm22', description: 'Studies on rHIgM22 human IgM antibody for remyelination.' },
  { id: 28, name: 'Rituximab', slug: 'rituximab', description: 'Research on Rituximab monoclonal antibody for multiple sclerosis treatment.' },
  { id: 25, name: 'SAR442168', slug: 'sar442168', description: 'Studies on SAR442168 for multiple sclerosis treatment.' },
  { id: 7, name: 'Simvastatin', slug: 'simvastatin', description: 'Research on Simvastatin for neuroprotection in multiple sclerosis.' },
  { id: 10, name: 'Siponimod', slug: 'siponimod', description: 'Studies on Siponimod (Mayzent) for secondary progressive multiple sclerosis.' },
  { id: 8, name: 'Tcelna', slug: 'tcelna', description: 'Research on Tcelna for multiple sclerosis treatment.' },
  { id: 36, name: 'Tecfidera', slug: 'tecfidera', description: 'Studies on Tecfidera (dimethyl fumarate) for relapsing-remitting multiple sclerosis.' },
  { id: 34, name: 'Tolebrutinib', slug: 'tolebrutinib', description: 'Research on Tolebrutinib BTK inhibitor for multiple sclerosis treatment.' },
  { id: 39, name: 'Ublituximab', slug: 'ublituximab', description: 'Studies on Ublituximab (Briumvi) for relapsing multiple sclerosis.' },
  { id: 42, name: 'Vumerity', slug: 'vumerity', description: 'Research on Vumerity (diroximel fumarate) for multiple sclerosis treatment.' }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
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
                {searchTerm && (
                  <small className="text-muted">
                    Showing {filteredCategories.length} of {categories.length} treatments
                  </small>
                )}
              </div>
            </div>
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
          
          {filteredCategories.length === 0 && searchTerm && (
            <div className="col-md-12">
              <div className="alert alert-info text-center">
                <h5>No treatments found</h5>
                <p>No treatments match your search for "{searchTerm}". Try searching for:</p>
                <ul className="list-unstyled">
                  <li>• Specific drug names (e.g., "Tecfidera", "Ocrelizumab")</li>
                  <li>• Treatment types (e.g., "stem cell", "antibody")</li>
                  <li>• Mechanisms (e.g., "remyelination", "neuroprotection")</li>
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
