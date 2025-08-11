import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import fileDownload from 'js-file-download';

// Helper function to convert Blob to text for diagnostics
const blobToText = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
};

// Helper function to check for duplicate values in an array of objects
const countUniqueValues = (array, key) => {
  const uniqueValues = new Set();
  array.forEach(item => {
    if (item && item[key]) {
      uniqueValues.add(item[key]);
    }
  });
  return uniqueValues.size;
};

// Helper function to check for duplicate article IDs in CSV content
const countUniqueArticleIds = (csvContent) => {
  // Skip the header row
  const rows = csvContent.split('\n').slice(1);
  const articleIds = new Set();
  
  // Try to extract article_id from each row
  rows.forEach(row => {
    if (!row.trim()) return; // Skip empty rows
    
    const columns = row.split(',');
    if (columns.length > 0) {
      // Try to extract article_id - usually the first column
      const idValue = columns[0].replace(/"/g, '').trim();
      if (idValue && !isNaN(parseInt(idValue))) {
        articleIds.add(parseInt(idValue));
      }
    }
  });
  
  return articleIds.size;
};

/**
 * DownloadButton component - Fetches and downloads data as CSV
 * @param {object} props - Component props
 * @param {string} props.apiEndpoint - API endpoint to fetch data from
 * @param {string} props.fileName - Name of the downloaded file
 * @param {object} props.searchParams - Search parameters to include in the API request
 * @returns {JSX.Element} - DownloadButton component
 */
export function DownloadButton({ 
  apiEndpoint,
  fileName = 'gregory-ms-data.csv',
  searchParams = {}
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle download button click
  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    
    // For debugging, let's add a timestamp to track how long the download takes
    const startTime = new Date();
    console.log(`Download started at ${startTime.toISOString()}`);
    
    // Implement a retry mechanism for network issues
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < maxRetries) {
      try {
        // For category downloads, use both all_results and high page_size as fallback
        const allParams = {
          ...searchParams,
          format: 'csv',
          all_results: 'true', // Primary method to get all results
          page_size: 50000, // Fallback method in case all_results doesn't work
          page: 1
        };
        
        console.log('Download request URL:', apiEndpoint);
        console.log('Download params:', allParams);
        console.log('Expected count from UI:', searchParams.expectedCount || 'not provided');
        
        // Set a longer timeout to prevent connection issues with large responses
        const axiosOptions = {
          responseType: 'arraybuffer',
          timeout: 300000, // 5 minutes timeout for large datasets
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          headers: {
            'Accept': 'text/csv'
          }
        };
        
        // For category endpoints, always use GET with query parameters
        const queryParams = new URLSearchParams(allParams);
        const fullUrl = `${apiEndpoint}?${queryParams.toString()}`;
        console.log('Full download URL:', fullUrl);
        
        const response = await axios.get(fullUrl, axiosOptions);
        
        // Download the CSV file - now handling the arraybuffer response
        console.log('Response received. Content type:', response.headers['content-type']);
        
        // Try to detect if this is a binary representation of a Python generator
        // This occurs when the server incorrectly streams a generator
        const buffer = new Uint8Array(response.data);
        const firstFewBytes = Array.from(buffer.slice(0, 20)).map(b => String.fromCharCode(b)).join('');
        
        console.log('First few bytes:', firstFewBytes);
        
        // If the data doesn't start with expected CSV patterns and is small,
        // it's likely a binary representation of a generator, not actual CSV data
        if (buffer.length < 1000 && !firstFewBytes.includes(',') && !firstFewBytes.includes('"')) {
          setError(new Error('Server returned incorrect data format. The streaming implementation on the server needs to be fixed.'));
          console.error('Server returned incorrect data format - likely a binary representation of a generator object');
          setIsLoading(false);
          break;
        }
        
        // Create a Blob from the ArrayBuffer with the correct content type
        const contentType = response.headers['content-type'] || 'text/csv';
        
        // Try to convert the arraybuffer to a string using TextDecoder
        let csvContent;
        try {
          // First try UTF-8
          csvContent = new TextDecoder('utf-8').decode(response.data);
          
          // Verify it looks like CSV (contains commas or quotes)
          if (!csvContent.includes(',') && !csvContent.includes('"') && !csvContent.includes('\n')) {
            // If it doesn't look like CSV, try different encodings
            csvContent = new TextDecoder('iso-8859-1').decode(response.data);
          }
          
          console.log('Decoded CSV sample:', csvContent.substring(0, 150).replace(/\n/g, '\\n'));
          console.log('Response headers:', response.headers);
          
          // Add some basic analysis of CSV content
          const lineCount = csvContent.split('\n').length;
          const firstLine = csvContent.split('\n')[0];
          const columnCount = firstLine.split(',').length;
          console.log(`CSV has approximately ${lineCount} lines with ${columnCount} columns`);
          
          // Validate CSV content
          if (!csvContent.includes(',') && !csvContent.includes('"') && !csvContent.includes('\n')) {
            throw new Error('Content does not appear to be CSV');
          }
          
          // Successfully decoded, create a blob with text content
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
          fileDownload(blob, fileName);
          console.log('CSV download successful');
          
          const rowCount = csvContent.split('\n').length - 1; // Subtract 1 for header
          const endTime = new Date();
          const elapsedTime = (endTime - startTime) / 1000; // in seconds
          
          // Calculate unique article IDs in the CSV
          const uniqueArticleIdCount = countUniqueArticleIds(csvContent);
          
          console.log(`CSV download contains ${rowCount} rows (expected: ${searchParams.expectedCount || 'unknown'})`);
          console.log(`CSV contains ${uniqueArticleIdCount} unique article IDs`);
          console.log(`Download completed in ${elapsedTime} seconds`);
          
          // Check if row count differs significantly from expected count
          if (searchParams.expectedCount && Math.abs(rowCount - searchParams.expectedCount) > 5) {
            console.warn(`CSV row count (${rowCount}) differs from expected count (${searchParams.expectedCount})`);
            console.warn(`This is likely due to duplicate records in the API count. The server query should use .distinct('article_id')`);
          }
          
          // Debugging: Check for duplicate article IDs
          const uniqueArticleCount = countUniqueArticleIds(csvContent);
          console.log(`Found ${uniqueArticleCount} unique article IDs in the CSV content`);
          
          // If the count of unique article IDs is less than expected, log a warning
          if (searchParams.expectedCount && uniqueArticleCount < searchParams.expectedCount) {
            console.warn(`Expected at least ${searchParams.expectedCount} unique article IDs, but found ${uniqueArticleCount}`);
          }
        } catch (decodeError) {
          console.error('Error decoding CSV:', decodeError);
          
          // Fallback: Try to download the raw data
          const blob = new Blob([response.data], { 
            type: contentType.includes('charset=') 
              ? contentType 
              : contentType + ';charset=utf-8'
          });
          
          // Get a sample of the data as text for logging
          const sampleText = await blobToText(blob.slice(0, 150));
          console.log('Raw blob sample:', sampleText.replace(/\n/g, '\\n'));
          
          // Create a URL for the blob and trigger download
          fileDownload(blob, fileName);
          console.log('Raw download triggered as fallback');
        }
        setIsLoading(false);
        break; // Successful response, exit retry loop
        
      } catch (err) {
        console.error(`Error downloading data (attempt ${retryCount + 1}/${maxRetries}):`, err);
        lastError = err;
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait before retrying (exponential backoff: 2s, 4s, 8s, etc.)
          const delay = 2000 * Math.pow(2, retryCount - 1);
          console.log(`Retrying in ${delay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we've exhausted all retries and still have an error
    if (lastError) {
      setError(lastError);
      setIsLoading(false);
    }
  };

  return (
    <div className="download-button-container">
      <button
        className="btn btn-success mr-2"
        onClick={handleDownload}
        disabled={isLoading}
        data-umami-event="click--download-csv"
        data-umami-event-filename={fileName}
        data-umami-event-endpoint={apiEndpoint}
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
  fileName: PropTypes.string,
  searchParams: PropTypes.object
};

export default DownloadButton;
