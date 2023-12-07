import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush, Label } from 'recharts';
import * as d3 from 'd3';
import { BounceLoader } from 'react-spinners';
import { css } from "@emotion/react";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

function InteractiveLineChart({chartData, allCategories, hiddenCategories, handleLegendClick, colorScale}) {
  const lastIndex = chartData.length - 1;
  const startIndex = lastIndex - 24 > 0 ? lastIndex - 24 : 0; // prevent negative index

  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <LineChart data={chartData}>
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
        <XAxis 
          dataKey="numericDate"
          allowDataOverflow 
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(tickItem) => {
            const year = Math.floor(tickItem);
            const semester = (tickItem - year) === 0 ? 'S1' : 'S2';
            return `${year}-${semester}`;
          }}
        />
        <YAxis>
          <Label angle={-90} value='Cumulative count of published research' position='outsideLeft' offset={-10} />
        </YAxis>
        <Tooltip />
        <Legend onClick={handleLegendClick} />
        <Brush 
          dataKey="name" 
          height={30} 
          stroke="#8884d8"
          startIndex={startIndex}
          endIndex={lastIndex}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({});
  const [chartData, setChartData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const colorScale = scaleOrdinal(schemeCategory10);

  useEffect(() => {
    const fetchData = async () => {
      let url = 'https://api.gregory-ms.com/categories/?format=json';
      let results = {};
  
      try {
        while (url) {
          const response = await axios.get(url);
          response.data.results.forEach(result => {
            // check if article_count is greater than 0
            if (result.article_count > 0) {
              results[result.category_name] = result.category_slug;
            }
          });
          url = response.data.next;
        
          if (url && url.startsWith('http://')) {
            url = 'https://' + url.substring(7);
          }
        }
  
        const sortedCategories = Object.keys(results)
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
          .reduce((acc, key) => {
            acc[key] = results[key];
            return acc;
          }, {});
      
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    fetchData();
  }, []);
  
  // useEffect(() => {
  //   console.log(categories);
  // }, [categories]);
  

  useEffect(() => {
    const fetchMonthlyCounts = async () => {
      setLoading(true);
      let categoryMonthlyCounts = {};

      for (let [name, slug] of Object.entries(categories)) {
        let url = `https://api.gregory-ms.com/categories/${slug}/monthly-counts/`;
        const response = await axios.get(url);
        categoryMonthlyCounts[name] = response.data;
      }

      formatData(categoryMonthlyCounts);
      setLoading(false);
    }

    const formatData = (categoryMonthlyCounts) => {
      const format = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
      let allData = [];
      
      for (let [name, monthlyCounts] of Object.entries(categoryMonthlyCounts)) {
        if (!Array.isArray(monthlyCounts.monthly_article_counts)) {
          console.error('monthly_article_counts is not an array');
          continue;
        }
        
        let cumulativeArticleCount = 0;
        
        const formattedArticleCounts = monthlyCounts.monthly_article_counts.map(count => {
          cumulativeArticleCount += count.count;
          const date = count.month ? format(count.month) : null;
          return {
            name: date ? `${date.getFullYear()}-${date.getMonth() < 6 ? 'S1' : 'S2'}` : null,
            numericDate: date ? date.getFullYear() + (date.getMonth() < 6 ? 0 : 0.5) : null,
            [name]: cumulativeArticleCount,
          };
        });
      
        allData = [...allData, ...formattedArticleCounts];
      }
      
      const groupedData = allData.reduce((acc, curr) => {
        const existing = acc.find(item => item.numericDate === curr.numericDate);
        if (existing) {
          Object.assign(existing, curr);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
      
      groupedData.sort((a, b) => a.numericDate - b.numericDate);
      
      setChartData(groupedData);
      setAllCategories(Object.keys(categories));
    };
  

    if (Object.keys(categories).length > 0) {
      fetchMonthlyCounts();
    }
  }, [categories]);

  const handleLegendClick = (data) => {
    setHiddenCategories(prev => {
      if (prev.includes(data.dataKey)) {
        return prev.filter(category => category !== data.dataKey);
      } else {
        return [...prev, data.dataKey];
      }
    });
  };

  return (
    loading ? 
    <div className="loading-container">
      <BounceLoader color={"#123abc"} loading={loading} css={override} size={60} />
    </div>    : 
      <InteractiveLineChart 
        chartData={chartData} 
        allCategories={allCategories} 
        hiddenCategories={hiddenCategories} 
        handleLegendClick={handleLegendClick} 
        colorScale={colorScale} 
      />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default InteractiveLineChart;