import React, { useState } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';


const FetchAndDownload = ({ category_slug }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
      'ml_prediction_gnb': item.ml_prediction_gnb,
      'ml_prediction_lr': item.ml_prediction_lr,
      'discovery_date': item.discovery_date,
      'doi': item.doi,
      'access': item.access,
      'takeaways': item.takeaways,
      'categories': item.categories.join(', ')
    }));

    const csvHeaders = Object.keys(csvData[0]);

    let csvContent = csvHeaders.join(',') + '\n';
    csvContent += csvData.map(row => Object.values(row).join(',')).join('\n');

    fileDownload(csvContent, 'articles.csv');
  };

  const fetchAndDownload = async (slug) => {
    setIsLoading(true);
    let url = `https://api.gregory-ms.com/articles/category/${slug}/`;
    let response = await axios.get(url);
    let fetchedData = response.data.results;
    while(response.data.next !== null) {
      response = await axios.get(response.data.next);
      fetchedData = [...fetchedData, ...response.data.results];
    }
    setData(fetchedData);
    setIsLoading(false);
    setIsReady(true);
    downloadCSV(fetchedData);
		console.log('fetchedData', fetchedData);
  };

  return (
    <div>
      <button 
			className={isReady ? 'btn btn-success btn-md float-right' : 'btn btn-info btn-md float-right'}
			onClick={fetchAndDownload.bind(this, category_slug)} 
			disabled={isLoading}>
        {isLoading ? 'Fetching articles, please wait...' : isReady ? 'Download articles in CSV' : 'Download articles'}
      </button>
    </div>
  );
};

export default FetchAndDownload;
