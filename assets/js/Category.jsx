import ReactDOM from 'react-dom/client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

function LineChart({ apiEndpoint }) {
    const [articles, setArticles] = useState([]);
    const ref = useRef();
    const margin = {top: 20, right: 20, bottom: 50, left: 50};

    useEffect(() => {
        async function fetchData() {
            const response = await axios.get(`${apiEndpoint}?format=json`);
            setArticles(response.data.results);
        }
        fetchData();
    }, [apiEndpoint]);

    useEffect(() => {
        if (!articles.length) {
            return;
        }

        // Parse and sort data by published_date
        const parsedData = articles.map(item => ({
            ...item,
            published_date: d3.timeParse("%Y-%m-%dT%H:%M:%SZ")(item.published_date)
        })).sort((a, b) => a.published_date - b.published_date);
        
        // Count articles by date
        const countByDate = d3.rollup(parsedData, v => v.length, d => d.published_date);

        // Generate cumulative count
        let cumulativeCount = 0;
        const cumulativeData = Array.from(countByDate, ([date, count]) => {
            cumulativeCount += count;
            return { date, cumulativeCount };
        });

        const svg = d3.select(ref.current);
        const { width, height } = svg.node().getBoundingClientRect();
        const xScale = d3.scaleTime()
            .domain(d3.extent(cumulativeData, d => d.date))
            .range([margin.left, width - margin.right]);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(cumulativeData, d => d.cumulativeCount)])
            .range([height - margin.bottom, margin.top]);

        // Generate line
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.cumulativeCount));

        svg.append('path')
            .datum(cumulativeData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Add X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%d-%m-%Y")))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add Y Axis
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));
    }, [articles]);

    return <svg id="graph" ref={ref} style={{ height: '500px', width: '100%' }} />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<LineChart apiEndpoint="https://api.gregory-ms.com/articles/category/ocrelizumab/" />);

export default LineChart;
