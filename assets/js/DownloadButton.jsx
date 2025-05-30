import React, { useState } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';

const FetchAndDownload = ({ apiEndpoint }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const escapeCsvValue = (value) => {
    if (value == null) {
      return '';
    }
    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
      value = value.replace(/"/g, '""');
      return `"${value}"`;
    }
    return value;
  };

  const downloadCSV = (fetchedData) => {
    const csvData = fetchedData.map(item => ({
      'article_id': item.article_id,
      'title': item.title,
      'link': item.link,
      'published_date': item.published_date,
      'source': item.source,
      'publisher': item.publisher,
      'container_title': item.container_title,
      'relevant': item.relevant,
      'ml_prediction_highest_score': item.ml_predictions?.length > 0 ? Math.max(...item.ml_predictions.map(p => p.probability_score)).toFixed(3) : null,
      'ml_prediction_algorithms': item.ml_predictions?.map(p => p.algorithm).join(', ') || null,
      'discovery_date': item.discovery_date,
      'doi': item.doi,
      'access': item.access,
      'takeaways': item.takeaways,
      'categories': item.categories?.map(category => category.category_name).join(', ')
    }));

    const csvHeaders = Object.keys(csvData[0]);

    let csvContent = csvHeaders.map(escapeCsvValue).join(',') + '\n';
    csvContent += csvData.map(row => Object.values(row).map(escapeCsvValue).join(',')).join('\n');

    fileDownload(csvContent, 'articles.csv');
  };

  const fetchAndDownload = async () => {
    setIsLoading(true);
    let url = apiEndpoint;
    let fetchedData = [];
    try {
      let response = await axios.get(url);
      fetchedData = response.data.results;
      while (response.data.next !== null) {
        if (response.data.next && response.data.next.startsWith('http://')) {
          response.data.next = 'https://' + response.data.next.substring(7);
        }
        response = await axios.get(response.data.next);
        fetchedData = [...fetchedData, ...response.data.results];
      }
      setIsLoading(false);
      setIsReady(true);
      downloadCSV(fetchedData);
      console.log('fetchedData', fetchedData);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button 
        className={isReady ? 'btn btn-success btn-md float-right' : 'btn btn-info btn-md float-right'}
        onClick={fetchAndDownload}
        disabled={isLoading}>
        {isLoading ? 'Fetching articles, please wait...' : isReady ? 'Download articles in CSV' : 'Download articles'}
      </button>
    </div>
  );
};

export default FetchAndDownload;
