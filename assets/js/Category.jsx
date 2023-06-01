import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import * as d3 from 'd3';
import { ArticleList } from './ArticleList';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';

function InteractiveLineChart() {
  const { category, page } = useParams();
  const articleEndpoint = `https://api.gregory-ms.com/articles/category/${category}/`;
  const trialEndpoint = `https://api.gregory-ms.com/trials/category/${category}/`;
  const page_path = `/categories/${category}`;
  const [articles, setArticles] = useState([]);
  const [trials, setTrials] = useState([]);

  useEffect(() => {
    async function fetchArticleData() {
      let api_page = 1;
      let allArticles = [];

      while (true) {
        const response = await axios.get(`${articleEndpoint}?format=json&page=${api_page}`);
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

    async function fetchTrialData() {
      let api_page = 1;
      let allTrials = [];

      while (true) {
        const response = await axios.get(`${trialEndpoint}?format=json&page=${api_page}`);
        const data = response.data.results;

        allTrials = allTrials.concat(data);

        if (response.data.next) {
          api_page++;
        } else {
          break;
        }
      }

      setTrials(allTrials);
    }

    fetchArticleData();
    fetchTrialData();
  }, [articleEndpoint, trialEndpoint]);


  const parsedData = articles.map(item => {  
    let categories = item.categories.map(category => Object.entries(category).map(([key, value]) => `${key}:${value}`).join(', ')).join(' | ');  
    let { noun_phrases, ...rest } = item; // This line removes noun_phrases
    let authors = item.authors.map(a => `${a.given_name} ${a.family_name}`).join(', ');
    let summary = item.summary || "";

    // remove XML namespace declarations
    summary = summary.replace(/xmlns[^=]*="[^"]*"/g, "");
    
    // replace newline and carriage return characters
    summary = summary.replace(/(\r\n|\n|\r)/gm, "");
    
    // remove HTML tags
    summary = summary.replace(/<[^>]+>/g, "");
    
    // replace commas with semicolon
    summary = summary.replace(/,/g, ';');
    
    // escape double quotes
    summary = summary.replace(/"/g, '');
        
    return {
      ...rest,
      article_id: item.article_id, // Include article_id
      trial_id: "", // Add a placeholder for trial_id  
      categories,
      authors,
      summary, 
      kind: 'article',
      published_date: d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(item.published_date)
    };
  }).sort((a, b) => a.published_date - b.published_date);
  
  const parsedTrialData = trials.map(item => {
    let identifiers = Object.entries(item.identifiers).map(([key, value]) => `${key}:${value}`).join(', ');
    let categories = item.categories.map(category => Object.entries(category).map(([key, value]) => `${key}:${value}`).join(', ')).join(' | ');  
    let { noun_phrases, ...rest } = item; // This line removes noun_phrases
    let summary = item.summary || "";

    // remove XML namespace declarations
    summary = summary.replace(/xmlns[^=]*="[^"]*"/g, "");
    
    // replace newline and carriage return characters
    summary = summary.replace(/(\r\n|\n|\r)/gm, "");
    
    // remove HTML tags
    summary = summary.replace(/<[^>]+>/g, "");
    
    // replace commas with semicolon
    summary = summary.replace(/,/g, ';');
    
    // escape double quotes
    summary = summary.replace(/"/g, '');
    let trial_id = item.trial_id || ""; // assuming trial_id exists in item

    return {
      ...rest,
      article_id: "", // Add a placeholder for article_id
      trial_id: item.trial_id, // Include trial_id    
      summary,
      identifiers,
      categories,  
      kind: 'clinical trial',
      published_date: d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(item.published_date)
    };
  }).sort((a, b) => a.published_date - b.published_date); 

  const groupedArticleData = d3.group(parsedData, d => d3.timeMonth(d.published_date));
  const groupedTrialData = d3.group(parsedTrialData, d => d3.timeMonth(d.published_date));

  let cumulativeArticleCount = 0;
  let cumulativeTrialCount = 0;

  const articleDataWithCounts = Array.from(groupedArticleData, ([date, articles]) => {
    cumulativeArticleCount += articles.length;
    return { date, cumulativeArticleCount, monthlyArticleCount: articles.length };
  });

  if (!articleDataWithCounts.length) {
    articleDataWithCounts.push({
      date: new Date(),
      cumulativeArticleCount: 0,
      monthlyArticleCount: 0,
    });
  }

  const trialDataWithCounts = Array.from(groupedTrialData, ([date, trials]) => {
    cumulativeTrialCount += trials.length;
    return { date, cumulativeTrialCount, monthlyTrialCount: trials.length };
  });

  if (!trialDataWithCounts.length) {
    trialDataWithCounts.push({
      date: new Date(),
      cumulativeTrialCount: 0,
      monthlyTrialCount: 0,
    });
  }
  const dataWithCounts = articleDataWithCounts.map((articleData, index) => {
    return { ...articleData, ...trialDataWithCounts[index] };
  });

  const formatDate = date => {
    const format = d3.timeFormat("%b %Y");
    return format(date);
  };

  const tooltipLabelFormatter = (value, entry) => {
    const date = formatDate(value);
    return `${date}`;
  };
  const csvData = [...parsedData, ...parsedTrialData];
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
      <h3 className='title text-center'>Published articles and Clinical Trials per month</h3>
      <ResponsiveContainer height={350}>
        <ComposedChart data={dataWithCounts} margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" tickFormatter={formatDate}></XAxis>
          <YAxis yAxisId="left">
            <Label value="Cumulative Count" angle={-90} position="insideLeft" />
          </YAxis>
          <YAxis yAxisId="right" orientation="right">
            <Label value="Monthly Count" angle={90} position="insideRight" />
          </YAxis>
          <Tooltip labelFormatter={tooltipLabelFormatter} />
          <CartesianGrid stroke="#f5f5f5" />
          <Bar yAxisId="right" dataKey="monthlyArticleCount" fill="#8884d8" name="Monthly Article Count" />
          <Bar yAxisId="right" dataKey="monthlyTrialCount" fill="#413ea0" name="Monthly Trial Count" />
          <Line yAxisId="left" type="monotone" dataKey="cumulativeArticleCount" stroke="#ff7300" name="Cumulative Article Count" />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="d-flex justify-content-end">
        <button 
          onClick={() => exportToCSV(csvData, `${category}_articles_trials.csv`)} 
          className='mr-5 btn btn-md btn-info font-weight-bold d-flex align-items-center justify-content-between' 
          data-umami-event={`download articles and trials for ${category}`}
        >
          Download CSV&nbsp;
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" viewBox="0 0 384 512" style={{ height: "16px" }}>
          <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z" fill="White"></path>
        </svg>
      </button>
      </div>
      <h3 className='title text-center'>Scientific research on {category}</h3>
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