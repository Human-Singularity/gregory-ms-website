import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import fileDownload from 'js-file-download';

/**
 * DownloadButton component - Fetches and downloads data as CSV
 * @param {object} props - Component props
 * @param {string} props.apiEndpoint - API endpoint to fetch data from
 * @param {string} props.fileName - Name of the downloaded file
 * @returns {JSX.Element} - DownloadButton component
 */
export function DownloadButton({ 
  apiEndpoint, 
  fileName = 'gregory-ms-data.csv' 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to escape CSV values
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

  // Convert data to CSV format
  const convertToCSV = (data) => {
    // Define columns for different data types
    const articleColumns = [
      'article_id', 'title', 'link', 'published_date', 
      'source', 'publisher', 'container_title', 'relevant',
      'takeaways', 'doi', 'is_free', 'author_count'
    ];
    
    const trialColumns = [
      'trial_id', 'title', 'link', 'published_date', 
      'source', 'container_title', 'takeaways'
    ];
    
    // Determine columns based on first item
    const firstItem = data[0];
    const columns = firstItem && 'article_id' in firstItem ? articleColumns : trialColumns;
    
    // Create CSV header
    let csvContent = columns.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = columns.map(col => escapeCsvValue(item[col])).join(',');
      csvContent += row + '\n';
    });
    
    return csvContent;
  };

  // Handle download button click
  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all pages of data
      let allData = [];
      let nextUrl = `${apiEndpoint}?format=json`;
      
      while (nextUrl) {
        const response = await axios.get(nextUrl);
        allData = [...allData, ...response.data.results];
        
        // Check if there are more pages
        nextUrl = response.data.next;
      }
      
      // Convert to CSV and download
      const csvData = convertToCSV(allData);
      fileDownload(csvData, fileName);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error downloading data:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="download-button-container mb-4">
      <button
        className="btn btn-primary"
        onClick={handleDownload}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
            Downloading...
          </>
        ) : (
          <>
            <i className="fas fa-download mr-2"></i>
            Download as CSV
          </>
        )}
      </button>
      
      {error && (
        <div className="alert alert-danger mt-2">
          <p>Error downloading data: {error.message}</p>
        </div>
      )}
    </div>
  );
}

DownloadButton.propTypes = {
  apiEndpoint: PropTypes.string.isRequired,
  fileName: PropTypes.string
};

export default DownloadButton;
