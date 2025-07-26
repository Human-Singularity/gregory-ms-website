/**
 * Donations Dashboard JavaScript
 * Handles progress bar updates and recent donations list
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Donations dashboard loading...');
    
    // API endpoint for donation data
    const API_URL = 'https://stripe-transparency.dash-tech-daf.workers.dev';
    const GOAL_AMOUNT = 500; // €500 goal for 2025
    
    // Loading states
    const loadingElement = document.getElementById('recent-donations-loading');
    const listElement = document.getElementById('recent-donations-list');
    const errorElement = document.getElementById('recent-donations-error');
    
    // Progress bar elements
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const goalPercentage = document.getElementById('goal-percentage');

    console.log('Elements found:', {
        loadingElement: !!loadingElement,
        listElement: !!listElement,
        errorElement: !!errorElement,
        progressBar: !!progressBar,
        progressText: !!progressText,
        goalPercentage: !!goalPercentage
    });

    async function fetchDonationData() {
        console.log('Fetching donation data from:', API_URL);
        try {
            const response = await fetch(API_URL);
            console.log('API response status:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch donation data');
            }
            const data = await response.json();
            console.log('API data received:', data);
            
            // Update progress bar
            updateProgressBar(data.current_year?.total_amount || 0);
            
            // Update recent donations list
            updateRecentDonations(data.recent || []);
            
        } catch (error) {
            console.error('Error fetching donation data:', error);
            showError();
        }
    }

    function updateProgressBar(currentAmount) {
        const percentage = Math.min((currentAmount / GOAL_AMOUNT) * 100, 100);
        const roundedPercentage = Math.round(percentage);
        
        // Update progress bar
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', currentAmount);
        
        // Update text
        progressText.textContent = `€${currentAmount} / €${GOAL_AMOUNT}`;
        goalPercentage.textContent = `${roundedPercentage}%`;
        
        // Change color based on progress
        progressBar.className = 'progress-bar fw-bold';
        if (percentage >= 100) {
            progressBar.classList.add('bg-gradient-success');
        } else if (percentage >= 75) {
            progressBar.classList.add('bg-gradient-info');
        } else if (percentage >= 50) {
            progressBar.classList.add('bg-gradient-warning');
        } else {
            progressBar.classList.add('bg-gradient-primary');
        }
    }

    function updateRecentDonations(donations) {
        console.log('Updating recent donations with:', donations);
        // Hide loading, show list
        loadingElement.classList.add('d-none');
        listElement.classList.remove('d-none');
        
        if (!donations || donations.length === 0) {
            listElement.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No recent donations to display.</p>
                    <p class="text-muted small">Be the first to support Gregory-MS!</p>
                </div>
            `;
            return;
        }

        // Take only the 10 most recent
        const recentDonations = donations.slice(0, 10);
        
        let html = '<div class="list-group list-group-flush">';
        
        recentDonations.forEach((donation, index) => {
            console.log('Processing donation:', donation);
            const date = new Date(donation.charge_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Use initials or "Anonymous" for privacy
            const donorName = donation.name || 'Anonymous Supporter';
            const amount = parseFloat(donation.amount_paid).toFixed(2);
            console.log('Parsed amount:', amount, 'from amount_paid:', donation.amount_paid);
            
            html += `
                <div class="list-group-item border-0 px-0 py-3 ${index === 0 ? 'border-top' : ''}">
                    <div class="row align-items-center">
                        <div class="col-auto">
                            <div class="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                <i class="fas fa-heart"></i>
                            </div>
                        </div>
                        <div class="col">
                            <h6 class="mb-1">${escapeHtml(donorName)}</h6>
                            <p class="text-muted small mb-0">
                                <i class="fas fa-calendar-alt me-1"></i> ${formattedDate}
                            </p>
                        </div>
                        <div class="col-auto">
                            <span class="badge bg-success fs-6">€${amount}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add thank you message
        html += `
            <div class="text-center mt-4 pt-3 border-top">
                <p class="text-muted small mb-0">
                    <i class="fas fa-heart text-danger me-1"></i>
                    Thank you to all our supporters who make Gregory-MS possible!
                </p>
            </div>
        `;
        
        listElement.innerHTML = html;
    }

    function showError() {
        loadingElement.classList.add('d-none');
        errorElement.classList.remove('d-none');
        
        // Set default progress (fallback)
        updateProgressBar(0);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize the dashboard
    fetchDonationData();
});
