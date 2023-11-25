import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WordCloud from 'react-wordcloud'; // assuming you're using 'react-wordcloud' library

const WordCloudGenerator = ({ authorId, apiEndpoint }) => {
  const [nounPhrases, setNounPhrases] = useState([]);
  const [nextPage, setNextPage] = useState(apiEndpoint.replace('{authorId}', authorId));

  useEffect(() => {
    const fetchArticles = async () => {
      while (nextPage) {
        try {
          const response = await axios.get(nextPage);
          const { next, results } = response.data;
          // Extract noun phrases from the articles and add them to the state
          const newNounPhrases = results.flatMap(article => article.noun_phrases);
          setNounPhrases(prevNounPhrases => [...prevNounPhrases, ...newNounPhrases]);
          setNextPage(next); // Set the next page URL
        } catch (error) {
          console.error('Error fetching articles:', error);
          break;
        }
      }
    };

    fetchArticles();
  }, [authorId]); // The effect should run once on mount and whenever the authorId changes

  const words = nounPhrases.map(phrase => ({ text: phrase, value: 1 })); // WordCloud expects an array of objects with 'text' and 'value'

  return (
    <div>
      {nounPhrases.length > 0 ? (
        <WordCloud words={words} />
      ) : (
        <p>Loading word cloud...</p>
      )}
    </div>
  );
};

export default WordCloudGenerator;