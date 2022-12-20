import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client'
import axios from 'axios';

const root = ReactDOM.createRoot(document.getElementById("root"));
function formatDate(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Intl.DateTimeFormat('en-UK', options).format(date);
}
function Article(props) {
  const date = new Date(props.article.published_date);
	return (
		<div className='col-md-6'>
			<div className="card card-plain card-blog">
			<div className="card-body">
			{formatDate(date)} <span className="badge badge-info text-white font-weight-normal"></span>
				<h4 className="card-title">
				<a href={props.article.link} target="_blank">{props.article.title} <i className="fas fa-external-link-square-alt"></i></a>
				</h4>
				<p className="card-description ">
				{props.article.takeaways}
				</p>
				<p className="author">
				<span className="badge badge-info text-white font-weight-normal">{props.article.source}</span>
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
      const response = await axios.get(`https://api.gregory-ms.com/articles/relevant/?format=json&page=${page}`);
      setArticles(response.data.results);
			setLastPage(Math.ceil(response.data.count / 10));
    }
    fetchData();
  }, [page]);

	
	return (
		<div className="row">
			<div className="col-md-12">
				<Pagination page={page} setPage={setPage} last_page={last_page} />
			</div>
			{articles.map((article) => (
				<Article key={article.article_id} article={article} />
			))}
			<div className="col-md-12">
				<Pagination page={page} setPage={setPage} last_page={last_page} />
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
	<li></li>
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

function App() {
  return (
    <div>
      <ArticlesList />	
    </div>
  );
}

root.render(<App />);