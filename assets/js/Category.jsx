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

  const parsedData = articles.map(item => {
    const { noun_phrases, ...rest } = item;  // remove noun_phrases from item
    let authors = item.authors.map(a => `"${a.given_name} ${a.family_name}"`).join(', ');
    return {
      ...rest,
      authors,
      published_date: d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(item.published_date)
    };
  }).sort((a, b) => a.published_date - b.published_date);

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

  const exportToCSV = (csvData, fileName) => {
    const csvRow = [];
    const headers = Object.keys(csvData[0]);
    csvRow.push(headers.join(','));

    for (let row of csvData) {
      csvRow.push(headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    }

    function replacer(key, value) {
      if (value === null) return '';
      else return value; // convert it to string
    }

    const csvString = csvRow.join('\r\n');
    const downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
    downloadLink.target = '_blank';
    downloadLink.download = fileName;
    downloadLink.click();
  }

  return (
    <>
      <h3 className='title text-center'>Published articles per month</h3>
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
      <div className="d-flex justify-content-end">
      <button 
        onClick={() => exportToCSV(parsedData, `${category}_articles.csv`)} 
        className='mr-5 btn btn-md btn-info font-weight-bold d-flex align-items-center justify-content-between' 
        data-umami-event={`download articles for ${category}`}
      >
        Download CSV&nbsp;
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-2" viewBox="0 0 384 512" style={{ height: "16px" }}>
          <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z" fill="White"></path>
        </svg>
      </button>
      </div>
      <h3 className='title text-center'>Scientific research on {category}</h3>
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