import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';

/**
 * AuthorArticleChart component - Line chart showing cumulative articles per month
 * @param {object} props - Component props
 * @param {number} props.authorId - The author ID to fetch data for
 * @param {Array} props.articles - Optional array of articles to use instead of fetching
 */
export function AuthorArticleChart({ authorId, articles: providedArticles }) {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authorId) return;

    const processArticles = (articlesData) => {
      if (articlesData.length === 0) {
        setData([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Group articles by year-month
      const monthlyGroups = {};
      
      articlesData.forEach(article => {
        if (article.published_date) {
          const date = new Date(article.published_date);
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-indexed
          const key = `${year}-${month}`;
          
          if (!monthlyGroups[key]) {
            monthlyGroups[key] = {
              year,
              month: month + 1, // Convert to 1-indexed for display
              count: 0,
              date: new Date(year, month, 1)
            };
          }
          monthlyGroups[key].count++;
        }
      });
      
      // Convert to array and sort by date
      const monthlyData = Object.values(monthlyGroups).sort((a, b) => a.date - b.date);
      
      // Create cumulative data
      let cumulative = 0;
      const cumulativeData = monthlyData.map(item => {
        cumulative += item.count;
        return {
          ...item,
          cumulative: cumulative
        };
      });

      setData(cumulativeData);
      setError(null);
      setLoading(false);
    };

    // If articles are provided as props, use them directly
    if (providedArticles && providedArticles.length >= 0) {
      processArticles(providedArticles);
      return;
    }

    // Otherwise, fetch articles (fallback for standalone usage)
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all articles for this author by paginating through all pages
        let allArticles = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await axios.get(`https://api.gregory-ms.com/articles/?author_id=${authorId}&format=json&page=${page}`);
          const pageResults = response.data.results || [];
          allArticles = [...allArticles, ...pageResults];
          
          // Check if there are more pages
          hasMore = response.data.next !== null;
          page++;
        }
        
        processArticles(allArticles);
      } catch (err) {
        console.error('Error fetching author articles for chart:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId, providedArticles]);

  useEffect(() => {
    if (!data.length || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous chart

    // Get the container width for responsive sizing
    const container = svg.node().parentNode;
    const containerWidth = container.offsetWidth;
    
    // Mobile-first responsive margins and dimensions
    const isMobile = window.innerWidth <= 768;
    const margin = isMobile 
      ? { top: 15, right: 15, bottom: 40, left: 40 }
      : { top: 20, right: 30, bottom: 60, left: 60 };
    
    // Ensure width fits in container with some padding for mobile
    const availableWidth = containerWidth - (isMobile ? 32 : 0); // Account for container padding
    const width = Math.max(isMobile ? 280 : 300, availableWidth - margin.left - margin.right);
    const height = Math.max(200, Math.min(400, width * (isMobile ? 0.7 : 0.6))); // Slightly taller on mobile

    renderChart(svg, data, width, height, margin);
  }, [data, loading]);

  // Add resize handler for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (data.length > 0 && !loading) {
        // Debounce resize to avoid excessive re-renders
        const timeoutId = setTimeout(() => {
          const svg = d3.select(svgRef.current);
          if (svg.node()) {
            // Clear and re-render chart
            svg.selectAll('*').remove();
            
            // Get new dimensions with mobile considerations
            const container = svg.node().parentNode;
            const containerWidth = container.offsetWidth;
            const isMobile = window.innerWidth <= 768;
            const margin = isMobile 
              ? { top: 15, right: 15, bottom: 40, left: 40 }
              : { top: 20, right: 30, bottom: 60, left: 60 };
            
            const availableWidth = containerWidth - (isMobile ? 32 : 0);
            const width = Math.max(isMobile ? 280 : 300, availableWidth - margin.left - margin.right);
            const height = Math.max(200, Math.min(400, width * (isMobile ? 0.7 : 0.6)));
            
            // Re-render with new dimensions
            renderChart(svg, data, width, height, margin);
          }
        }, 250);
        
        return () => clearTimeout(timeoutId);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, loading]);

  // Extract chart rendering logic to a separate function
  const renderChart = (svg, chartData, width, height, margin) => {
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.cumulative)])
      .nice()
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.cumulative))
      .curve(d3.curveMonotoneX);

    // Create SVG container
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%b %Y'))
        .ticks(Math.max(2, Math.min(8, Math.floor(width / 100)))))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.max(3, Math.min(8, Math.floor(height / 40)))));

    // Add X axis label
    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
      .style('text-anchor', 'middle')
      .text('Month/Year');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Cumulative Articles');

    // Add the line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#007bff')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots for each data point
    const dotRadius = Math.max(2, Math.min(5, width / 200));
    g.selectAll('.dot')
      .data(chartData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.cumulative))
      .attr('r', dotRadius)
      .attr('fill', '#007bff')
      .on('mouseover', function(event, d) {
        // Create tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${d3.timeFormat('%B %Y')(d.date)}</strong><br/>
          Monthly: ${d.count} articles<br/>
          Cumulative: ${d.cumulative} articles
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.selectAll('.tooltip').remove();
      });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        <h6>Chart Unavailable</h6>
        <p className="mb-0">Unable to load publication timeline data.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="alert alert-info">
        <h6>No Publication Data</h6>
        <p className="mb-0">No publication timeline data available for this author.</p>
      </div>
    );
  }

  return (
    <div className="author-article-chart">
      <div className="chart-container">
        <svg ref={svgRef}></svg>
      </div>
      <div className="mt-3 text-center">
        <small className="text-muted">
          Total publications: {data.length > 0 ? data[data.length - 1].cumulative : 0} articles
        </small>
      </div>
    </div>
  );
}

AuthorArticleChart.propTypes = {
  authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  articles: PropTypes.arrayOf(PropTypes.object), // Optional array of article objects
};

export default AuthorArticleChart;
