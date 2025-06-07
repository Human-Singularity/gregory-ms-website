import ReactDOM from "react-dom/client";
import React, { useState, useEffect, useCallback } from "react";
import { scaleOrdinal } from "d3-scale";
import { schemeSet3 } from "d3-scale-chromatic";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import * as d3 from "d3";
import { BounceLoader } from "react-spinners";
import { css } from "@emotion/react";
import pLimit from "p-limit";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const MAX_CONCURRENT_REQUESTS = 2;

const REQUEST_LIMITER = pLimit(MAX_CONCURRENT_REQUESTS);
const API_URL = "https://api.gregory-ms.com/teams/1/";
const CATEGORIES_URL = `${API_URL}categories/?format=json`;

// Excluded categories - add category slugs here to hide them
const EXCLUDED_CATEGORIES = [
  "uncategorized",
  "other",
  "physical-therapy-and-telerehabilitation",
  "lipoic-acid",
  "epstein-barr-virus",
  // Add more category slugs to exclude
];

const TIME_PERIODS = {
  "6m": { label: "6 Months", months: 6 },
  "1y": { label: "1 Year", months: 12 },
  "2y": { label: "2 Years", months: 24 },
  all: { label: "All Time", months: null },
};

async function loadCategories(signal) {
  let finished = false;
  let nextUrl = CATEGORIES_URL;

  let results = {};

  if (signal.aborted) {
    return;
  }

  while (!finished) {
    const res = await REQUEST_LIMITER(() => fetch(nextUrl, { signal }));

    if (signal.aborted) {
      return;
    }

    if (!res.ok) {
      throw new Error("Failure loading categories. Status: " + res.status);
    }

    const data = await res.json();

    finished = !data.next;

    if (data.next) {
      nextUrl = new URL(data.next);
      nextUrl.protocol = "https:";
    }

    results = data.results.reduce((memo, entry) => {
      if (
        entry.article_count > 0 &&
        !EXCLUDED_CATEGORIES.includes(entry.category_slug)
      ) {
        memo[entry.category_name] = entry.category_slug;
      }
      return memo;
    }, results);
  }

  return results;
}

const MONTHLY_COUNTS_URL = (category) =>
  `${API_URL}categories/${encodeURIComponent(
    category,
  )}/monthly-counts/`;

async function loadMonthlyCounts(categories = {}, signal) {
  const p = Object.entries(categories).map(([name, slug]) => {
    const url = MONTHLY_COUNTS_URL(slug);

    return REQUEST_LIMITER(() => fetch(url, { signal }))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failure loading monthly counts for " + slug);
        }

        return res.json();
      })
      .then((data) => [name, data]);
  });

  const results = await Promise.all(p);

  return Object.fromEntries(results);
}

function formatDataForLineChart(categoryMonthlyCounts, timePeriod) {
  const format = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
  const now = new Date();
  const cutoffDate =
    timePeriod === "all"
      ? null
      : new Date(now.getFullYear(), now.getMonth() - TIME_PERIODS[timePeriod].months, 1);

  // First, collect all data points for each category
  let categoryData = {};
  
  for (const [name, monthlyCounts] of Object.entries(categoryMonthlyCounts)) {
    if (!Array.isArray(monthlyCounts.monthly_article_counts)) {
      continue;
    }

    categoryData[name] = [];
    let cumulativeCount = 0;

    monthlyCounts.monthly_article_counts.forEach((count) => {
      const date = count.month ? format(count.month) : null;
      if (!date || (cutoffDate && date < cutoffDate)) return;

      cumulativeCount += count.count;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      categoryData[name].push({
        monthKey,
        date,
        count: cumulativeCount,
        hasData: count.count > 0
      });
    });
  }

  // Create a set of all months that have data for any category
  let allMonths = new Set();
  Object.values(categoryData).forEach(data => {
    data.forEach(point => allMonths.add(point.monthKey));
  });

  // Convert to sorted array
  const sortedMonths = Array.from(allMonths).sort();

  // Build the final dataset
  const result = sortedMonths.map(monthKey => {
    const dataPoint = { month: monthKey };
    
    Object.entries(categoryData).forEach(([categoryName, data]) => {
      // Find the data point for this month
      const monthData = data.find(d => d.monthKey === monthKey);
      
      if (monthData) {
        dataPoint[categoryName] = monthData.count;
      } else {
        // Find the last known value before this month
        const previousData = data
          .filter(d => d.monthKey < monthKey)
          .sort((a, b) => b.monthKey.localeCompare(a.monthKey))[0];
        
        if (previousData) {
          // Only show the line if there was activity in this category
          // Use null to create a gap in the line
          dataPoint[categoryName] = null;
        }
      }
    });

    return dataPoint;
  });

  return result;
}

function TimePeriodControls({ selectedPeriod, onPeriodChange }) {
  return (
    <div>
      {Object.entries(TIME_PERIODS).map(([key, period]) => (
        <button
          key={key}
          className={`btn ${
            selectedPeriod === key ? "btn-primary" : "btn-outline-primary"
          } time-period-btn`}
          onClick={() => onPeriodChange(key)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

function CategoryControls({ categories, hiddenCategories, onToggleCategory, onToggleAll }) {
  const allCategories = Object.keys(categories);
  const allHidden = allCategories.every(cat => hiddenCategories.includes(cat));
  const allVisible = hiddenCategories.length === 0;

  return (
    <div>
      <div className="mb-3">
        {Object.keys(categories).map((category) => (
          <label key={category} className="category-checkbox">
            <input
              type="checkbox"
              checked={!hiddenCategories.includes(category)}
              onChange={() => onToggleCategory(category)}
            />
            <span>{category}</span>
          </label>
        ))}
      </div>
      <div>
        <button
          className={`btn btn-sm ${allVisible ? 'btn-outline-danger' : 'btn-outline-success'}`}
          onClick={() => onToggleAll(allVisible)}
        >
          {allVisible ? 'Hide All' : 'Show All'}
        </button>
      </div>
    </div>
  );
}

function InteractiveLineChart({
  chartData,
  allCategories,
  hiddenCategories,
  colorScale,
}) {
  const visibleCategories = allCategories.filter(
    (cat) => !hiddenCategories.includes(cat),
  );

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          {visibleCategories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colorScale(index)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name={category}
              connectNulls={false}
            />
          ))}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis>
            <Label
              angle={-90}
              value="Cumulative Number of Articles"
              position="insideLeft"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip
            formatter={(value, name) => [value === null ? "No data" : value, name]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(0);
  const [categories, setCategories] = useState({});
  const [chartData, setChartData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [timePeriod, setTimePeriod] = useState("2y");
  const [categoryMonthlyCounts, setCategoryMonthlyCounts] = useState({});
  const colorScale = scaleOrdinal(schemeSet3);

  useEffect(() => {
    const controller = new AbortController();

    setLoading((c) => c + 1);

    loadCategories(controller.signal)
      .then((results) =>
        setCategories(
          Object.fromEntries(
            Object.entries(results).sort(([a], [b]) =>
              a.toLowerCase().localeCompare(b.toLowerCase()),
            ),
          ),
        ),
      )
      .finally(() => setLoading((c) => c - 1))
      .catch(console.error.bind(console));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!Object.keys(categories).length) {
      return;
    }

    const controller = new AbortController();

    setLoading((c) => c + 1);
    loadMonthlyCounts(categories, controller.signal)
      .then((data) => {
        setCategoryMonthlyCounts(data);
        setAllCategories(Object.keys(categories));
      })
      .finally(() => setLoading((c) => c - 1))
      .catch(console.error.bind(console));

    return () => controller.abort();
  }, [categories]);

  useEffect(() => {
    if (Object.keys(categoryMonthlyCounts).length > 0) {
      setChartData(formatDataForLineChart(categoryMonthlyCounts, timePeriod));
    }
  }, [categoryMonthlyCounts, timePeriod]);

  const handleLegendClick = useCallback((data) => {
    setHiddenCategories((prev) => {
      if (prev.includes(data.dataKey)) {
        return prev.filter((category) => category !== data.dataKey);
      } else {
        return [...prev, data.dataKey];
      }
    });
  });

  const handleToggleCategory = useCallback((category) => {
    setHiddenCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  });

  const handlePeriodChange = useCallback((period) => {
    setTimePeriod(period);
  });

  const handleToggleAll = useCallback((hideAll) => {
    if (hideAll) {
      setHiddenCategories([...allCategories]);
    } else {
      setHiddenCategories([]);
    }
  }, [allCategories]);

  useEffect(() => {
    const timePeriodContainer = document.getElementById("time-period-controls");
    const categoryContainer = document.getElementById("category-controls");

    // Clear existing content to prevent memory leaks
    if (timePeriodContainer) {
      timePeriodContainer.innerHTML = '';
      const timePeriodRoot = ReactDOM.createRoot(timePeriodContainer);
      timePeriodRoot.render(
        <TimePeriodControls
          selectedPeriod={timePeriod}
          onPeriodChange={handlePeriodChange}
        />
      );
    }

    if (categoryContainer && Object.keys(categories).length > 0) {
      categoryContainer.innerHTML = '';
      const categoryRoot = ReactDOM.createRoot(categoryContainer);
      categoryRoot.render(
        <CategoryControls
          categories={categories}
          hiddenCategories={hiddenCategories}
          onToggleCategory={handleToggleCategory}
          onToggleAll={handleToggleAll}
        />
      );
    }
  }, [categories, hiddenCategories, timePeriod, handleToggleCategory, handlePeriodChange, handleToggleAll]);

  return loading ? (
    <div className="loading-container">
      <BounceLoader
        color={"#007bff"}
        loading={loading}
        css={override}
        size={60}
      />
    </div>
  ) : (
    <InteractiveLineChart
      chartData={chartData}
      allCategories={allCategories}
      hiddenCategories={hiddenCategories}
      colorScale={colorScale}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
