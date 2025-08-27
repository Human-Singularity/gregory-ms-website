import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const GitHubIssues = ({ repository, owner, label = null, state = 'open' }) => {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({ page: 1, hasNext: false });

	const fetchIssues = async (page = 1) => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				state,
				page: page.toString(),
				per_page: '10',
				sort: 'updated',
				direction: 'desc'
			});
			
			if (label) {
				params.append('labels', label);
			}

			const response = await fetch(
				`https://api.github.com/repos/${owner}/${repository}/issues?${params}`
			);

			if (!response.ok) {
				throw new Error(`GitHub API error: ${response.status}`);
			}

			const data = await response.json();
			
			// Filter out pull requests (GitHub API returns PRs as issues)
			const actualIssues = data.filter(issue => !issue.pull_request);
			
			setIssues(actualIssues);
			
			// Check for next page in Link header
			const linkHeader = response.headers.get('link');
			const hasNext = linkHeader && linkHeader.includes('rel="next"');
			setPagination({ page, hasNext });
			
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchIssues(pagination.page);
	}, [repository, owner, label, state, pagination.page]);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getStateColor = (state) => {
		return state === 'open' ? 'success' : 'secondary';
	};

	const handlePageChange = (newPage) => {
		setPagination(prev => ({ ...prev, page: newPage }));
		// Scroll to top of issues list
		document.getElementById('github-issues-app')?.scrollIntoView({ behavior: 'smooth' });
	};

	if (loading) {
		return (
			<div className="text-center py-4">
				<div className="spinner-border text-primary" role="status">
					<span className="sr-only">Loading issues...</span>
				</div>
				<p className="mt-2 text-muted">Loading GitHub issues...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-danger" role="alert">
				<i className="fas fa-exclamation-triangle me-2"></i>
				<strong>Error loading GitHub issues:</strong> {error}
				<hr/>
				<p className="mb-0">
					<a 
						href={`https://github.com/${owner}/${repository}/issues`}
						className="btn btn-sm btn-outline-danger"
						target="_blank"
						rel="noopener noreferrer"
					>
						View Issues on GitHub <i className="fas fa-external-link-alt"></i>
					</a>
				</p>
			</div>
		);
	}

	return (
		<div className="github-issues">
			<div className="card border-0 shadow-sm">
				<div className="card-header bg-white border-bottom-0 pb-0">
					<div className="d-flex justify-content-between align-items-center">
						<h3 className="h4 mb-0 d-flex align-items-center">
							<i className="fab fa-github me-2 text-dark"></i>
							Public Issue Tracker
						</h3>
						<div className="d-flex gap-2">
							<a 
								href={`https://github.com/${owner}/${repository}/issues/new`}
								className="btn btn-sm btn-primary"
								target="_blank"
								rel="noopener noreferrer"
								data-umami-event="click--github-new-issue"
							>
								<i className="fas fa-plus me-1"></i>
								Report Issue
							</a>
							<a 
								href={`https://github.com/${owner}/${repository}/issues`}
								className="btn btn-sm btn-outline-primary"
								target="_blank"
								rel="noopener noreferrer"
								data-umami-event="click--github-issues-view-all"
							>
								View All <i className="fas fa-external-link-alt ms-1"></i>
							</a>
						</div>
					</div>
				</div>
				<div className="card-body pt-3">
					{issues.length === 0 ? (
						<div className="text-center py-5">
							<i className="far fa-smile text-muted" style={{fontSize: '3rem'}}></i>
							<h5 className="mt-3 text-muted">No {state} issues found</h5>
							<p className="text-muted">
								Great! There are currently no {state} issues. 
								{state === 'open' && (
									<span>
										<br/>
										<a 
											href={`https://github.com/${owner}/${repository}/issues/new`}
											className="btn btn-success btn-sm mt-2"
											target="_blank"
											rel="noopener noreferrer"
										>
											Report the first issue
										</a>
									</span>
								)}
							</p>
						</div>
					) : (
						<>
							<div className="mb-3 small text-muted d-flex justify-content-between align-items-center">
								<span>
									<i className="fas fa-list me-1"></i>
									Showing {issues.length} issue{issues.length !== 1 ? 's' : ''}
								</span>
								<span>
									Updated {formatDate(issues[0]?.updated_at || issues[0]?.created_at)}
								</span>
							</div>
							
							<div className="row g-3">
								{issues.map((issue, index) => (
									<div key={issue.id} className="col-12">
										<div className="card border h-100 shadow-sm">
											<div className="card-body p-4">
												<div className="d-flex justify-content-between align-items-start mb-3">
													<div className="d-flex align-items-center gap-2 flex-wrap">
														<span className="badge bg-light text-dark border fw-bold fs-6">
															#{issue.number}
														</span>
														<span className={`badge bg-${getStateColor(issue.state)} d-flex align-items-center`}>
															<i className={`fas ${issue.state === 'open' ? 'fa-exclamation-circle' : 'fa-check-circle'} me-1`} style={{fontSize: '0.75rem'}}></i>
															{issue.state.toUpperCase()}
														</span>
														{issue.comments > 0 && (
															<span className="badge bg-secondary d-flex align-items-center">
																<i className="fas fa-comments me-1" style={{fontSize: '0.75rem'}}></i>
																{issue.comments}
															</span>
														)}
													</div>
												</div>
												
												<h5 className="card-title mb-3 lh-base">
													<a 
														href={issue.html_url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-decoration-none text-dark"
														data-umami-event="click--github-issue"
														data-umami-event-issue={issue.number}
													>
														{issue.title}
													</a>
												</h5>
												
												{issue.labels.length > 0 && (
													<div className="mb-3">
														{issue.labels.map((label) => (
															<span 
																key={label.id}
																className="badge me-2 mb-1"
																style={{ 
																	backgroundColor: `#${label.color}`,
																	color: parseInt(label.color, 16) > 0xffffff/2 ? '#000' : '#fff',
																	fontSize: '0.7rem'
																}}
															>
																{label.name}
															</span>
														))}
													</div>
												)}
												
												{issue.body && (
													<p className="card-text text-muted mb-3 lh-base" style={{fontSize: '0.9rem'}}>
														{issue.body.substring(0, 200)}
														{issue.body.length > 200 && (
															<span>
																...{' '}
																<a 
																	href={issue.html_url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary text-decoration-none fw-bold"
																>
																	Read more
																</a>
															</span>
														)}
													</p>
												)}
												
												<div className="d-flex justify-content-between align-items-center text-muted small">
													<div className="d-flex align-items-center">
														<img 
															src={issue.user.avatar_url} 
															alt={issue.user.login}
															className="rounded-circle me-2"
															width="24"
															height="24"
															loading="lazy"
														/>
														<span>
															opened {formatDate(issue.created_at)} by{' '}
															<strong className="text-dark">{issue.user.login}</strong>
														</span>
													</div>
													<a 
														href={issue.html_url}
														target="_blank"
														rel="noopener noreferrer"
														className="btn btn-sm btn-outline-primary"
														data-umami-event="click--github-issue-details"
													>
														View on GitHub <i className="fas fa-external-link-alt ms-1"></i>
													</a>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Show load more hint if there are more issues */}
							{pagination.hasNext && (
								<div className="text-center mt-4 mb-3">
									<small className="text-muted">
										<i className="fas fa-info-circle me-1"></i>
										More issues available - use pagination below
									</small>
								</div>
							)}					{/* Pagination */}
					{(pagination.page > 1 || pagination.hasNext) && (
						<div className="card-footer bg-light border-top">
							<div className="d-flex justify-content-between align-items-center">
								<button 
									className="btn btn-sm btn-outline-secondary"
									disabled={pagination.page === 1}
									onClick={() => handlePageChange(pagination.page - 1)}
								>
									<i className="fas fa-chevron-left me-1"></i>
									Previous
								</button>
								<span className="text-muted small fw-bold">
									Page {pagination.page}
								</span>
								<button 
									className="btn btn-sm btn-outline-secondary"
									disabled={!pagination.hasNext}
									onClick={() => handlePageChange(pagination.page + 1)}
								>
									Next
									<i className="fas fa-chevron-right ms-1"></i>
								</button>
							</div>
						</div>
					)}
				</>
			)}
				</div>
			</div>
		</div>
	);
};

GitHubIssues.propTypes = {
	repository: PropTypes.string.isRequired,
	owner: PropTypes.string.isRequired,
	label: PropTypes.string,
	state: PropTypes.oneOf(['open', 'closed', 'all'])
};

export default GitHubIssues;
