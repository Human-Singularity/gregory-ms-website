import React from 'react';
import { formatDate, generateArticleURL } from './utils';


export function ArticleSnippet(props) {
	const date = new Date(props.article.published_date);
	return (
		<div className='col-md-6'>
			<div className="card card-plain card-blog">
				<div className="card-body">
					{formatDate(date)} <span className="badge badge-info text-white font-weight-normal"></span>
					<h4 className="card-title">
						<a href={generateArticleURL(props.article)}>{props.article.title} </a>
					</h4>
					<p className="card-description ">
						{props.article.takeaways}
					</p>
					<p className="author text-wrap">
						<span className="badge badge-info text-white font-weight-normal">{props.article.container_title}</span>
						{/* {props.article.ml_prediction_gnb === true ? <span className="ml-1 text-white badge badge-success font-weight-normal">AI prediction</span> : null}
						{props.article.relevant === true ? <span className="ml-1 text-white badge badge-primary font-weight-normal">manual selection</span> : null} */}

					</p>
					<p></p>
				</div>
			</div>
		</div>
	);
}
