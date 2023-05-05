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
				<a onClick={() => setPage(1)} className="page-link" aria-label="First">
					<span aria-hidden="true"><i className="fa fa-angle-left" aria-hidden="true"></i><i className="fa fa-angle-double-left" aria-hidden="true"></i></span>
				</a>
			</li>
			<li className="page-item">
				<a onClick={() => setPage(props.page + 1)} className="page-link" aria-label="Previous">
					<span aria-hidden="true"><i className="fa fa-angle-double-left" aria-hidden="true"></i></span>
				</a>
			</li>
			{props.page > 2 &&
				<React.Fragment>
					<li className="page-item">
						<a className="page-link" onClick={() => setPage(props.page - 2)}>{props.page - 2}</a>
					</li>
				</React.Fragment>}

			{props.page > 1 &&
				<React.Fragment>
					<li className="page-item">
						<a className="page-link" onClick={() => setPage(props.page - 1)}>{props.page - 1}</a>
					</li>
				</React.Fragment>}
			<li className="page-item active">
				<a className="page-link" href="/relevant/page/{props.page}/">{props.page}</a>
			</li>
			{props.page < props.last_page &&
				<React.Fragment>
					<li className="page-item">
						<a className="page-link" onClick={() => setPage(props.page + 1)}>{props.page + 1}</a>
					</li>
					<li className="page-item disabled">
						<span aria-hidden="true">&nbsp;…&nbsp;</span>
					</li>
					<li className="page-item">
						<a className="page-link" onClick={() => setPage(props.last_page)}>{props.last_page}</a>
					</li>
					<li className="page-item">
						<a onClick={() => setPage(props.page + 1)} className="page-link" aria-label="Next">
							<span aria-hidden="true"><i className="fa fa-angle-double-right" aria-hidden="true"></i></span>
						</a>
					</li>
					<li className="page-item">
						<a onClick={() => setPage(props.last_page)} className="page-link" aria-label="Last">
							<span aria-hidden="true"><i className="fa fa-angle-double-right" aria-hidden="true"></i><i className="fa fa-angle-right" aria-hidden="true"></i></span>
						</a>
					</li>
				</React.Fragment>}
		</ul>
	);
}
