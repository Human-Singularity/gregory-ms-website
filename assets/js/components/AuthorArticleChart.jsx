import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { articleService, API_URL } from '../services/api';

/**
 * AuthorArticleChart component - Chart showing cumulative articles and ML predictions per month
 * @param {object} props - Component props
 * @param {number} props.authorId - The author ID to fetch data for
 * @param {Array} props.articles - Optional array of articles to use instead of fetching
 */
export function AuthorArticleChart({ authorId, articles: providedArticles }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get ML predictions from articles
  const getMostRecentPredictions = (article) => {
    if (!article.ml_predictions || !Array.isArray(article.ml_predictions)) {
      return [];
    }

    const predictionsByAlgorithm = {};
    article.ml_predictions.forEach(prediction => {
      const algorithm = prediction.algorithm;
      if (!predictionsByAlgorithm[algorithm] || 
          new Date(prediction.created_date) > new Date(predictionsByAlgorithm[algorithm].created_date)) {
        predictionsByAlgorithm[algorithm] = prediction;
      }
    });

    return Object.values(predictionsByAlgorithm);
  };

  useEffect(() => {
    if (!authorId) return;

    const processArticles = (articlesData) => {
      if (articlesData.length === 0) {
        setData([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Group articles by year-month and track ML predictions
      const monthlyGroups = {};
      
      articlesData.forEach(article => {
        if (article.published_date) {
          const date = new Date(article.published_date);
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-indexed
          const key = `${year}-${month}`;
          
          if (!monthlyGroups[key]) {
            monthlyGroups[key] = {
              year,
              month: month + 1, // Convert to 1-indexed for display
              count: 0,
              date: new Date(year, month, 1),
              dateKey: `${year}-${String(month + 1).padStart(2, '0')}`, // YYYY-MM format
              lgbmRelevant: 0,
              lstmRelevant: 0,
              pubmedBertRelevant: 0
            };
          }
          monthlyGroups[key].count++;

          // Count ML predictions for this article
          const predictions = getMostRecentPredictions(article);
          predictions.forEach(prediction => {
            if (prediction.predicted_relevant) {
              switch (prediction.algorithm) {
                case 'lgbm_tfidf':
                  monthlyGroups[key].lgbmRelevant++;
                  break;
                case 'lstm':
                  monthlyGroups[key].lstmRelevant++;
                  break;
                case 'pubmed_bert':
                  monthlyGroups[key].pubmedBertRelevant++;
                  break;
              }
            }
          });
        }
      });
      
      // Convert to array and sort by date
      const monthlyData = Object.values(monthlyGroups).sort((a, b) => a.date - b.date);
      
      // Create a complete date range from first to last publication
      if (monthlyData.length === 0) {
        setData([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      const firstDate = monthlyData[0].date;
      const lastDate = monthlyData[monthlyData.length - 1].date;
      
      // Generate all months between first and last date
      const completeData = [];
      const currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      const endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
      
      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const key = `${year}-${month}`;
        
        // Find existing data for this month or create empty entry
        const existingData = monthlyGroups[key] || {
          year,
          month: month + 1,
          count: 0,
          date: new Date(year, month, 1),
          dateKey: `${year}-${String(month + 1).padStart(2, '0')}`,
          lgbmRelevant: 0,
          lstmRelevant: 0,
          pubmedBertRelevant: 0
        };
        
        completeData.push(existingData);
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Create cumulative data
      let cumulativeArticles = 0;
      let cumulativeLgbm = 0;
      let cumulativeLstm = 0;
      let cumulativePubmedBert = 0;

      const cumulativeData = completeData.map(item => {
        cumulativeArticles += item.count;
        cumulativeLgbm += item.lgbmRelevant;
        cumulativeLstm += item.lstmRelevant;
        cumulativePubmedBert += item.pubmedBertRelevant;

        return {
          ...item,
          cumulative: cumulativeArticles,
          cumulativeArticles,
          cumulativeLgbm,
          cumulativeLstm,
          cumulativePubmedBert
        };
      });

      setData(cumulativeData);
      setError(null);
      setLoading(false);
    };

    // If articles are provided as props, use them directly
    if (providedArticles && Array.isArray(providedArticles)) {
      processArticles(providedArticles);
      return;
    }

    // Otherwise, fetch articles (fallback for standalone usage)
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all articles for this author by paginating through all pages
        let allArticles = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await articleService.getArticlesByAuthor(authorId, page);
          const pageResults = response.data.results || [];
          allArticles = [...allArticles, ...pageResults];
          
          // Check if there are more pages
          hasMore = response.data.next !== null;
          page++;
        }
        
        processArticles(allArticles);
      } catch (err) {
        console.error('Error fetching author articles for chart:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId, providedArticles]);

  // Format x-axis labels
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Static activeDot functions to prevent re-renders
  const articlesActiveDot = { fill: '#007bff', strokeWidth: 2, r: 6 };
  const lgbmActiveDot = { fill: '#fd7e14', strokeWidth: 2, r: 5 };
  const lstmActiveDot = { fill: '#dc3545', strokeWidth: 2, r: 5 };
  const pubmedBertActiveDot = { fill: '#6f42c1', strokeWidth: 2, r: 5 };

  // Custom tooltip with enhanced accessibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
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
              } else if (entry.dataKey === 'count') {
                displayText = `Articles (Monthly): ${entry.value}`;
                ariaLabel = `Articles this month: ${entry.value}`;
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

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        <h6>Chart Unavailable</h6>
        <p className="mb-0">Unable to load publication timeline data.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="alert alert-info">
        <h6>No Publication Data</h6>
        <p className="mb-0">No publication timeline data available for this author.</p>
      </div>
    );
  }

  return (
    <div className="author-article-chart">
      <div className="mb-3">
        <div className="chart-legend" role="region" aria-label="Chart legend explaining the different data series">
          <h6 className="sr-only">Chart Legend</h6>
          <div className="legend-items" role="list">
            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
              <i className="fas fa-chart-line text-info mr-2" aria-hidden="true"></i>
              <span>Blue line: Cumulative articles</span>
            </div>
            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
              <i className="fas fa-chart-line text-warning mr-2" aria-hidden="true"></i>
              <span>Orange dashed: LightGBM predictions</span>
            </div>
            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
              <i className="fas fa-chart-line text-danger mr-2" aria-hidden="true"></i>
              <span>Red dashed: LSTM predictions</span>
            </div>
            <div className="legend-item d-inline-block mr-4 mb-2" role="listitem">
              <i className="fas fa-chart-line mr-2" style={{ color: '#6f42c1' }} aria-hidden="true"></i>
              <span>Purple dashed: PubMed BERT predictions</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="chart-container" style={{ width: '100%', height: '400px', marginBottom: '1rem' }}>
        {/* Chart description for screen readers */}
        <div className="sr-only">
          <h3>Publication Timeline Chart</h3>
          <p>
            This chart shows publication activity over time with {data.length} data points from {data.length > 0 ? formatXAxis(data[0].date) : 'N/A'} to {data.length > 0 ? formatXAxis(data[data.length - 1].date) : 'N/A'}.
            The chart displays cumulative articles (blue line) and ML model predictions from LightGBM (orange dashed line), LSTM (red dashed line), and PubMed BERT (purple dashed line).
            Current totals: {data.length > 0 ? data[data.length - 1]?.cumulativeArticles || 0 : 0} total articles.
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={data}
            role="img"
            aria-label={`Publication timeline chart showing ${data.length} data points with cumulative articles and ML predictions.`}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
            />
            <YAxis yAxisId="left" orientation="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cumulativeArticles" 
              stroke="#007bff" 
              strokeWidth={3}
              name="Articles (Cumulative)"
              dot={false}
              activeDot={articlesActiveDot}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cumulativeLgbm" 
              stroke="#fd7e14" 
              strokeWidth={3}
              name="LightGBM (Cumulative)"
              dot={false}
              activeDot={lgbmActiveDot}
              strokeDasharray="5 5"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cumulativeLstm" 
              stroke="#dc3545" 
              strokeWidth={3}
              name="LSTM (Cumulative)"
              dot={false}
              activeDot={lstmActiveDot}
              strokeDasharray="8 4"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cumulativePubmedBert" 
              stroke="#6f42c1" 
              strokeWidth={3}
              name="PubMed BERT (Cumulative)"
              dot={false}
              activeDot={pubmedBertActiveDot}
              strokeDasharray="12 3"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Data table alternative for screen readers and keyboard users */}
      <details className="mt-3">
        <summary className="btn btn-secondary btn-sm">
          <i className="fas fa-table mr-2"></i>
          View Chart Data as Table
        </summary>
        <div className="table-responsive mt-3">
          <table className="table table-sm table-striped" role="table" aria-label="Chart data in tabular format">
            <caption className="sr-only">
              Monthly publication data showing articles and ML predictions over time
            </caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Cumulative Articles</th>
                <th scope="col">LightGBM (Cumulative)</th>
                <th scope="col">LSTM (Cumulative)</th>
                <th scope="col">PubMed BERT (Cumulative)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{formatXAxis(item.date)}</td>
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
      
      <div className="mt-3 text-center">
        <small className="text-muted">
          Total publications: {data.length > 0 ? data[data.length - 1].cumulativeArticles : 0} articles
          {data.length > 0 && data[data.length - 1].cumulativeLgbm > 0 && (
            <span className="ms-2">
              • ML predictions: LightGBM ({data[data.length - 1].cumulativeLgbm}), 
              LSTM ({data[data.length - 1].cumulativeLstm}), 
              PubMed BERT ({data[data.length - 1].cumulativePubmedBert})
            </span>
          )}
        </small>
      </div>
    </div>
  );
}

AuthorArticleChart.propTypes = {
  authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  articles: PropTypes.arrayOf(PropTypes.object), // Optional array of article objects
};

export default AuthorArticleChart;
