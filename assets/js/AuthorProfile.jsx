import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ArticleList } from "./ArticleList";
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { formatDate, updateTitleAndMeta } from './utils';

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

export function AuthorProfile() {
  const [author, setAuthor] = useState(null);
  // const authorId = 321257;
  const { authorId } = useParams(); // Uncomment this to use the authorId from the URL

  useEffect(() => {
    async function fetchData() {
      try {
        const authorResponse = await axios.get(`https://api.gregory-ms.com/authors/${authorId}/?format=json`);
        setAuthor(authorResponse.data);

        const h1 = document.querySelector('h1');
        if (h1) {
          h1.textContent = `${authorResponse.data.given_name} ${authorResponse.data.family_name}`;
        }
        const h2ElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > h2');
        if (h2ElementToRemove) {
          h2ElementToRemove.parentNode.removeChild(h2ElementToRemove);
        } else {
          console.log('h2 Element not found');
        }
      
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [authorId]);

  if (!author) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>Author ID: {author.author_id}</div>
      <div>Articles Count: {author.articles_count}</div>
      <div>ORCID: {author.ORCID}</div>
      <ArticleList
      apiEndpoint={`https://api.gregory-ms.com/articles/author/${authorId}/`}
      page_path={`articles/author/${authorId}`}
      />
    </>
  );
}

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/articles/author/:authorId" element={<AuthorProfile />} />
        <Route path="/articles/author/" element={<AuthorProfile />} />
      </Routes>
    </Router>
  </React.StrictMode>);
