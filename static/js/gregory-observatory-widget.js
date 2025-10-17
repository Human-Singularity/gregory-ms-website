/**
 * Gregory Observatory Widget - Embeddable plain JavaScript version
 *
 * A lightweight, standalone widget that displays category data from Gregory MS API
 * No build process required - just include the script and CSS
 *
 * Usage:
 *   <div id="gregory-observatory-widget"></div>
 *   <script>
 *     GregoryObservatory.init({
 *       containerId: 'gregory-observatory-widget',
 *       categoryId: 1, // or categorySlug: 'ocrelizumab'
 *       apiUrl: 'https://api.gregory-ms.com',
 *       teamId: 1,
 *       subjectId: 1
 *     });
 *   </script>
 */

(function(window) {
	'use strict';

	const GregoryObservatory = {
		// Default configuration
		config: {
			containerId: 'gregory-observatory-widget',
			apiUrl: 'https://api.gregory-ms.com',
			teamId: 1,
			subjectId: 1,
			categoryId: null,
			categorySlug: null,
			chartColors: {
				articles: '#007bff',
				trials: '#28a745',
				lgbm: '#fd7e14',
				lstm: '#dc3545',
				pubmedBert: '#6f42c1'
			}
		},

		// State
		state: {
			category: null,
			monthlyData: null,
			articles: [],
			trials: [],
			activeTab: 'chart',
			articlesPage: 1,
			trialsPage: 1,
			articlesHasMore: false,
			trialsHasMore: false,
			loading: {
				category: false,
				chart: false,
				articles: false,
				trials: false
			},
			chart: null
		},

		/**
		 * Initialize the widget
		 * @param {Object} options - Configuration options
		 */
		init: function(options) {
			// Merge options with defaults
			this.config = Object.assign({}, this.config, options);

			// Validate required parameters
			if (!this.config.categoryId && !this.config.categorySlug) {
				console.error('Gregory Observatory Widget: Either categoryId or categorySlug is required');
				return;
			}

			// Get container element
			const container = document.getElementById(this.config.containerId);
			if (!container) {
				console.error('Gregory Observatory Widget: Container element not found:', this.config.containerId);
				return;
			}

			// Initialize widget
			this.container = container;
			this.loadCategoryData();
		},

		/**
		 * Load category data from API
		 */
		loadCategoryData: async function() {
			this.state.loading.category = true;
			this.render();

			try {
				const params = new URLSearchParams({
					format: 'json',
					team_id: this.config.teamId,
					subject_id: this.config.subjectId,
					include_authors: 'true',
					max_authors: '10'
				});

				if (this.config.categoryId) {
					params.append('category_id', this.config.categoryId);
				} else if (this.config.categorySlug) {
					params.append('category_slug', this.config.categorySlug);
				}

				const response = await fetch(`${this.config.apiUrl}/categories/?${params.toString()}`);
				const data = await response.json();

				if (data.results && data.results.length > 0) {
					this.state.category = data.results[0];
					this.state.loading.category = false;
					await this.loadMonthlyData();
					this.render();
				} else {
					throw new Error('Category not found');
				}
			} catch (error) {
				console.error('Error loading category:', error);
				this.state.loading.category = false;
				this.renderError('Failed to load category data');
			}
		},

		/**
		 * Load monthly counts data
		 */
		loadMonthlyData: async function() {
			this.state.loading.chart = true;

			try {
				const params = new URLSearchParams({
					format: 'json',
					category_id: this.state.category.id,
					monthly_counts: 'true'
				});

				const response = await fetch(`${this.config.apiUrl}/categories/?${params.toString()}`);
				const data = await response.json();

				if (data.results && data.results.length > 0 && data.results[0].monthly_counts) {
					this.state.monthlyData = data.results[0].monthly_counts;
				}
			} catch (error) {
				console.error('Error loading monthly data:', error);
			} finally {
				this.state.loading.chart = false;
			}
		},

		/**
		 * Load articles for the category
		 */
		loadArticles: async function(page = 1) {
			this.state.loading.articles = true;
			this.render();

			try {
				const params = new URLSearchParams({
					format: 'json',
					team_id: this.config.teamId,
					subject_id: this.config.subjectId,
					search: this.state.category.category_name,
					page: page,
					page_size: 10
				});

				const response = await fetch(`${this.config.apiUrl}/articles/search/?${params.toString()}`);
				const data = await response.json();

				if (page === 1) {
					this.state.articles = data.results || [];
				} else {
					this.state.articles = this.state.articles.concat(data.results || []);
				}

				this.state.articlesPage = page;
				this.state.articlesHasMore = !!data.next;
			} catch (error) {
				console.error('Error loading articles:', error);
			} finally {
				this.state.loading.articles = false;
				this.render();
			}
		},

		/**
		 * Load trials for the category
		 */
		loadTrials: async function(page = 1) {
			this.state.loading.trials = true;
			this.render();

			try {
				const params = new URLSearchParams({
					format: 'json',
					team_id: this.config.teamId,
					subject_id: this.config.subjectId,
					search: this.state.category.category_name,
					page: page,
					page_size: 10
				});

				const response = await fetch(`${this.config.apiUrl}/trials/search/?${params.toString()}`);
				const data = await response.json();

				if (page === 1) {
					this.state.trials = data.results || [];
				} else {
					this.state.trials = this.state.trials.concat(data.results || []);
				}

				this.state.trialsPage = page;
				this.state.trialsHasMore = !!data.next;
			} catch (error) {
				console.error('Error loading trials:', error);
			} finally {
				this.state.loading.trials = false;
				this.render();
			}
		},

		/**
		 * Change active tab
		 */
		changeTab: function(tabName) {
			this.state.activeTab = tabName;

			// Load data if not already loaded
			if (tabName === 'articles' && this.state.articles.length === 0) {
				this.loadArticles(1);
			} else if (tabName === 'trials' && this.state.trials.length === 0) {
				this.loadTrials(1);
			} else {
				this.render();
			}
		},

		/**
		 * Format chart data
		 */
		formatChartData: function() {
			if (!this.state.monthlyData) return null;

			const combinedData = {};

			// Process article counts
			(this.state.monthlyData.monthly_article_counts || []).forEach(item => {
				if (!item.month) return;
				combinedData[item.month] = {
					date: item.month,
					articles: item.count,
					trials: 0,
					cumulativeArticles: 0,
					cumulativeLgbm: 0,
					cumulativeLstm: 0,
					cumulativePubmedBert: 0
				};
			});

			// Process trial counts
			(this.state.monthlyData.monthly_trial_counts || []).forEach(item => {
				if (!item.month) return;
				if (!combinedData[item.month]) {
					combinedData[item.month] = {
						date: item.month,
						articles: 0,
						trials: item.count,
						cumulativeArticles: 0,
						cumulativeLgbm: 0,
						cumulativeLstm: 0,
						cumulativePubmedBert: 0
					};
				} else {
					combinedData[item.month].trials = item.count;
				}
			});

			// Process ML model counts if available
			if (this.state.monthlyData.monthly_ml_article_counts_by_model) {
				const models = this.state.monthlyData.monthly_ml_article_counts_by_model;

				Object.keys(models).forEach(modelName => {
					models[modelName].forEach(item => {
						if (!item.month || !combinedData[item.month]) return;

						if (modelName === 'lgbm_tfidf') {
							combinedData[item.month].lgbmRelevant = item.count;
						} else if (modelName === 'lstm') {
							combinedData[item.month].lstmRelevant = item.count;
						} else if (modelName === 'pubmed_bert') {
							combinedData[item.month].pubmedBertRelevant = item.count;
						}
					});
				});
			}

			// Sort by date and calculate cumulative values
			const sortedData = Object.values(combinedData).sort((a, b) =>
				new Date(a.date) - new Date(b.date)
			);

			let cumulativeArticles = 0;
			let cumulativeLgbm = 0;
			let cumulativeLstm = 0;
			let cumulativePubmedBert = 0;

			sortedData.forEach(item => {
				cumulativeArticles += item.articles;
				cumulativeLgbm += item.lgbmRelevant || 0;
				cumulativeLstm += item.lstmRelevant || 0;
				cumulativePubmedBert += item.pubmedBertRelevant || 0;

				item.cumulativeArticles = cumulativeArticles;
				item.cumulativeLgbm = cumulativeLgbm;
				item.cumulativeLstm = cumulativeLstm;
				item.cumulativePubmedBert = cumulativePubmedBert;
			});

			// Filter to last 12 months
			const twelveMonthsAgo = new Date();
			twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

			return sortedData.filter(item => {
				const itemDate = new Date(item.date);
				return itemDate >= twelveMonthsAgo;
			});
		},

		/**
		 * Render the chart using Chart.js
		 */
		renderChart: function() {
			const chartData = this.formatChartData();
			if (!chartData || chartData.length === 0) {
				return '<div class="alert alert-info">No chart data available for this category.</div>';
			}

			// Create chart after DOM is ready
			setTimeout(() => {
				const canvas = document.getElementById('gregory-chart');
				if (!canvas) return;

				// Destroy existing chart if it exists
				if (this.state.chart) {
					this.state.chart.destroy();
				}

				const ctx = canvas.getContext('2d');

				this.state.chart = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: chartData.map(item => {
							const date = new Date(item.date);
							return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
						}),
						datasets: [
							{
								label: 'Clinical Trials (Monthly)',
								data: chartData.map(item => item.trials),
								backgroundColor: this.config.chartColors.trials,
								type: 'bar',
								yAxisID: 'y-trials',
								order: 2
							},
							{
								label: 'Articles (Cumulative)',
								data: chartData.map(item => item.cumulativeArticles),
								borderColor: this.config.chartColors.articles,
								backgroundColor: 'transparent',
								type: 'line',
								yAxisID: 'y-articles',
								borderWidth: 3,
								tension: 0.1,
								order: 1
							},
							{
								label: 'LightGBM (Cumulative)',
								data: chartData.map(item => item.cumulativeLgbm),
								borderColor: this.config.chartColors.lgbm,
								backgroundColor: 'transparent',
								type: 'line',
								yAxisID: 'y-articles',
								borderWidth: 2,
								borderDash: [5, 5],
								tension: 0.1,
								order: 1
							},
							{
								label: 'LSTM (Cumulative)',
								data: chartData.map(item => item.cumulativeLstm),
								borderColor: this.config.chartColors.lstm,
								backgroundColor: 'transparent',
								type: 'line',
								yAxisID: 'y-articles',
								borderWidth: 2,
								borderDash: [8, 4],
								tension: 0.1,
								order: 1
							},
							{
								label: 'PubMed BERT (Cumulative)',
								data: chartData.map(item => item.cumulativePubmedBert),
								borderColor: this.config.chartColors.pubmedBert,
								backgroundColor: 'transparent',
								type: 'line',
								yAxisID: 'y-articles',
								borderWidth: 2,
								borderDash: [12, 3],
								tension: 0.1,
								order: 1
							}
						]
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						interaction: {
							mode: 'index',
							intersect: false,
						},
						plugins: {
							legend: {
								position: 'bottom',
								labels: {
									boxWidth: 12,
									padding: 10,
									font: {
										size: 11
									}
								}
							},
							tooltip: {
								callbacks: {
									title: function(tooltipItems) {
										return tooltipItems[0].label;
									}
								}
							}
						},
						scales: {
							'y-trials': {
								type: 'linear',
								position: 'left',
								title: {
									display: true,
									text: 'Monthly Trials'
								},
								beginAtZero: true
							},
							'y-articles': {
								type: 'linear',
								position: 'right',
								title: {
									display: true,
									text: 'Cumulative Articles'
								},
								beginAtZero: true,
								grid: {
									drawOnChartArea: false
								}
							}
						}
					}
				});
			}, 100);

			return `
				<div class="gregory-chart-container">
					<h5>Monthly Research Activity</h5>
					<div style="height: 400px;">
						<canvas id="gregory-chart"></canvas>
					</div>
					<div class="gregory-ml-explanation">
						<h6>About the ML Prediction Models</h6>
						<p>
							The dashed lines represent cumulative counts of articles identified by our machine learning models as containing
							positive patient outcomes, new therapies, or new treatments:
						</p>
						<ul>
							<li><strong>LightGBM</strong> (orange dashed line) - Gradient boosting model trained on article features</li>
							<li><strong>LSTM</strong> (red dashed line) - Deep learning model analyzing article sequences</li>
							<li><strong>PubMed BERT</strong> (purple dashed line) - Transformer model specialized for biomedical text</li>
						</ul>
						<p class="text-muted small">
							These models help identify potentially relevant research that may have clinical significance for MS patients and researchers.
						</p>
					</div>
				</div>
			`;
		},

		/**
		 * Escape HTML to prevent XSS
		 */
		escapeHtml: function(text) {
			if (!text) return '';
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		},

		/**
		 * Format date to readable string
		 */
		formatDate: function(dateString) {
			if (!dateString) return 'N/A';
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		},

		/**
		 * Render articles list
		 */
		renderArticles: function() {
			if (this.state.loading.articles && this.state.articles.length === 0) {
				return '<div class="gregory-loading">Loading articles...</div>';
			}

			if (this.state.articles.length === 0) {
				return '<div class="alert alert-info">No articles found for this category.</div>';
			}

			let html = '<div class="gregory-articles-list">';

			this.state.articles.forEach(article => {
				const badges = [];
				if (article.ml_prediction_gnb) badges.push('<span class="badge badge-success">ML Relevant</span>');
				if (article.discovery_prediction === 'Relevant') badges.push('<span class="badge badge-info">Discovery</span>');

				html += `
					<div class="gregory-article-item">
						<div class="gregory-article-header">
							<h6>
								<a href="${this.escapeHtml(article.link || '#')}" target="_blank" rel="noopener noreferrer">
									${this.escapeHtml(article.title || 'Untitled')}
								</a>
							</h6>
							${badges.length > 0 ? '<div class="gregory-article-badges">' + badges.join(' ') + '</div>' : ''}
						</div>
						${article.summary ? `<p class="gregory-article-summary">${this.escapeHtml(article.summary)}</p>` : ''}
						<div class="gregory-article-meta">
							<small class="text-muted">
								${article.journal_name ? `<strong>${this.escapeHtml(article.journal_name)}</strong> • ` : ''}
								${this.formatDate(article.published)}
								${article.relevance_score ? ` • Relevance: ${(article.relevance_score * 100).toFixed(0)}%` : ''}
							</small>
						</div>
					</div>
				`;
			});

			html += '</div>';

			if (this.state.articlesHasMore) {
				html += `
					<div class="gregory-load-more">
						<button
							class="btn btn-outline-primary"
							onclick="GregoryObservatory.loadArticles(${this.state.articlesPage + 1})"
							${this.state.loading.articles ? 'disabled' : ''}
						>
							${this.state.loading.articles ? 'Loading...' : 'Load More Articles'}
						</button>
					</div>
				`;
			}

			return html;
		},

		/**
		 * Render trials list
		 */
		renderTrials: function() {
			if (this.state.loading.trials && this.state.trials.length === 0) {
				return '<div class="gregory-loading">Loading trials...</div>';
			}

			if (this.state.trials.length === 0) {
				return '<div class="alert alert-info">No clinical trials found for this category.</div>';
			}

			let html = '<div class="gregory-trials-list">';

			this.state.trials.forEach(trial => {
				const statusBadge = trial.status ?
					`<span class="badge badge-${this.getTrialStatusColor(trial.status)}">${this.escapeHtml(trial.status)}</span>` : '';

				html += `
					<div class="gregory-trial-item">
						<div class="gregory-trial-header">
							<h6>
								<a href="${this.escapeHtml(trial.url || '#')}" target="_blank" rel="noopener noreferrer">
									${this.escapeHtml(trial.scientific_title || trial.public_title || 'Untitled')}
								</a>
							</h6>
							${statusBadge}
						</div>
						${trial.brief_summary ? `<p class="gregory-trial-summary">${this.escapeHtml(trial.brief_summary)}</p>` : ''}
						<div class="gregory-trial-meta">
							<small class="text-muted">
								${trial.recruitment_status ? `${this.escapeHtml(trial.recruitment_status)}` : ''}
								${trial.start_date ? ` • Started: ${this.formatDate(trial.start_date)}` : ''}
								${trial.primary_completion_date ? ` • Completion: ${this.formatDate(trial.primary_completion_date)}` : ''}
							</small>
						</div>
					</div>
				`;
			});

			html += '</div>';

			if (this.state.trialsHasMore) {
				html += `
					<div class="gregory-load-more">
						<button
							class="btn btn-outline-primary"
							onclick="GregoryObservatory.loadTrials(${this.state.trialsPage + 1})"
							${this.state.loading.trials ? 'disabled' : ''}
						>
							${this.state.loading.trials ? 'Loading...' : 'Load More Trials'}
						</button>
					</div>
				`;
			}

			return html;
		},

		/**
		 * Get color for trial status badge
		 */
		getTrialStatusColor: function(status) {
			const statusLower = (status || '').toLowerCase();
			if (statusLower.includes('recruiting') || statusLower.includes('active')) return 'success';
			if (statusLower.includes('completed')) return 'primary';
			if (statusLower.includes('terminated') || statusLower.includes('withdrawn')) return 'danger';
			return 'secondary';
		},

		/**
		 * Render error message
		 */
		renderError: function(message) {
			this.container.innerHTML = `
				<div class="gregory-observatory-widget">
					<div class="alert alert-danger">
						<strong>Error:</strong> ${message}
					</div>
				</div>
			`;
		},

		/**
		 * Main render function
		 */
		render: function() {
			if (!this.container) return;

			if (this.state.loading.category) {
				this.container.innerHTML = `
					<div class="gregory-observatory-widget">
						<div class="gregory-loading">
							<div class="spinner"></div>
							<p>Loading category...</p>
						</div>
					</div>
				`;
				return;
			}

			if (!this.state.category) return;

			const category = this.state.category;

			// Format description with line breaks
			let descriptionHtml = '';
			if (category.category_description) {
				descriptionHtml = this.escapeHtml(category.category_description)
					.replace(/\n/g, '<br>');
			}

			this.container.innerHTML = `
				<div class="gregory-observatory-widget">
					<!-- Header -->
					<div class="gregory-header">
						<h3 class="gregory-category-title">${this.escapeHtml(category.category_name)}</h3>
						${descriptionHtml ? `<p class="gregory-category-description">${descriptionHtml}</p>` : ''}
					</div>

					<!-- Navigation Tabs -->
					<ul class="gregory-tabs">
						<li class="gregory-tab ${this.state.activeTab === 'chart' ? 'active' : ''}"
							onclick="GregoryObservatory.changeTab('chart')">
							<span>📊</span> Overview
						</li>
						<li class="gregory-tab ${this.state.activeTab === 'articles' ? 'active' : ''}"
							onclick="GregoryObservatory.changeTab('articles')">
							<span>📄</span> Articles
						</li>
						<li class="gregory-tab ${this.state.activeTab === 'trials' ? 'active' : ''}"
							onclick="GregoryObservatory.changeTab('trials')">
							<span>🔬</span> Clinical Trials
						</li>
					</ul>

					<!-- Tab Content -->
					<div class="gregory-tab-content">
						${this.state.activeTab === 'chart' ?
							(this.state.loading.chart ?
								'<div class="gregory-loading">Loading chart...</div>' :
								this.renderChart()) :
							''}
						${this.state.activeTab === 'articles' ? this.renderArticles() : ''}
						${this.state.activeTab === 'trials' ? this.renderTrials() : ''}
					</div>

					<!-- Footer -->
					<div class="gregory-footer">
						<p>
							Powered by <a href="https://gregory-ms.com" target="_blank" rel="noopener noreferrer">Gregory MS</a>
						</p>
					</div>
				</div>
			`;
		}
	};

	// Expose to global scope
	window.GregoryObservatory = GregoryObservatory;

})(window);
