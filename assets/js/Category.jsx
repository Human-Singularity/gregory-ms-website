import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
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
      try {
        const response = await axios.get(`${apiEndpoint}?format=json&page=${page}`);
        setArticles(response.data.results);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [apiEndpoint, page]);

  const parsedData = articles.map(item => ({
    ...item,
    published_date: d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(item.published_date)
  })).sort((a, b) => a.published_date - b.published_date);

  const groupedData = d3.group(parsedData, d => d3.timeMonth(d.published_date));

  let cumulativeCount = 0;
  const cumulativeData = Array.from(groupedData, ([date, articles]) => {
    cumulativeCount += articles.length;
    return { date, cumulativeCount };
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
      <ResponsiveContainer height={300}>
        <LineChart data={cumulativeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={tooltipLabelFormatter} />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="cumulativeCount" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
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