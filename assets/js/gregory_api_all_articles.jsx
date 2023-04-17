import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
//import { BrowserRouter as Router, Route, Link, Outlet, useParams } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';

// const root = ReactDOM.createRoot(document.getElementById("root"));
function formatDate(date) {
  if (isNaN(Date.parse(date))) {
    throw new Error('Invalid date value');
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-UK', options).format(dateObj);
}
function updateTitleAndMeta(article) {
	// Update the <title> tag
	document.title = article.title;

  // Update the title
  const titleElement = document.querySelector('h1.title');
  if (titleElement) {
    titleElement.textContent = article.title;
  }
	// Truncate the article.takeaways to 155 characters
	const truncatedTakeaways = article.takeaways.slice(0, 155);

	// Update the meta description
	const metaDescription = document.querySelector('meta[name="description"]');
	if (metaDescription) {
		metaDescription.setAttribute('content', truncatedTakeaways);
	}

	

  // Remove the first specified element (h2)
  const h2ElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > h2');
  if (h2ElementToRemove) {
    h2ElementToRemove.parentNode.removeChild(h2ElementToRemove);
  } else {
    console.log('h2 Element not found');
  }

  // Remove the second specified element (a)
  const aElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > a');
  if (aElementToRemove) {
    aElementToRemove.parentNode.removeChild(aElementToRemove);
  } else {
    console.log('a Element not found');
  }
}

const generateArticleURL = (article) => {
  const article_id = article.article_id;
  const article_slug = article.title.replace(/ /g, '-').toLowerCase();
  return `/articles/${article_id}/${article_slug}`;
};


function ArticleSnippet(props) {
  const date = new Date(props.article.published_date);
	return (
		<div className='col-md-6'>
			<div className="card card-plain card-blog">
			<div className="card-body">
			{formatDate(date)} <span className="badge badge-info text-white font-weight-normal"></span>
				<h4 className="card-title">
				<a href={generateArticleURL(props.article)} >{props.article.title} </a>
				</h4>
				<p className="card-description ">
				{props.article.takeaways}
				</p>
				<p className="author">
				<span className="badge badge-info text-white font-weight-normal">{props.article.container_title}</span>
				{props.article.ml_prediction_gnb === true ? <span className="ml-1 text-white badge badge-success font-weight-normal">AI prediction</span> : null}
				{props.article.relevant === true ? <span className="ml-1 text-white badge badge-primary font-weight-normal">manual selection</span> : null}

				</p>
				<p></p>
			</div>
			</div>
		</div>
		);
}

function ArticlesList() {
	const [articles, setArticles] = useState([]);
	const [page, setPage] = useState(1);
	const [last_page, setLastPage] = useState(null);
	

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`https://api.gregory-ms.com/articles/?format=json&page=${page}`);
      setArticles(response.data.results);
			setLastPage(Math.ceil(response.data.count / 10));
    }
    fetchData();
  }, [page]);

	
	return (
		<div>
			<p>Articles listed come from the following sites, using keyword searches for `Multiple Sclerosis, autoimmune encephalomyelitis, encephalomyelitis, immune tolerance, myelin`.</p>
			<ul className="list-inline">
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://www.apta.org/search?Q=&quot;Multiple+Sclerosis&quot;+OR+&quot;autoimmune+encephalomyelitis&quot;+OR+encephalomyelitis+OR+&quot;immune+tolerance&quot;+OR+myelin&amp;searcharticletypes=8834&amp;searchconditionandsymptoms=&amp;searchloc=APTA'>APTA <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://www.biomedcentral.com/search?searchType=publisherSearch&amp;sort=PubDate&amp;page=1&amp;query=Multiple+Sclerosis'>BioMedCentral <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://www.jneurosci.org/search/text_abstract_title%3AMultiple%2BSclerosis text_abstract_title_flags%3Amatch-phrase exclude_meeting_abstracts%3A1 numresults%3A50 sort%3Apublication-date direction%3Adescending format_result%3Astandard'>JNeurosci <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://search.pedro.org.au/advanced-search/results?abstract_with_title=Multiple+Sclerosis&amp;therapy=0&amp;problem=0&amp;body_part=0&amp;subdiscipline=0&amp;topic=0&amp;method=0&amp;authors_association=&amp;title=&amp;source=&amp;year_of_publication=&amp;date_record_was_created=&amp;nscore=&amp;perpage=20&amp;lop=or&amp;find=&amp;find=Start+Search'>PEDro <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://pubmed.ncbi.nlm.nih.gov/rss/search/10guX6I3SqrbUeeLKSTD6FCRM44ewnrN2MKKTQLLPMHB4xNsZU/?limit=15&amp;utm_campaign=pubmed-2&amp;fc=20210216052009'>PubMed <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://www.reutersagency.com/feed/?best-topics=health'>Reuters <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://search.scielo.org/?q=Multiple+Sclerosis&amp;lang=en&amp;count=15&amp;from=0&amp;output=site&amp;sort=&amp;format=summary&amp;fb=&amp;page=1&amp;q=&quot;Multiple+Sclerosis&quot;+OR+&quot;autoimmune+encephalomyelitis&quot;+OR+encephalomyelitis+OR+&quot;immune+tolerance&quot;+OR+myelin&amp;lang=en&amp;page=1'>Scielo <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://www.thelancet.com/action/doSearch?text1=&quot;Multiple+Sclerosis&quot;+OR+&quot;autoimmune+encephalomyelitis&quot;+OR+encephalomyelitis+OR+&quot;immune+tolerance&quot;+OR+myelin&amp;field1=AbstractTitleKeywordFilterField&amp;startPage=0&amp;sortBy=Earliest'>TheLancet <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://www.msard-journal.com/action/doSearch?text1=Multiple+Sclerosis&amp;field1=AbstractTitleKeywordFilterField&amp;startPage=0&amp;sortBy=Earliest'>MS and Related Disorders <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			<li className="list-inline-item"><a target="_blank" className="btn btn-primary btn-outline-primary btn-round" href='https://journals.sagepub.com/action/doSearch?AllField=multiple+sclerosis&amp;SeriesKey=msja&amp;content=articlesChapters&amp;countTerms=true&amp;target=default&amp;sortBy=Ppub&amp;startPage=&amp;ContentItemType=research-article'>Sage <i className="text-muted text-primary fas fa-external-link-square-alt"></i></a> </li>
			</ul>
			<p>
				<a className="btn btn-info btn-round btn-lg font-weight-bold mx-auto umami--click--relevant-articles-on-articles-page" href="/relevant/">Filter by relevant articles <i className="text-muted text-info fas fa-arrow-right" style={{ transform: ".4s", boxShadow: ".4s" }}></i></a>
			</p>
		<div className="row">
			<div className="col-md-12">
				<Pagination page={page} setPage={setPage} last_page={last_page} />
			</div>
			{articles.map((article) => (
				<ArticleSnippet key={article.article_id} article={article} />
			))}
			<div className="col-md-12">
				<Pagination page={page} setPage={setPage} last_page={last_page} />
			</div>
		</div>
	</div>
	);
}

function Pagination(props){
	return (
		<ul className="pagination pagination-primary m-4 d-flex justify-content-center">
			<li className="page-item">
				<a onClick={() => props.setPage(1)} className="page-link" aria-label="First">
				<span aria-hidden="true"><i className="fa fa-angle-left" aria-hidden="true"></i><i className="fa fa-angle-double-left" aria-hidden="true"></i></span>
			</a>
			</li>
			<li className="page-item">
				<a onClick={() => props.setPage(props.page + 1)} className="page-link" aria-label="Previous">
				<span aria-hidden="true"><i className="fa fa-angle-double-left" aria-hidden="true"></i></span>
				</a>
			</li>
			{ props.page > 2 &&
			<React.Fragment>
				<li className="page-item">
					<a className="page-link" onClick={() => props.setPage(props.page - 2)}>{props.page - 2}</a>
				</li>
			</React.Fragment>
			}

	{ props.page > 1 &&
			<React.Fragment>
				<li className="page-item">
					<a className="page-link" onClick={() => props.setPage(props.page - 1)}>{props.page - 1}</a>
				</li>
			</React.Fragment>
			}
			<li className="page-item active">
				<a className="page-link" href="/articles/page/{props.page}/">{props.page}</a>
			</li>
			{ props.page < props.last_page &&
			<React.Fragment>
				<li className="page-item">
					<a className="page-link" onClick={() => props.setPage(props.page + 1)}>{props.page + 1}</a>
				</li>
				<li className="page-item disabled">
					<span aria-hidden="true">&nbsp;…&nbsp;</span>
				</li>
				<li className="page-item">
					<a className="page-link" onClick={() => props.setPage(props.last_page)}>{props.last_page}</a>
				</li>
				<li className="page-item">
					<a onClick={() => props.setPage(props.page + 1)} className="page-link" aria-label="Next">
					<span aria-hidden="true"><i className="fa fa-angle-double-right" aria-hidden="true"></i></span>
					</a>
				</li>
				<li className="page-item">
					<a onClick={() => props.setPage(props.last_page)} className="page-link" aria-label="Last">
					<span aria-hidden="true"><i className="fa fa-angle-double-right" aria-hidden="true"></i><i className="fa fa-angle-right" aria-hidden="true"></i></span>
					</a>
				</li>
			</React.Fragment>
			}
		</ul>
)}

function SingleArticle() {
  const [article, setArticle] = useState(null);
  const { articleId } = useParams();

	useEffect(() => {
		async function fetchData() {
			const response = await axios.get(`https://api.gregory-ms.com/articles/${articleId}/?format=json`);
			setArticle(response.data);
			updateTitleAndMeta(response.data); // Call updateTitleAndMeta() after setting the state
		}
		fetchData();
	}, [articleId]);
	
	if (!article) {
		return <div>Loading...</div>;
	}	

	return (
		<>
			<span id="article" className="anchor"></span>
			<p><strong className='text-muted'>ID</strong>: <span id="id" data-datetime={article.article_id}>{article.article_id}</span></p>
			<p><strong className='text-muted'>Short Link: </strong> <a href={`https://gregory-ms.com/articles/${article.article_id}`}>https://gregory-ms.com/articles/{article.article_id}</a> </p>
			<p><strong className='text-muted'>Discovery Date</strong>: <span id="discovery_date" data-datetime={article.discovery_date}>{article.discovery_date ? formatDate(article.discovery_date) : 'Unknown'}</span></p>
			<p><strong className='text-muted'>Published Date</strong>: <span id="published_date" data-datetime={article.published_date}>{article.published_date ? formatDate(article.published_date) : 'Unknown'}</span></p>
			<p><strong className='text-muted'>Source</strong>: <span id="source">{article.publisher}</span></p>
			<p><strong className='text-muted'>Link</strong>: <span id="link"><a href={article.link}>{article.link}</a></span></p>
			<p><strong className='text-muted'>Manual Selection</strong>: <span id="relevant">{article.relevant === null ? "not set" : article.relevant.toString()}</span></p>
		  <p><strong className='text-muted'>Machine Learning Prediction (Gaussian Naive Bayes Model)</strong>: <span id="ml_prediction_gnb">{article.ml_prediction_gnb === null ? "not set" : article.ml_prediction_gnb.toString()}</span></p>
	
			<div className="post-text" id="takeaways">
				<h2>Main Takeaways</h2>
				<p>{article.takeaways}</p>
			</div>
	
			<div className="post-text" id="abstract">
				<h2>Abstract</h2>
				<div dangerouslySetInnerHTML={{ __html: article.summary }}></div>
			</div>
		</>
	);
	
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/articles/" element={<ArticlesList />} />
        <Route path="/articles/:articleId/:article_slug" element={<SingleArticle />} />
				<Route path="/articles/:articleId" element={<SingleArticle />} />
      </Routes>
    </Router>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);