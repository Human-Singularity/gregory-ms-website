import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import * as d3 from 'd3';
import { ArticleList } from './ArticleList';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';

function InteractiveLineChart() {
  const { category, page } = useParams();
  const apiEndpoint = `https://api.gregory-ms.com/articles/category/${category}/`;
  const page_path = `/categories/${category}`;
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      let api_page = 1;
      let allArticles = [];

      while (true) {
        const response = await axios.get(`${apiEndpoint}?format=json&page=${api_page}`);
        const data = response.data.results;

        allArticles = allArticles.concat(data);

        if (response.data.next) {
          api_page++;
        } else {
          break;
        }
      }

      setArticles(allArticles);
    }

    fetchData();
  }, [apiEndpoint]);

  const parsedData = articles.map(item => ({
    ...item,
    published_date: d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(item.published_date)
  })).sort((a, b) => a.published_date - b.published_date);

  const groupedData = d3.group(parsedData, d => d3.timeMonth(d.published_date));

  let cumulativeCount = 0;
  const dataWithCumulativeAndMonthlyCounts = Array.from(groupedData, ([date, articles]) => {
    cumulativeCount += articles.length;
    return { date, cumulativeCount, monthlyCount: articles.length };
  });

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
      <h3 className='title'>Published articles per month</h3>
      <ResponsiveContainer height={350}>
        <ComposedChart data={dataWithCumulativeAndMonthlyCounts} margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" tickFormatter={formatDate}>
          </XAxis>
          <YAxis yAxisId="left">
            <Label value="Cumulative Count" angle={-90} position="insideLeft" />
          </YAxis>
          <YAxis yAxisId="right" orientation="right">
            <Label value="Monthly Count" angle={90} position="insideRight" />
          </YAxis>
          <Tooltip labelFormatter={tooltipLabelFormatter} />
          <CartesianGrid stroke="#f5f5f5" />
          <Bar yAxisId="right" dataKey="monthlyCount" fill="#8884d8" name="Monthly Count" />
          <Line yAxisId="left" type="monotone" dataKey="cumulativeCount" stroke="#ff7300" name="Cumulative Count" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
      <h3 className='title'>Scientific research on {category}</h3>
      <ArticleList apiEndpoint={apiEndpoint} page_path={page_path} page={parseInt(page)} />
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
