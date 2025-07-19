/**
 * CategoryDetail component - Displays detailed information about a category with chart and tabs
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
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
      // Use the categoryService instead of direct axios call
      const response = await categoryService.getMonthlyCounts(category.slug);
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Handle both ISO format and YYYY-MM format
      const date = label.includes && label.includes('T') ? new Date(label) : new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-weight-bold mb-2">{formattedDate}</p>
          {payload.map((entry, index) => {
            // Custom display for different data types
            if (entry.dataKey === 'cumulativeArticles') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  Articles (Total): {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'cumulativeLgbm') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  LightGBM (Total): {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'cumulativeLstm') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  LSTM (Total): {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'cumulativePubmedBert') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  PubMed BERT (Total): {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'trials') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  Clinical Trials: {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'lgbmRelevant') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  LightGBM (Monthly): {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'lstmRelevant') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  LSTM (Monthly): {entry.value}
                </p>
              );
            } else if (entry.dataKey === 'pubmedBertRelevant') {
              return (
                <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                  PubMed BERT (Monthly): {entry.value}
                </p>
              );
            }
            return (
              <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                {entry.name}: {entry.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

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

  return (
    <div className="row">
      <div className="col-md-12">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-primary">{category.name}</h2>
            <p className="text-muted">{category.description}</p>
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
              ) : chartData.length > 0 ? (
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title mb-2">Monthly Research Activity</h5>
                        <p className="text-muted mb-0">
                          <i className="fas fa-chart-bar text-success mr-2"></i>Green bars show clinical trials
                          <span className="mx-3">•</span>
                          <i className="fas fa-chart-line text-info mr-2"></i>Blue line shows cumulative articles
                          <br/>
                          <i className="fas fa-chart-line text-warning mr-2"></i>Orange line: LightGBM model
                          <span className="mx-3">•</span>
                          <i className="fas fa-chart-line text-danger mr-2"></i>Red line: LSTM model
                          <span className="mx-3">•</span>
                          <i className="fas fa-chart-line text-purple mr-2"></i>Purple line: PubMed BERT model
                        </p>
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
                      <ResponsiveContainer>
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatXAxis}
                          />
                          <YAxis yAxisId="left" orientation="left" />
                          <YAxis yAxisId="right" orientation="right" />
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
                            strokeWidth={2}
                            name="Articles (Cumulative)"
                            dot={{ fill: '#007bff', strokeWidth: 1, r: 3 }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativeLgbm" 
                            stroke="#fd7e14" 
                            strokeWidth={2}
                            name="LightGBM (Cumulative)"
                            dot={{ fill: '#fd7e14', strokeWidth: 1, r: 2 }}
                            strokeDasharray="5 5"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativeLstm" 
                            stroke="#dc3545" 
                            strokeWidth={2}
                            name="LSTM (Cumulative)"
                            dot={{ fill: '#dc3545', strokeWidth: 1, r: 2 }}
                            strokeDasharray="8 4"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cumulativePubmedBert" 
                            stroke="#6f42c1" 
                            strokeWidth={2}
                            name="PubMed BERT (Cumulative)"
                            dot={{ fill: '#6f42c1', strokeWidth: 1, r: 2 }}
                            strokeDasharray="12 3"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
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
                  apiEndpoint={`${config.API_URL}/articles/search/`}
                  fileName={`${category.slug}-articles.csv`}
                  searchParams={{
                    team_id: config.TEAM_ID,
                    subject_id: config.SUBJECT_ID,
                    search: category.name, // Search by category name
                  }}
                />
              </div>
              
              <ArticleList 
                type="category" 
                options={{ category: category.slug }}
              />
            </div>
          )}

          {/* Trials Tab */}
          {activeTab === 'trials' && (
            <div className="tab-pane fade show active">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Clinical Trials</h5>
                <DownloadButton
                  apiEndpoint={`${config.API_URL}/trials/search/`}
                  fileName={`${category.slug}-trials.csv`}
                  searchParams={{
                    team_id: config.TEAM_ID,
                    subject_id: config.SUBJECT_ID,
                    search: category.name, // Search by category name
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
