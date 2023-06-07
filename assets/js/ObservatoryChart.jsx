import ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import * as d3 from 'd3';

function InteractiveLineChart({chartData, allCategories, hiddenCategories, handleLegendClick, colorScale}) {
  const [activeIndex] = useState(chartData.length - 1);

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
        <YAxis />
        <Tooltip />
        <Legend onClick={handleLegendClick} />
        <Brush dataKey="name" height={30} stroke="#8884d8"/>  {/* Add this */}
      </LineChart>
    </ResponsiveContainer>
  );
}


function App() {
  const [categories, setCategories] = useState({});
  const [chartData, setChartData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const colorScale = scaleOrdinal(schemeCategory10);

  useEffect(() => {
    const fetchData = async () => {
      let url = 'https://api.gregory-ms.com/categories/?format=json';
      let results = {};

      while (url) {
        const response = await axios.get(url);
        response.data.results.forEach(result => {
          results[result.category_name] = result.category_slug;
        });
        url = response.data.next;
      }

      setCategories(results);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMonthlyCounts = async () => {
      let categoryMonthlyCounts = {};

      for (let [name, slug] of Object.entries(categories)) {
        let url = `https://api.gregory-ms.com/categories/${slug}/monthly-counts/`;
        const response = await axios.get(url);
        categoryMonthlyCounts[name] = response.data;
      }    

      formatData(categoryMonthlyCounts);
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