import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { formatDate, updateTitleAndMeta, removeSpecifiedNodes } from './utils';

export function SingleArticle() {
    const [article, setArticle] = useState(null);
    const { articleId, articleSlug } = useParams(); // Extract both articleId and articleSlug

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`https://api.gregory-ms.com/articles/${articleId}/?format=json`);
                setArticle(response.data);
                updateTitleAndMeta(response.data); // Call updateTitleAndMeta() after setting the state
                removeSpecifiedNodes();
            } catch (error) {
                console.error('Error fetching the article:', error);
            }
        }
        fetchData();
    }, [articleId]);

    useEffect(() => {
        if (article) {
            const canonicalLink = document.querySelector("link[rel='canonical']");
            const shortLink = `https://gregory-ms.com/articles/${article.article_id}/${articleSlug}`;

            if (canonicalLink) {
                canonicalLink.href = shortLink;
            } else {
                const linkElement = document.createElement("link");
                linkElement.rel = "canonical";
                linkElement.href = shortLink;
                document.head.appendChild(linkElement);
            }
        }
    }, [article, articleSlug]);

    if (!article) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <span id="article" className="anchor"></span>
            <p><strong className='text-muted'>ID</strong>: <span id="id" data-datetime={article.article_id}>{article.article_id}</span></p>
            <p><strong className='text-muted'>Short Link: </strong> <a href={`https://gregory-ms.com/articles/${article.article_id}/`}>https://gregory-ms.com/articles/{article.article_id}/</a> </p>
            <p><strong className='text-muted'>Discovery Date</strong>: <span id="discovery_date" data-datetime={article.discovery_date}>{article.discovery_date ? formatDate(article.discovery_date) : 'Unknown'}</span></p>
            <p><strong className='text-muted'>Published Date</strong>: <span id="published_date" data-datetime={article.published_date}>{article.published_date ? formatDate(article.published_date) : 'Unknown'}</span></p>
            <p><strong className='text-muted'>Publisher</strong>: <span id="publisher">{article.publisher}</span></p>
            <p><strong className='text-muted'>Link</strong>: <span id="link"><a href={article.link}>{article.link}</a></span></p>

            {article.ml_predictions && article.ml_predictions.length > 0 && (
                <>
                    <p><strong className='text-muted'>Machine Learning Prediction (Gaussian Naive Bayes Model)</strong>: <span id="ml_prediction_gnb">{article.ml_predictions[0]?.gnb === null ? "not set" : article.ml_predictions[0]}</span></p>
                </>
            )}

            <div className="post-text" id="takeaways">
                <h2>Main Takeaways</h2>
                <p>{article.takeaways || 'No takeaways available.'}</p>
            </div>

            <div className="post-text" id="abstract">
                <h2>Abstract</h2>
                <div dangerouslySetInnerHTML={{ __html: article.summary || 'No summary available.' }}></div>
            </div>

            <div className="authors-list">
                <h2>Authors</h2>
                <ul>
                    {article.authors && article.authors.map(author => (
                        <li key={author.author_id}>
                            {author.given_name} {author.family_name} {author.ORCID && <a href={author.ORCID}>(ORCID)</a>}
                        </li>
                    ))}
                </ul>
            </div>

        </>
    );
}