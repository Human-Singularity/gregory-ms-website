import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function App() {
  const [categories, setCategories] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  
  // Create color scale
  const colorScale = scaleOrdinal(schemeCategory10);
  
  useEffect(() => {
    const fetchData = async () => {
      let url = 'https://api.gregory-ms.com/categories/';
      let results = [];

      while (url) {
        const response = await axios.get(url);
        results = [...results, ...response.data.results];
        url = response.data.next;
      }

      setCategories(results);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      let categoryArticles = {};

      for (let category of categories) {
        const response = await axios.get(`https://api.gregory-ms.com/articles/category/${category.category_slug}`);
        categoryArticles[category.category_slug] = response.data.results;
      }

      processData(categoryArticles);
    }

    const processData = (categoryArticles) => {
      const chartData = {};
      const uniqueCategories = new Set();
      const cumulativeCounts = {};

      Object.entries(categoryArticles).forEach(([slug, articles]) => {
        uniqueCategories.add(slug);
        articles.forEach(article => {
          const publishedDate = new Date(article.published_date);
          const yearMonth = `${publishedDate.getFullYear()}-${publishedDate.getMonth()+1}`;

          // Check if the article was published after 2021
          if (publishedDate.getFullYear() >= 2021) {
            if (!chartData[yearMonth]) {
              chartData[yearMonth] = { name: yearMonth };
            }
            cumulativeCounts[slug] = (cumulativeCounts[slug] || 0) + 1;
            chartData[yearMonth][slug] = cumulativeCounts[slug];
          }
        });
      });

      // Sort chartData by date
      const sortedChartData = Object.entries(chartData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([, value]) => value);

      setChartData(sortedChartData);
      setAllCategories(Array.from(uniqueCategories));
    };

    if (categories.length) {
      fetchArticles();
    }
  }, [categories]);

  const handleLegendClick = (data) => {
    const { dataKey } = data;
    setHiddenCategories(prevState => {
      if (prevState.includes(dataKey)) {
        return prevState.filter(category => category !== dataKey);
      } else {
        return [...prevState, dataKey];
      }
    });
  };

  function InteractiveLineChart() {
    return (
      <LineChart width={800} height={300} data={chartData}>
        {allCategories.map((category, index) => (
          <Line 
            type="monotone" 
            dataKey={category} 
            stroke={colorScale(index)} 
            key={category}
            dot={false}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            hide={hiddenCategories.includes(category)}
          />
        ))}
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend onClick={handleLegendClick} />
      </LineChart>
    );
  }

  return (
    <div>
      <InteractiveLineChart />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default InteractiveLineChart;
