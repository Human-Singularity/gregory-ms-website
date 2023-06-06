import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as d3 from 'd3';

function InteractiveLineChart({chartData, allCategories, hiddenCategories, handleLegendClick, colorScale}) {
  const [activeIndex, setActiveIndex] = useState(chartData.length - 1); // Start at the latest data point
  
  const handlePan = ({ startIndex, endIndex }) => {
    if (startIndex !== endIndex) {
      setActiveIndex(startIndex);
    }
  };

  return (
    <ResponsiveContainer width="100%" aspect={2}>
      <LineChart data={chartData} onPan={handlePan}>
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
					dataKey="name" 
					allowDataOverflow 
					type="category" 
					domain={[activeIndex, activeIndex + 20]} // Show a window of 20 data points
					tickFormatter={(tickItem) => {
						const date = new Date(tickItem);
						return date.getFullYear();
					}}
				/>
        <YAxis />
        <Tooltip />
        <Legend onClick={handleLegendClick} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function App() {
  const [categories, setCategories] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  
  // Create color scale
  const colorScale = scaleOrdinal(schemeCategory10);
  
  useEffect(() => {
    const fetchData = async () => {
      let url = 'https://api.gregory-ms.com/categories/?format=json';
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
    const fetchMonthlyCounts = async () => {
      let categoryMonthlyCounts = {};

      for (let category of categories) {
        let url = `https://api.gregory-ms.com/categories/${category.category_slug}/monthly-counts/`;
        const response = await axios.get(url);
        categoryMonthlyCounts[category.category_slug] = response.data;
      }    

      formatData(categoryMonthlyCounts);
    }

    const formatData = (categoryMonthlyCounts) => {
      const format = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");

      const formattedData = Object.entries(categoryMonthlyCounts).reduce((acc, [slug, monthlyCounts]) => {
        if (!Array.isArray(monthlyCounts.monthly_article_counts)) {
          console.error('monthly_article_counts is not an array');
          return acc;
        }
      
        let cumulativeArticleCount = 0;
      
        const formattedArticleCounts = monthlyCounts.monthly_article_counts.map(count => {
          cumulativeArticleCount += count.count;
          const date = count.month ? format(count.month) : null;
          return {
            name: date ? `${date.getFullYear()}-${date.getMonth() + 1}` : null,
            [slug]: cumulativeArticleCount,
          };
        });
      
        // merge formattedArticleCounts into acc based on 'name'
        formattedArticleCounts.forEach(item => {
          const existingItem = acc.find(i => i.name === item.name);
          if (existingItem) {
            existingItem[slug] = item[slug];
          } else {
            acc.push(item);
          }
        });
      
        return acc;
      }, []);

      // filter out entries with null dates
      const validData = formattedData.filter(item => item.name !== null);
      
      // sort data by 'name'
      validData.sort((a, b) => new Date(a.name) - new Date(b.name));
      
      setChartData(validData);
      setAllCategories(Object.keys(categoryMonthlyCounts));
    };
    
    if (categories.length) {
      fetchMonthlyCounts();
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

  return (
		<div style={{ height: '500px' }}>
      <InteractiveLineChart 
        chartData={chartData} 
        allCategories={allCategories} 
        hiddenCategories={hiddenCategories} 
        handleLegendClick={handleLegendClick} 
        colorScale={colorScale} 
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default InteractiveLineChart;