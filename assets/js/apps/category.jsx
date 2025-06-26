/**
 * Category app entry point
 */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import * as d3 from 'd3';
import ArticleList from '../components/ArticleList';
import TrialsList from '../components/TrialsList';
import DownloadButton from '../components/DownloadButton';

/**
 * InteractiveLineChart component - Displays monthly counts for a category
 */
function InteractiveLineChart() {
  const API_URL = 'https://api.gregory-ms.com';
  const { category } = useParams();
  
  const monthlyCountsEndpoint = `${API_URL}/teams/1/categories/${category}/monthly-counts/`;
  const categoryTrialsEndpoint = `${API_URL}/teams/1/trials/category/${category}/?format=json`;
  
  const [monthlyCounts, setMonthlyCounts] = useState(null);
  const [clinicalTrials, setClinicalTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        // Fetch monthly counts
        const monthlyCountsResponse = await axios.get(monthlyCountsEndpoint);
        
        // Fetch clinical trials
        const trialsResponse = await axios.get(categoryTrialsEndpoint);
        
        if (isMounted) {
          setMonthlyCounts(monthlyCountsResponse.data);
          setClinicalTrials(trialsResponse.data.results);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [monthlyCountsEndpoint, categoryTrialsEndpoint]);

  // Format data for the chart
  const formatData = (data) => {
    if (!data || !Array.isArray(data.monthly_article_counts) || !Array.isArray(data.monthly_trial_counts)) {
      return [];
    }
    
    // Combine article and trial counts
    const combinedData = {};
    
    // Process article counts
    data.monthly_article_counts.forEach(item => {
      const date = item.month;
      if (!combinedData[date]) {
        combinedData[date] = { date, articles: 0, trials: 0 };
      }
      combinedData[date].articles = item.count;
    });
    
    // Process trial counts
    data.monthly_trial_counts.forEach(item => {
      const date = item.month;
      if (!combinedData[date]) {
        combinedData[date] = { date, articles: 0, trials: 0 };
      }
      combinedData[date].trials = item.count;
    });
    
    // Convert to array and sort by date
    return Object.values(combinedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Format tick labels for x-axis
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            {formattedDate}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              color: entry.color,
              margin: '2px 0'
            }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
        <h4>Error loading data</h4>
        <p>{error.message}</p>
      </div>
    );
  }

  const chartData = formatData(monthlyCounts);
  
  return (
    <div className="category-stats mb-5">
      <h3>Monthly Publications</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
            />
            <YAxis>
              <Label 
                value="Count" 
                angle={-90} 
                position="insideLeft" 
                style={{ textAnchor: 'middle' }} 
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="articles" 
              fill="#8884d8" 
              name="Articles" 
              barSize={20} 
            />
            <Line 
              type="monotone" 
              dataKey="trials" 
              stroke="#ff7300" 
              name="Clinical Trials" 
              strokeWidth={2} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * CategoryPage component - Displays a category page with chart and articles
 */
function CategoryPage() {
  const { category } = useParams();
  
  return (
    <div className="category-page">
      <InteractiveLineChart />
      
      <div className="downloads mb-4">
        <h3>Download Data</h3>
        <div className="row">
          <div className="col-md-6">
            <h4>Articles</h4>
            <DownloadButton 
              apiEndpoint={`https://api.gregory-ms.com/teams/1/articles/category/${category}/`}
              fileName={`gregory-ms-${category}-articles.csv`}
            />
          </div>
          <div className="col-md-6">
            <h4>Clinical Trials</h4>
            <DownloadButton 
              apiEndpoint={`https://api.gregory-ms.com/teams/1/trials/category/${category}/`}
              fileName={`gregory-ms-${category}-trials.csv`}
            />
          </div>
        </div>
      </div>
      
      <div className="articles-section mb-5">
        <h3>Articles</h3>
        <ArticleList 
          type="category"
          pagePath={`/categories/${category}`}
          options={{ category }}
        />
      </div>
      
      <div className="trials-section">
        <h3>Clinical Trials</h3>
        <TrialsList 
          type="category"
          pagePath={`/categories/${category}/trials`}
          options={{ category }}
        />
      </div>
    </div>
  );
}

/**
 * App component for category pages
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/categories/:category" element={<CategoryPage />} />
        <Route path="/categories/:category/page/:pageNumber" element={<CategoryPage />} />
      </Routes>
    </Router>
  );
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('Category app initialized');
  } else {
    console.error('Root element not found');
  }
});

export default App;
