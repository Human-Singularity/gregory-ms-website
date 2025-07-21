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
	{ tags:['immune reconstitution','DMTs'], id: 1, name: 'Alemtuzumab', slug: 'alemtuzumab', description: 'Research on Alemtuzumab (Lemtrada) for treating relapsing forms of multiple sclerosis.', category_description: 'LEMTRADA, or Alemtuzumab, is a prescription medicine used to treat relapsing forms of multiple sclerosis (MS), to include relapsing-remitting disease and active secondary progressive disease, in adults. Since treatment with LEMTRADA can increase your risk of getting certain conditions and diseases, LEMTRADA is generally prescribed for people who have tried 2 or more MS medicines that have not worked well enough. LEMTRADA is not recommended for use in patients with clinically isolated syndrome (CIS). It is not known if LEMTRADA is safe and effective for use in children under 17 years of age.\n\nhttps://www.lemtrada.com/' },
	{ tags:['remyelination'], id: 2, name: 'Bexarotene', slug: 'bexarotene', description: 'Studies on Bexarotene as an RXR agonist for potential remyelination therapy.', category_description: 'Type: RXR agonist\nStatus: Phase II\n\nToxicity limits use; some remyelination evidence' },
	{ tags:['immune reconstitution','DMTs'], id: 3, name: 'Cladribine', slug: 'cladribine', description: 'Research on Cladribine (Mavenclad) for multiple sclerosis treatment.', category_description: '' },
	{ tags:['remyelination','investigational'], id: 4, name: 'Metformin', slug: 'metformin', description: 'Research on Metformin as a metabolic modulator for rejuvenating oligodendrocyte precursor cells.', category_description: 'Type: Metabolic modulator\nStatus: Early clinical\n\nShown to rejuvenate OPCs in older patients (METRIS study)' },
	{ tags:['DMTs','integrin'], id: 5, name: 'Natalizumab', slug: 'natalizumab', description: 'Studies on Natalizumab (Tysabri) for multiple sclerosis treatment.', category_description: '' },
	{ tags:['DMTs','anti-CD20'], id: 6, name: 'Ocrelizumab', slug: 'ocrelizumab', description: 'Studies on Ocrelizumab anti-CD20 therapy for multiple sclerosis.', category_description: 'Type: Anti-CD20 monoclonal antibody\nStatus: Approved\n\nApproved MS therapy; may support remyelination' },
	{ tags:['neuroprotection','investigational'], id: 7, name: 'Simvastatin', slug: 'simvastatin', description: 'Research on Simvastatin for neuroprotection in multiple sclerosis.', category_description: '' },
	{ tags:['cell therapy','immunotherapy','investigational'], id: 8, name: 'Tcelna', slug: 'tcelna', description: 'Research on Tcelna for multiple sclerosis treatment.', category_description: '' },
	{ tags:['DMTs','S1P'], id: 10, name: 'Siponimod', slug: 'siponimod', description: 'Studies on Siponimod (Mayzent) for secondary progressive multiple sclerosis.', category_description: 'Siponimod (also known as BAF312 or Mayzent) is a tablet being developed for secondary progressive MS by Novartis Pharmaceuticals. It was licensed by the European Medicines Agency (EMA) on Monday 20 January 2020.\n\nhttps://www.mssociety.org.uk/research/explore-our-research/emerging-research-and-treatments/explore-treatments-in-trials/siponimod' },
	{ tags:['neuroinflammation','investigational'], id: 12, name: 'Maresin-1', slug: 'maresin-1', description: 'Studies on Maresin-1 for inflammation control in multiple sclerosis.', category_description: 'https://neurosciencenews.com/inflammation-lipid-ms-20501/' },
	{ tags:['investigational'], id: 22, name: 'Amiselimod', slug: 'amiselimod', description: 'Studies on Amiselimod for multiple sclerosis treatment.', category_description: 'sg' },
	{ tags:['neuroinflammation','investigational'], id: 27, name: 'Kynurenine', slug: 'kynurenine', description: 'Studies on Kynurenine pathway in multiple sclerosis.', category_description: 'Kynurenine was added as a category based on this article: https://pubmed.ncbi.nlm.nih.gov/36004319/' },
	{ tags:['DMTs','anti-CD20','off-label'], id: 28, name: 'Rituximab', slug: 'rituximab', description: 'Research on Rituximab monoclonal antibody for multiple sclerosis treatment.', category_description: 'Rituximab, sold under the brand name Rituxan among others, is a monoclonal antibody medication used to treat certain autoimmune diseases and types of cancer.' },
	{ tags:['DMTs','anti-CD20'], id: 29, name: 'Ofatumumab', slug: 'ofatumumab', description: 'Research on Ofatumumab (Kesimpta) for multiple sclerosis treatment.', category_description: 'ofatumumab, Kesimpta' },
	{ tags:['immune reconstitution','DMTs'], id: 30, name: 'aHSCT', slug: 'ahsct', description: 'Autologous hematopoietic stem cell transplantation research and clinical trials.', category_description: 'Autologous hematopoietic stem cell transplantation\n\nSearch terms: ahsct,Autologous hematopoietic stem cell transplantation,Bone marrow,Mesenchymal stem cells,Immunoablation' },
	{ tags:['investigational','immunotherapy'], id: 31, name: 'Frexalimab', slug: 'frexalimab', description: 'Research on Frexalimab anti-CD40L antibody for relapsing multiple sclerosis.', category_description: 'Sanofi has reported positive new data from a mid-stage study of its investigational anti-CD40L antibody in patients with relapsing multiple sclerosis (MS).\n\nResults from the phase 2 study, being presented at the 2023 Consortium of Multiple Sclerosis Centers annual meeting, demonstrate that frexalimab significantly reduced disease activity in patients with relapsing forms of the disease.\n\nSource: https://www.sanofi.com/en/media-room/press-releases/2023/2023-05-31-05-00-00-2678991' },
	{ tags:['investigational','immunotherapy'], id: 32, name: 'Foralumab', slug: 'foralumab', description: 'Studies on Foralumab for multiple sclerosis treatment.', category_description: 'Foralumab' },
	{ tags:['BTKi','investigational'], id: 34, name: 'Tolebrutinib', slug: 'tolebrutinib', description: 'Research on Tolebrutinib BTK inhibitor for multiple sclerosis treatment.', category_description: 'Based on the following article, this item was added to the Observatory page.\n\n> Safety and efficacy of tolebrutinib, an oral brain-penetrant BTK inhibitor, in relapsing multiple sclerosis: a phase 2b, randomised, double-blind, placebo-controlled trial\n\nSource [The Lancet](https://www.thelancet.com/journals/laneur/article/PIIS1474-4422(21)00237-4/fulltext)' },
	{ tags:['DMTs','S1P'], id: 35, name: 'Fingolimod', slug: 'fingolimod', description: 'Research on Fingolimod (Gilenya) for relapsing-remitting multiple sclerosis.', category_description: 'Fingolimod, also known as Gilenya is a type of medicine known as a \'disease-modifying therapy\' that is used to treat adults and children over 10 years of age with highly active relapsing-remitting multiple sclerosis (MS), a disease of the nerves in which inflammation destroys the protective sheath surrounding the nerve cells. \'Relapsing-remitting\' means that the patient has flare-ups of symptoms (relapses) followed by periods of recovery (remissions). Gilenya is used when the disease remains active despite appropriate treatment with at least one other disease-modifying therapy, or is severe and getting worse rapidly.\n\nhttps://www.ema.europa.eu/en/medicines/human/EPAR/gilenya' },
	{ tags:['DMTs','fumarate'], id: 36, name: 'Dimethyl Fumarate', slug: 'tecfidera', description: 'Studies on Tecfidera (dimethyl fumarate) for relapsing-remitting multiple sclerosis.', category_description: 'Dimethyl Fumarate (Tecfidera) is a medicine used to treat multiple sclerosis (MS), a disease in which inflammation damages the protective insulation around nerves (demyelination) as well as the nerves themselves. It is used in adults and children from 13 years of age with a type of MS known as relapsing-remitting MS, where the patient has flare-ups of symptoms (relapses) followed by periods of recovery (remissions).\n\nTecfidera contains the active substance dimethyl fumarate.\n\nhttps://www.ema.europa.eu/en/medicines/human/EPAR/tecfidera' },
	{ tags:['DMTs'], id: 37, name: 'Teriflunomide', slug: 'teriflunomide', description: 'Studies on Aubagio (teriflunomide) for relapsing-remitting multiple sclerosis.', category_description: 'Aubagio is a medicine that contains the active substance teriflunomide. It is used to treat patients from the age of 10 years with multiple sclerosis (MS), a disease in which inflammation destroys the protective sheath around the nerves. \n\nAubagio is used in the type of MS known as relapsing-remitting MS, when the patient has flare-ups of symptoms (relapses) followed by periods of recovery (remissions).' },
	{ tags:['DMTs','chemo'], id: 38, name: 'Mitoxantrone', slug: 'mitoxantrone', description: 'Research on Novantrone (mitoxantrone) for multiple sclerosis treatment.', category_description: 'Novantrone, mitoxantrone' },
	{ tags:['DMTs','anti-CD20'], id: 39, name: 'Ublituximab', slug: 'ublituximab', description: 'Studies on Ublituximab (Briumvi) for relapsing multiple sclerosis.', category_description: 'Briumvi is a medicine for treating adults with relapsing forms of multiple sclerosis (a disease of the brain and spinal cord in which inflammation destroys the protective covering around nerves and damages the nerves), where the patient has flare-ups (relapses) followed by periods with milder or no symptoms. It is used in patients with active disease, which means that they have relapses and/or signs of active inflammation on scans.' },
	{ tags:['DMTs','S1P'], id: 40, name: 'Ozanimod', slug: 'ozanimod', description: 'Research on Ozanimod (Zeposia) for multiple sclerosis treatment.', category_description: 'Ozanimod' },
	{ tags:['DMTs','S1P'], id: 41, name: 'Ponesimod', slug: 'ponesimod', description: 'Research on Ponesimod (Ponvory) for multiple sclerosis treatment.', category_description: 'Ponesimod' },
	{ tags:['DMTs','fumarate'], id: 42, name: 'Diroximel Fumarate', slug: 'vumerity', description: 'Research on Vumerity (diroximel fumarate) for multiple sclerosis treatment.', category_description: 'Vumerity or Diroximel fumarate' },
	{ tags:['DMTs','fumarate'], id: 43, name: 'Monomethyl Fumarate', slug: 'monomethyl-fumarate', description: 'Research on Bafiertam (monomethyl fumarate) for multiple sclerosis treatment.', category_description: 'Bafiertam or Monomethyl fumarate' },
	{ tags:['symptomatic'], id: 46, name: 'Naltrexone', slug: 'naltrexone', description: 'Low-dose naltrexone research for multiple sclerosis symptom management.', category_description: 'Naltrexone may work for MS because endorphins help reduce inflammation. Inflammation is the underlying cause of MS symptoms. Some anecdotal evidence supports using low-dose naltrexone for treating MS symptoms. This evidence is primarily from people who report noticing a reduction in symptoms after taking naltrexone.\n\n<a href="https://www.medicalnewstoday.com/articles/325455#naltrexone-and-ms">https://www.medicalnewstoday.com/articles/325455#naltrexone-and-ms</a>' },
	{ tags:['neuroprotection','remyelination','investigational'], id: 47, name: 'CNM-Au8', slug: 'cnm-au8', description: 'Research on CNM-Au8 gold nanocrystal suspension for multiple sclerosis treatment.', category_description: 'CNM-Au8® is a gold nanocrystal suspension currently in development as a disease-modifying treatment for people living with Amyotrophic Lateral Sclerosis (ALS), Multiple Sclerosis (MS), and Parkinson\'s Disease (PD).\n\nsg,fl' },
	{ tags:['remyelination'], id: 48, name: 'Biotin', slug: 'biotin', description: 'High-dose biotin research for progressive multiple sclerosis treatment.', category_description: '' },
	{ tags:['cell therapy','investigational'], id: 49, name: 'CAR-T', slug: 'car-t', description: 'CAR-T cell therapy research for multiple sclerosis treatment.', category_description: '' },
	{ tags:['BTKi','investigational'], id: 50, name: 'Bruton Tyrosine Kinase', slug: 'btk-inhibitors', description: 'BTK inhibitors research for multiple sclerosis treatment.', category_description: 'Bruton Tyrosine Kinase (BTK)' },
	{ tags:['remyelination','investigational'], id: 51, name: 'PIPE-307', slug: 'pipe-307', description: 'Studies on PIPE-307 for enhancing myelin repair in multiple sclerosis.', category_description: 'Researchers aimed to enhance myelin repair in MS by blocking the M1R receptor, identified as a barrier to healing and repair.\nPIPE-307, a molecule that assists myelin repair, was tested in lab-grown cells and laboratory models of MS.\nPIPE-307 could lead to new treatments that improve the body\'s natural ability to repair nerve damage in MS.\n\nSource: https://www.msaustralia.org.au/news/promising-new-treatment-in-the-pipeline-for-remyelination-in-ms/\n\nMore data:\n\n1. https://www.pnas.org/doi/epub/10.1073/pnas.2407974121\n2. https://clinicaltrials.gov/study/NCT04725175' },
	{ tags:['remyelination','investigational'], id: 52, name: 'Elezanumab', slug: 'elezanumab', description: 'Studies on Elezanumab for multiple sclerosis treatment.', category_description: '' },
	{ tags:['investigational'], id: 53, name: 'BIIB091', slug: 'biib091', description: 'Research on BIIB091 for multiple sclerosis treatment.', category_description: 'https://pubs.acs.org/doi/10.1021/acs.jmedchem.1c00926' },
	{ tags:['investigational'], id: 57, name: 'BMS-986368', slug: 'bms-986368', description: 'Studies on BMS-986368 for multiple sclerosis treatment.', category_description: 'BMS-986368' },
	{ tags:['investigational'], id: 59, name: 'AA147', slug: 'aa147', description: 'Studies on AA147 for multiple sclerosis treatment.', category_description: 'AA147 is a endoplasmic reticulum (ER) proteostasis regulator. AA147 promotes protection against oxidative damage in neuronal cells and prevents endothelial barrier dysfunction by activating ATF6 arm (selectively) of the unfolded protein response (UPR) and the NRF2 oxidative stress response.\n\nhttps://pubmed.ncbi.nlm.nih.gov/39928347/?fc=20240915071900&ff=20250210192801&v=2.18.0.post9+e462414' },
	{ tags:['investigational'], id: 66, name: 'Biomaterials and scaffolds', slug: 'biomaterials-and-scaffolds', description: 'Research on biomaterials and scaffolds for multiple sclerosis treatment.', category_description: 'Tissue engineering tools' },
	{ tags:['remyelination'], id: 71, name: 'Clemastine fumarate', slug: 'clemastine-fumarate', description: 'Studies on Clemastine fumarate for promoting remyelination in multiple sclerosis.', category_description: 'Type: Antihistamine (M1 antagonist)\nStatus: Phase II\n\nShown to promote OPC differentiation; used in ReBUILD trial' },
	{ tags:['remyelination','investigational'], id: 72, name: 'Opicinumab (BIIB033)', slug: 'opicinumab-biib033', description: 'Studies on Opicinumab anti-LINGO-1 antibody for remyelination.', category_description: 'Type: Anti-LINGO-1 monoclonal antibody\nStatus: Phase II/III\n\nMixed results; tested in SYNERGY and AFFINITY trials' },
	{ tags:['remyelination','investigational'], id: 73, name: 'rHIgM22', slug: 'rhigm22', description: 'Studies on rHIgM22 human IgM antibody for remyelination.', category_description: 'Type: Human IgM antibody\nStatus: Phase I/II\n\nTargets remyelination; well tolerated in early studies' },
	{ tags:['remyelination','investigational'], id: 75, name: 'Liothyronine (T3)', slug: 'liothyronine-t3', description: 'Research on Liothyronine thyroid hormone for boosting myelin gene expression.', category_description: 'Type: Thyroid hormone\nStatus: Early phase trial\n\nBoosts myelin gene expression; under clinical evaluation' },
	{ tags:['remyelination','investigational'], id: 76, name: 'GSK239512', slug: 'gsk239512', description: 'Studies on GSK239512 H3 histamine receptor antagonist for remyelination.', category_description: 'Type: H3 histamine receptor antagonist\nStatus: Phase II\n\nSmall MRI-based remyelination improvement' },
	{ tags:['remyelination','neuroprotection','investigational'], id: 77, name: 'Ibudilast (MN-166)', slug: 'ibudilast-mn-166', description: 'Research on Ibudilast as a PDE4 inhibitor for neuroprotection and remyelination.', category_description: 'Type: PDE4 inhibitor\nStatus: Phase II\n\nNeuroprotective, possibly remyelinating; tested in MS' },
	{ tags:['remyelination','investigational'], id: 79, name: 'Domperidone', slug: 'domperidone', description: 'Studies on Domperidone for promoting oligodendrocyte differentiation.', category_description: 'Type: Dopamine antagonist\nStatus: Preclinical/Early\n\nInvestigated for promoting OPC differentiation' },
	{ tags:['neuroprotection','investigational'], id: 81, name: 'Ebselen', slug: 'ebselen', description: 'Research on Ebselen as an antioxidant for multiple sclerosis treatment.', category_description: 'Type: Antioxidant\nStatus: Preclinical\n\nPositive animal model results' },
	{ tags:['investigational'], id: 87, name: 'Anti-Nogo receptor therapies', slug: 'anti-nogo-receptor-therapies', description: 'Research on Anti-Nogo receptor therapies for multiple sclerosis treatment.', category_description: 'Type: Molecular inhibitors\nStatus: Preclinical\n\nTarget remyelination inhibitors in CNS' }
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
  const allTags = [...new Set(categories.flatMap(cat => cat.tags))].sort();

  // Initialize categories and handle URL params
  useEffect(() => {
    setCategories(CATEGORIES);
    
    // Get search parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search') || '';
    const tagsFromUrl = urlParams.get('tags') ? urlParams.get('tags').split(',') : [];
    
    // Set search and tags from URL if available
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
    if (tagsFromUrl.length > 0) {
      setSelectedTags(tagsFromUrl);
    }
    
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
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.category_description && category.category_description.toLowerCase().includes(searchTerm.toLowerCase()))
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
      umami.track(`observatory-category-${category.slug}`, {
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
      )}
    </div>
  );
}

export default Observatory;
