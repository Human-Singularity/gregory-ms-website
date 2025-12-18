/**
 * CategoryDetail component - Displays detailed information about a category with chart and tabs
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { categoryService } from '../services/api';
import ArticleList from './ArticleList';
import TrialsList from './TrialsList';
import AuthorsList from './AuthorsList';
import DownloadButton from './DownloadButton';
import BadgeExplanation from './BadgeExplanation';

/**
 * CategoryDetail component
 * @param {Object} props - Component props
 * @param {Object} props.category - Category object with slug, name, and description
 * @param {Object} props.config - Configuration object with API_URL, TEAM_ID, SUBJECT_ID
 * @param {Function} props.onBack - Callback function to go back to categories list
 */
function CategoryDetail({ category, config, onBack }) {
  const [activeTab, setActiveTab] = useState('chart');
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState({
    chart: false
  });
  const [error, setError] = useState(null);
  
  // Date filter states
  const [dateFilter, setDateFilter] = useState('last12months'); // 'last12months', 'custom', 'all'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Load chart data on component mount
  useEffect(() => {
    loadMonthlyData();
  }, [category.slug]);

  // Load monthly counts data
  const loadMonthlyData = async () => {
    setLoading(prev => ({ ...prev, chart: true }));
    setError(null);

    try {
      // Use the categoryService with category ID instead of slug
      const response = await categoryService.getMonthlyCounts(category.id);
      setMonthlyData(response.data);
    } catch (err) {
      console.error('Error loading monthly data:', err);
      setError('Failed to load monthly data');
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Format data for the chart with date filtering
  const formatChartData = (data) => {
    if (!data || !Array.isArray(data.monthly_article_counts) || !Array.isArray(data.monthly_trial_counts)) {
      return [];
    }
    
    const combinedData = {};
    
    // Process article counts
    data.monthly_article_counts.forEach(item => {
      const date = item.month;
      // Skip items with null or undefined dates
      if (!date) return;
      
      if (!combinedData[date]) {
        combinedData[date] = { 
          date, 
          articles: 0, 
          trials: 0,
          mlRelevantArticles: 0,
          lgbmRelevant: 0,
          lstmRelevant: 0,
          pubmedBertRelevant: 0
        };
      }
      combinedData[date].articles = item.count;
    });
    
    // Process trial counts
    data.monthly_trial_counts.forEach(item => {
      const date = item.month;
      // Skip items with null or undefined dates
      if (!date) return;
      
      if (!combinedData[date]) {
        combinedData[date] = { 
          date, 
          articles: 0, 
          trials: 0,
          mlRelevantArticles: 0,
          lgbmRelevant: 0,
          lstmRelevant: 0,
          pubmedBertRelevant: 0
        };
      }
      combinedData[date].trials = item.count;
    });
    
    // Process ML model counts if available
    if (data.monthly_ml_article_counts_by_model) {
      // Process each model's counts
      Object.keys(data.monthly_ml_article_counts_by_model).forEach(modelName => {
        const modelCounts = data.monthly_ml_article_counts_by_model[modelName];
        
        modelCounts.forEach(item => {
          const date = item.month;
          // Skip items with null or undefined dates
          if (!date) return;
          
          if (!combinedData[date]) {
            combinedData[date] = { 
              date, 
              articles: 0, 
              trials: 0,
              mlRelevantArticles: 0,
              lgbmRelevant: 0,
              lstmRelevant: 0,
              pubmedBertRelevant: 0
            };
          }
          
          // Map model names to chart fields
          switch (modelName) {
            case 'lgbm_tfidf':
              combinedData[date].lgbmRelevant = item.count;
              break;
            case 'lstm':
              combinedData[date].lstmRelevant = item.count;
              break;
            case 'pubmed_bert':
              combinedData[date].pubmedBertRelevant = item.count;
              break;
          }
          
          // Update total ML relevant articles (use highest count among models for this month)
          combinedData[date].mlRelevantArticles = Math.max(
            combinedData[date].mlRelevantArticles,
            item.count
          );
        });
      });
    }
    
    // Sort all data by date first
    const allSortedData = Object.values(combinedData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate cumulative articles for ALL data first
    let cumulativeArticles = 0;
    let cumulativeLgbm = 0;
    let cumulativeLstm = 0;
    let cumulativePubmedBert = 0;
    const allDataWithCumulative = allSortedData.map(item => {
      cumulativeArticles += item.articles;
      cumulativeLgbm += item.lgbmRelevant;
      cumulativeLstm += item.lstmRelevant;
      cumulativePubmedBert += item.pubmedBertRelevant;
      return {
        ...item,
        cumulativeArticles,
        cumulativeLgbm,
        cumulativeLstm,
        cumulativePubmedBert
      };
    });
    
    // Now apply date filtering
    let filteredData = allDataWithCumulative;
    
    if (dateFilter === 'last12months') {
      const currentDate = new Date();
      const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1);
      
      filteredData = allDataWithCumulative.filter(item => {
        // Parse the date string (can be YYYY-MM or ISO format)
        // Skip items with invalid dates
        if (!item.date || typeof item.date !== 'string') return false;
        
        let itemDate;
        
        // Handle ISO format dates (e.g., "1970-12-01T00:00:00Z")
        if (item.date.includes('T')) {
          itemDate = new Date(item.date);
        } else {
          // Handle YYYY-MM format
          const dateParts = item.date.split('-');
          if (dateParts.length !== 2) return false;
          
          const [year, month] = dateParts.map(Number);
          if (isNaN(year) || isNaN(month)) return false;
          
          itemDate = new Date(year, month - 1, 1); // month - 1 because months are 0-indexed
        }
        
        return itemDate >= twelveMonthsAgo;
      });
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const [startYear, startMonth] = customStartDate.split('-').map(Number);
      const [endYear, endMonth] = customEndDate.split('-').map(Number);
      
      const startDate = new Date(startYear, startMonth - 1, 1);
      const endDate = new Date(endYear, endMonth, 1); // Next month to include the entire end month
      
      filteredData = allDataWithCumulative.filter(item => {
        // Skip items with invalid dates
        if (!item.date || typeof item.date !== 'string') return false;
        
        let itemDate;
        
        // Handle ISO format dates (e.g., "1970-12-01T00:00:00Z")
        if (item.date.includes('T')) {
          itemDate = new Date(item.date);
        } else {
          // Handle YYYY-MM format
          const dateParts = item.date.split('-');
          if (dateParts.length !== 2) return false;
          
          const [year, month] = dateParts.map(Number);
          if (isNaN(year) || isNaN(month)) return false;
          
          itemDate = new Date(year, month - 1, 1);
        }
        
        return itemDate >= startDate && itemDate < endDate;
      });
    }
    
    return filteredData;
  };

  // Format x-axis labels
  const formatXAxis = (tickItem) => {
    // Handle both ISO format and YYYY-MM format
    const date = tickItem.includes && tickItem.includes('T') ? new Date(tickItem) : new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Custom tooltip with enhanced accessibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Handle both ISO format and YYYY-MM format
      const date = label.includes && label.includes('T') ? new Date(label) : new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      return (
        <div 
          className="bg-white p-3 border rounded shadow"
          role="tooltip"
          aria-label={`Data for ${formattedDate}`}
        >
          <p className="font-weight-bold mb-2" id="tooltip-header">{formattedDate}</p>
          <div role="list" aria-labelledby="tooltip-header">
            {payload.map((entry, index) => {
              let displayText = '';
              let ariaLabel = '';
              
              // Custom display for different data types
              if (entry.dataKey === 'cumulativeArticles') {
                displayText = `Articles (Total): ${entry.value}`;
                ariaLabel = `Total articles: ${entry.value}`;
              } else if (entry.dataKey === 'cumulativeLgbm') {
                displayText = `LightGBM (Total): ${entry.value}`;
                ariaLabel = `LightGBM model total predictions: ${entry.value}`;
              } else if (entry.dataKey === 'cumulativeLstm') {
                displayText = `LSTM (Total): ${entry.value}`;
                ariaLabel = `LSTM model total predictions: ${entry.value}`;
              } else if (entry.dataKey === 'cumulativePubmedBert') {
                displayText = `PubMed BERT (Total): ${entry.value}`;
                ariaLabel = `PubMed BERT model total predictions: ${entry.value}`;
              } else if (entry.dataKey === 'trials') {
                displayText = `Clinical Trials: ${entry.value}`;
                ariaLabel = `Clinical trials this month: ${entry.value}`;
              } else if (entry.dataKey === 'lgbmRelevant') {
                displayText = `LightGBM (Monthly): ${entry.value}`;
                ariaLabel = `LightGBM model monthly predictions: ${entry.value}`;
              } else if (entry.dataKey === 'lstmRelevant') {
                displayText = `LSTM (Monthly): ${entry.value}`;
                ariaLabel = `LSTM model monthly predictions: ${entry.value}`;
              } else if (entry.dataKey === 'pubmedBertRelevant') {
                displayText = `PubMed BERT (Monthly): ${entry.value}`;
                ariaLabel = `PubMed BERT model monthly predictions: ${entry.value}`;
              } else {
                displayText = `${entry.name}: ${entry.value}`;
                ariaLabel = `${entry.name}: ${entry.value}`;
              }
              
              return (
                <p 
                  key={index} 
                  style={{ color: entry.color, margin: '2px 0' }}
                  role="listitem"
                  aria-label={ariaLabel}
                >
                  {displayText}
                </p>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Check if data is too sparse for meaningful visualization
  const isSparseData = (data) => {
    if (!data || data.length === 0) return false;
    
    // Consider data sparse if:
    // 1. Less than 3 data points total, OR
    // 2. Data points are spread across more than 2 years but have less than 6 data points
    const totalDataPoints = data.length;
    if (totalDataPoints < 3) return true;
    
    if (totalDataPoints < 6) {
      // Check if data spans more than 2 years
      const dates = data.map(item => new Date(item.date)).sort((a, b) => a - b);
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      const yearsDiff = (lastDate.getFullYear() - firstDate.getFullYear());
      
      if (yearsDiff > 2) return true;
    }
    
    return false;
  };

  // Render sparse data message
  const renderSparseDataMessage = (data) => {
    const totalArticles = monthlyData?.monthly_article_counts?.reduce((sum, item) => sum + item.count, 0) || 0;
    const totalTrials = monthlyData?.monthly_trial_counts?.reduce((sum, item) => sum + item.count, 0) || 0;
    const dataPointCount = data && data.length > 0 ? data.length : 0;
    
    return (
      <div className="alert alert-warning" style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3', color: '#0d47a1' }}>
        <h5 className="mb-3">
          <i className="fas fa-info-circle mr-2" style={{ color: '#1976d2' }}></i>
          Limited Data Available
        </h5>
        <p className="mb-3" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
          This category has limited research activity with only <strong>{dataPointCount} data points </strong>  
          spanning multiple years, which makes trend visualization less meaningful.
        </p>
        <div className="row mt-4">
          <div className="col-md-6 mb-3">
            <div className="card border-primary" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body text-center py-4">
                <h6 className="text-primary mb-2" style={{ fontWeight: '600' }}>Total Articles</h6>
                <h3 className="mb-0" style={{ color: '#1976d2', fontWeight: 'bold' }}>{totalArticles}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card border-success" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body text-center py-4">
                <h6 className="text-success mb-2" style={{ fontWeight: '600' }}>Total Trials</h6>
                <h3 className="mb-0" style={{ color: '#388e3c', fontWeight: 'bold' }}>{totalTrials}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 p-3" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: '6px' }}>
          <p className="mb-0" style={{ fontSize: '0.95rem' }}>
            <i className="fas fa-lightbulb mr-2" style={{ color: '#ff9800' }}></i>
            <strong>Tip:</strong> Use the <strong>Articles</strong> and <strong>Clinical Trials</strong> tabs below to explore the specific research available for this category.
          </p>
        </div>
      </div>
    );
  };

  // Get formatted chart data

  // Handle date filter changes
  const handleDateFilterChange = (newFilter) => {
    setDateFilter(newFilter);
    
    // Set default date range for custom filter
    if (newFilter === 'custom' && !customStartDate && !customEndDate) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      
      setCustomStartDate(startDate.toISOString().slice(0, 7)); // YYYY-MM format
      setCustomEndDate(endDate.toISOString().slice(0, 7));
    }
  };

  const chartData = formatChartData(monthlyData);

  // Function to render category description with markdown formatting
  const renderCategoryDescription = (category) => {
    // Use category_description if available, otherwise fall back to description
    const fullDescription = category.category_description || category.description || '';
    
    if (!fullDescription.trim()) {
      return null;
    }
    
    return (
      <div className="category-description text-muted">
        <ReactMarkdown
          components={{
            // Customize link rendering to open in new tab
            a: ({ href, children, ...props }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary"
                {...props}
              >
                {children}
              </a>
            ),
            // Style paragraphs
            p: ({ children, ...props }) => (
              <p className="text-muted mb-2" {...props}>
                {children}
              </p>
            ),
            // Style headings
            h1: ({ children, ...props }) => (
              <h4 className="text-primary mt-3 mb-2" {...props}>
                {children}
              </h4>
            ),
            h2: ({ children, ...props }) => (
              <h5 className="text-primary mt-3 mb-2" {...props}>
                {children}
              </h5>
            ),
            h3: ({ children, ...props }) => (
              <h6 className="text-primary mt-2 mb-1" {...props}>
                {children}
              </h6>
            ),
            // Style lists
            ul: ({ children, ...props }) => (
              <ul className="text-muted mb-2" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="text-muted mb-2" {...props}>
                {children}
              </ol>
            ),
            // Style code
            code: ({ children, ...props }) => (
              <code className="bg-light px-1 rounded" {...props}>
                {children}
              </code>
            ),
            // Style blockquotes
            blockquote: ({ children, ...props }) => (
              <blockquote className="blockquote text-muted border-left border-primary pl-3 ml-3" {...props}>
                {children}
              </blockquote>
            )
          }}
        >
          {fullDescription}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="row">
      <div className="col-md-12">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="flex-grow-1 mr-3">
            <h2 className="text-primary">{category.name}</h2>
            {renderCategoryDescription(category)}
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onBack}
            data-umami-event="click--observatory-back"
            data-umami-event-category={category.name}
          >
            <i className="fa fa-arrow-left mr-2"></i>
            Back to Categories
          </button>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4 observatory-tabs" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => handleTabChange('chart')}
              data-umami-event="click--observatory-tab"
              data-umami-event-tab="chart"
              data-umami-event-category={category.name}
            >
              <i className="fa fa-chart-line mr-2"></i>
              Monthly Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'articles' ? 'active' : ''}`}
              onClick={() => handleTabChange('articles')}
              data-umami-event="click--observatory-tab"
              data-umami-event-tab="articles"
              data-umami-event-category={category.name}
            >
              <i className="fa fa-file-text mr-2"></i>
              Articles
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'trials' ? 'active' : ''}`}
              onClick={() => handleTabChange('trials')}
              data-umami-event="click--observatory-tab"
              data-umami-event-tab="trials"
              data-umami-event-category={category.name}
            >
              <i className="fa fa-flask mr-2"></i>
              Clinical Trials
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'authors' ? 'active' : ''}`}
              onClick={() => handleTabChange('authors')}
              data-umami-event="click--observatory-tab"
              data-umami-event-tab="authors"
              data-umami-event-category={category.name}
            >
              <i className="fa fa-users mr-2"></i>
              Top Authors
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Chart Tab */}
          {activeTab === 'chart' && (
            <div className="tab-pane fade show active">
              {loading.chart ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading chart...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <h4>Error</h4>
                  <p>{error}</p>
                </div>
              ) : monthlyData && chartData.length > 0 && !isSparseData(chartData) ? (
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title mb-2">Monthly Research Activity</h5>
                        <div className="chart-legend" role="region" aria-label="Chart legend explaining the different data series">
                          <h6 className="sr-only">Chart Legend</h6>
                          <div className="legend-items" role="list">
                            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
                              <i className="fas fa-chart-bar text-success mr-2" aria-hidden="true"></i>
                              <span>Green bars: Monthly clinical trials</span>
                            </div>
                            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
                              <i className="fas fa-chart-line text-info mr-2" aria-hidden="true"></i>
                              <span>Blue line: Cumulative articles</span>
                            </div>
                            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
                              <i className="fas fa-chart-line text-warning mr-2" aria-hidden="true"></i>
                              <span>Orange dashed: LightGBM model</span>
                            </div>
                            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
                              <i className="fas fa-chart-line text-danger mr-2" aria-hidden="true"></i>
                              <span>Red dashed: LSTM model</span>
                            </div>
                            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
                              <i className="fas fa-chart-line mr-2" style={{ color: '#6f42c1' }} aria-hidden="true"></i>
                              <span>Purple dashed: PubMed BERT model</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Date Filter Controls */}
                      <div className="d-flex flex-column align-items-end">
                        <div className="btn-group btn-group-sm mb-2" role="group">
                          <button
                            type="button"
                            className={`btn ${dateFilter === 'last12months' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateFilterChange('last12months')}
                          >
                            Last 12 Months
                          </button>
                          <button
                            type="button"
                            className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateFilterChange('all')}
                          >
                            All Time
                          </button>
                          <button
                            type="button"
                            className={`btn ${dateFilter === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDateFilterChange('custom')}
                          >
                            Custom Range
                          </button>
                        </div>
                        
                        {/* Custom Date Range Inputs */}
                        {dateFilter === 'custom' && (
                          <div className="d-flex align-items-center">
                            <input
                              type="month"
                              className="form-control form-control-sm mr-2"
                              style={{ width: '130px' }}
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              placeholder="Start"
                            />
                            <span className="text-muted mr-2">to</span>
                            <input
                              type="month"
                              className="form-control form-control-sm"
                              style={{ width: '130px' }}
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              placeholder="End"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="observatory-chart" style={{ width: '100%', height: '400px' }}>
                      {/* Chart description for screen readers */}
                      <div className="sr-only">
                        <h3>Monthly Overview Chart for {category.name}</h3>
                        <p>
                          This chart shows research activity over time with {chartData.length} data points from {chartData.length > 0 ? formatXAxis(chartData[0].date) : 'N/A'} to {chartData.length > 0 ? formatXAxis(chartData[chartData.length - 1].date) : 'N/A'}.
                          The chart displays cumulative articles (blue line), clinical trials per month (green bars), and ML model predictions from LightGBM (orange dashed line), LSTM (red dashed line), and PubMed BERT (purple dashed line).
                          Current totals: {chartData.length > 0 ? chartData[chartData.length - 1]?.cumulativeArticles || 0 : 0} total articles, {chartData.reduce((sum, item) => sum + (item.trials || 0), 0)} total trials.
                        </p>
                      </div>
                      
                      <ResponsiveContainer>
                        <ComposedChart 
                          data={chartData}
                          role="img"
                          aria-label={`Monthly research activity chart for ${category.name}. Shows ${chartData.length} data points with cumulative articles and monthly clinical trials.`}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatXAxis}
                          />
                          <YAxis yAxisId="left" orientation="left" label={{ value: 'Monthly Trials', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Cumulative Articles', angle: 90, position: 'insideRight' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar 
                            yAxisId="left"
                            dataKey="trials" 
                            fill="#28a745" 
                            name="Clinical Trials (Monthly)"
                            opacity={0.8}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativeArticles" 
                            stroke="#007bff" 
                            strokeWidth={3}
                            name="Articles (Cumulative)"
                            dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativeLgbm" 
                            stroke="#fd7e14" 
                            strokeWidth={3}
                            name="LightGBM (Cumulative)"
                            dot={{ fill: '#fd7e14', strokeWidth: 2, r: 3, symbol: 'square' }}
                            strokeDasharray="5 5"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativeLstm" 
                            stroke="#dc3545" 
                            strokeWidth={3}
                            name="LSTM (Cumulative)"
                            dot={{ fill: '#dc3545', strokeWidth: 2, r: 3, symbol: 'triangle' }}
                            strokeDasharray="8 4"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativePubmedBert" 
                            stroke="#6f42c1" 
                            strokeWidth={3}
                            name="PubMed BERT (Cumulative)"
                            dot={{ fill: '#6f42c1', strokeWidth: 2, r: 3, symbol: 'diamond' }}
                            strokeDasharray="12 3"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                      
                      {/* Data table alternative for screen readers and keyboard users */}
                      <details className="mt-4">
                        <summary className="btn btn-secondary btn-sm">
                          <i className="fas fa-table mr-2"></i>
                          View Chart Data as Table
                        </summary>
                        <div className="table-responsive mt-3">
                          <table className="table table-sm table-striped" role="table" aria-label="Chart data in tabular format">
                            <caption className="sr-only">
                              Monthly research data for {category.name} showing articles, trials, and ML predictions over time
                            </caption>
                            <thead>
                              <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Monthly Trials</th>
                                <th scope="col">Cumulative Articles</th>
                                <th scope="col">LightGBM (Cumulative)</th>
                                <th scope="col">LSTM (Cumulative)</th>
                                <th scope="col">PubMed BERT (Cumulative)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chartData.map((item, index) => (
                                <tr key={index}>
                                  <td>{formatXAxis(item.date)}</td>
                                  <td>{item.trials || 0}</td>
                                  <td>{item.cumulativeArticles || 0}</td>
                                  <td>{item.cumulativeLgbm || 0}</td>
                                  <td>{item.cumulativeLstm || 0}</td>
                                  <td>{item.cumulativePubmedBert || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ) : monthlyData && (chartData.length > 0 && isSparseData(chartData) || 
                         (monthlyData.monthly_article_counts?.length > 0 || monthlyData.monthly_trial_counts?.length > 0)) ? (
                renderSparseDataMessage(chartData.length > 0 ? chartData : [])
              ) : (
                <div className="alert alert-info">
                  <p>No data available for this category.</p>
                </div>
              )}
              
              {/* Badge Explanation Section - Always show this */}
              <BadgeExplanation />
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Research Articles</h5>
                <DownloadButton
                  apiEndpoint={`${config.API_URL}/articles/`}
                  fileName={`${category.slug}-articles.csv`}
                  searchParams={{
                    team_id: config.TEAM_ID,
                    subject_id: config.SUBJECT_ID,
                    category_slug: category.slug, // Filter by category slug for accurate results
                  }}
                />
              </div>
              
              <ArticleList 
                type="category" 
                options={{ category: category.slug }}
                isObservatory={true}
              />
            </div>
          )}

          {/* Trials Tab */}
          {activeTab === 'trials' && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Clinical Trials</h5>
                <DownloadButton
                  apiEndpoint={`${config.API_URL}/trials/`}
                  fileName={`${category.slug}-trials.csv`}
                  searchParams={{
                    team_id: config.TEAM_ID,
                    subject_id: config.SUBJECT_ID,
                    category_slug: category.slug, // Filter by category slug for accurate results
                  }}
                />
              </div>
              
              <TrialsList 
                type="category" 
                options={{ category: category.slug }}
              />
            </div>
          )}

          {/* Authors Tab */}
          {activeTab === 'authors' && (
            <div className="tab-pane fade show active">
              <AuthorsList 
                category={category}
                config={config}
                isActive={activeTab === 'authors'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryDetail;
