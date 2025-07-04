import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Pagination({ page_path, ...props }) {
	const navigate = useNavigate();
	const setPage = (page) => {
		props.setPage(page);
		navigate(`${page_path}/page/${page}`);
	};

	return (
		<ul className="pagination pagination-primary m-4 d-flex justify-content-center">
			<li className="page-item">
				<button onClick={() => setPage(1)} className="page-link" aria-label="Go to the first page">
					<span aria-hidden="true"><i className="fa fa-angle-left" aria-hidden="true"></i><i className="fa fa-angle-double-left" aria-hidden="true"></i></span>
				</button>
			</li>
			<li className="page-item">
				<button onClick={() => setPage(props.page + 1)} className="page-link" aria-label="Go to previous page">
					<span aria-hidden="true"><i className="fa fa-angle-double-left" aria-hidden="true"></i></span>
				</button>
			</li>
			{props.page > 2 &&
				<React.Fragment>
					<li className="page-item">
						<button className="page-link" onClick={() => setPage(props.page - 2)}>{props.page - 2}</button>
					</li>
				</React.Fragment>}

			{props.page > 1 &&
				<React.Fragment>
					<li className="page-item">
						<button className="page-link" onClick={() => setPage(props.page - 1)}>{props.page - 1}</button>
					</li>
				</React.Fragment>}
				<li className="page-item active">
				<button className="page-link" href={`${page_path}/page/${props.page}/`}>{props.page}</button>
			</li>
			{props.page < props.last_page &&
				<React.Fragment>
					<li className="page-item">
						<button className="page-link" onClick={() => setPage(props.page + 1)}>{props.page + 1}</button>
					</li>
					<li className="page-item disabled">
						<span aria-hidden="true">&nbsp;…&nbsp;</span>
					</li>
					<li className="page-item">
						<button className="page-link" onClick={() => setPage(props.last_page)}>{props.last_page}</button>
					</li>
					<li className="page-item">
						<button onClick={() => setPage(props.page + 1)} className="page-link" aria-label="Go to next page">
							<span aria-hidden="true"><i className="fa fa-angle-double-right" aria-hidden="true"></i></span>
						</button>
					</li>
					<li className="page-item">
						<button onClick={() => setPage(props.last_page)} className="page-link" aria-label="Go to last page">
							<span aria-hidden="true"><i className="fa fa-angle-double-right" aria-hidden="true"></i><i className="fa fa-angle-right" aria-hidden="true"></i></span>
						</button>
					</li>
				</React.Fragment>}
		</ul>
	);
}
