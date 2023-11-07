import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import * as d3 from 'd3';
import { ArticleList } from './ArticleList';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import FetchAndDownload from './DownloadButton';


function InteractiveLineChart() {
  const { category, page } = useParams();
  const monthlyCountsEndpoint = `https://api.gregory-ms.com/categories/${category}/monthly-counts/`;
  const articleEndpoint = `https://api.gregory-ms.com/articles/category/${category}/`;
  const categoryEndpoint = `https://api.gregory-ms.com/articles/category/${category}/`;
  const page_path = `/categories/${category}`;
  const [monthlyCounts, setMonthlyCounts] = useState(null);

  useEffect(() => {
    async function fetchMonthlyCounts() {
      const response = await axios.get(monthlyCountsEndpoint);
      const data = response.data;
      setMonthlyCounts(data);
    }

    fetchMonthlyCounts();
  }, [monthlyCountsEndpoint]);

  const formatData = monthlyCounts => {
    if (!Array.isArray(monthlyCounts.monthly_article_counts) || !Array.isArray(monthlyCounts.monthly_trial_counts)) {
      console.error('monthly_article_counts or monthly_trial_counts is not an array');
      return [];
    }
  
    const format = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
    let cumulativeArticleCount = 0;
  
    const formattedArticleCounts = monthlyCounts.monthly_article_counts.map(count => {
      cumulativeArticleCount += count.count;
      return {
        date: count.month ? format(count.month) : null,
        monthlyArticleCount: count.count,
        cumulativeArticleCount,
      };
    });
  
    const formattedTrialCounts = monthlyCounts.monthly_trial_counts.map(count => {
      return {
        date: count.month ? format(count.month) : null,
        monthlyTrialCount: count.count,
      };
    });
  
    // merge formattedArticleCounts and formattedTrialCounts based on 'date'
    let formattedData = [...formattedArticleCounts, ...formattedTrialCounts];
  
    // filter out entries with null dates
    formattedData = formattedData.filter(item => item.date !== null);
  
    // sort data by 'date'
    formattedData.sort((a, b) => a.date - b.date);
  
    // Merge trial counts into article counts 
    formattedData = formattedData.reduce((acc, item) => {
      const existingItem = acc.find(i => i.date.getTime() === item.date.getTime());
      if (existingItem) {
        existingItem.monthlyTrialCount = item.monthlyTrialCount;
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
  
    // Fill missing months with zeros
    const startDate = new Date(2021, 0);  // Start from January 2021
    const endDate = new Date();
    for (let dt = startDate; dt <= endDate; dt.setMonth(dt.getMonth() + 1)) {
      const existingItem = formattedData.find(item => item.date.getTime() === dt.getTime());
      if (!existingItem) {
        formattedData.push({
          date: new Date(dt),
          monthlyArticleCount: 0,
          cumulativeArticleCount: 0,
          monthlyTrialCount: 0
        });
      }
    }
  
    // sort data by 'date' again after adding missing months
    formattedData.sort((a, b) => a.date - b.date);
  
    return formattedData;
  };
    

  const data = monthlyCounts ? formatData(monthlyCounts) : [];

  const formatDate = date => {
    const format = d3.timeFormat("%b %Y");
    return format(date);
  };

  const tooltipLabelFormatter = (value, entry) => {
    const date = formatDate(value);
    return `${date}`;
  };

  return (
    <>
      <h3 className='title text-center'>Published articles and Clinical Trials per month</h3>
      <ResponsiveContainer height={350}>
        <ComposedChart data={data} margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" tickFormatter={formatDate}></XAxis>
          <YAxis yAxisId="left" orientation='left'>
            <Label value="Monthly Count" angle={-90} position="insideLeft" />
          </YAxis>
          <YAxis yAxisId="right" orientation='right'>
            <Label value="Cumulative Count" angle={90} position="insideRight" />
          </YAxis>
          <Tooltip labelFormatter={tooltipLabelFormatter} />
          <CartesianGrid stroke="#f5f5f5" />
          <Bar yAxisId="left" dataKey="monthlyArticleCount" fill="#8884d8" name="Monthly Article Count" />
          <Bar yAxisId="left" dataKey="monthlyTrialCount" fill="#413ea0" name="Monthly Trial Count" />
          <Line yAxisId="right" dataKey="cumulativeArticleCount" stroke="#FF0000"     type="monotone" name="Cumulative Article Count" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
      <div className='row'><div className='col-md-12'><FetchAndDownload apiEndpoint={categoryEndpoint} /></div></div>
      <div className='row'>
        <div className='col-md-12'>
          <h3 className='title text-center'>Scientific research on {category}</h3>
        </div>
      </div>
      <ArticleList apiEndpoint={articleEndpoint} page_path={page_path} page={parseInt(page)} />
    </>
  );  
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/categories/:category/page/:pageNumber" element={<InteractiveLineChart />} />
        <Route path="/categories/:category" element={<InteractiveLineChart />} />
      </Routes>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default InteractiveLineChart;