import ReactDOM from "react-dom/client";
import React, { useState, useEffect, useCallback } from "react";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
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
      if (entry.article_count > 0) {
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

function formatData(categoryMonthlyCounts) {
  const format = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
  let allData = [];

  for (const [name, monthlyCounts] of Object.entries(categoryMonthlyCounts)) {
    if (!Array.isArray(monthlyCounts.monthly_article_counts)) {
      console.error("monthly_article_counts is not an array");
      continue;
    }

    let cumulativeArticleCount = 0;

    const formattedArticleCounts = monthlyCounts.monthly_article_counts.map(
      (count) => {
        cumulativeArticleCount += count.count;
        const date = count.month ? format(count.month) : null;
        return {
          name: date
            ? `${date.getFullYear()}-${date.getMonth() < 6 ? "S1" : "S2"}`
            : null,
          numericDate: date
            ? date.getFullYear() + (date.getMonth() < 6 ? 0 : 0.5)
            : null,
          [name]: cumulativeArticleCount,
        };
      },
    );

    allData = [...allData, ...formattedArticleCounts];
  }

  const groupedData = allData.reduce((acc, curr) => {
    const existing = acc.find((item) => item.numericDate === curr.numericDate);
    if (existing) {
      Object.assign(existing, curr);
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  groupedData.sort((a, b) => a.numericDate - b.numericDate);

  return groupedData;
}

function InteractiveLineChart({
  chartData,
  allCategories,
  hiddenCategories,
  handleLegendClick,
  colorScale,
}) {
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
          domain={["dataMin", "dataMax"]}
          tickFormatter={(tickItem) => {
            const year = Math.floor(tickItem);
            const semester = tickItem - year === 0 ? "S1" : "S2";
            return `${year}-${semester}`;
          }}
        />
        <YAxis>
          <Label
            angle={-90}
            value="Cumulative count of published research"
            position="outsideLeft"
            offset={-10}
          />
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
  const [loading, setLoading] = useState(0);
  const [categories, setCategories] = useState({});
  const [chartData, setChartData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const colorScale = scaleOrdinal(schemeCategory10);

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
      .then((categoryMonthtlyCounts) => {
        setChartData(formatData(categoryMonthtlyCounts));
        setAllCategories(Object.keys(categories));
      })
      .finally(() => setLoading((c) => c - 1))
      .catch(console.error.bind(console));

    return () => controller.abort();
  }, [categories]);

  const handleLegendClick = useCallback((data) => {
    setHiddenCategories((prev) => {
      if (prev.includes(data.dataKey)) {
        return prev.filter((category) => category !== data.dataKey);
      } else {
        return [...prev, data.dataKey];
      }
    });
  });

  return loading ? (
    <div className="loading-container">
      <BounceLoader
        color={"#123abc"}
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
      handleLegendClick={handleLegendClick}
      colorScale={colorScale}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default InteractiveLineChart;
