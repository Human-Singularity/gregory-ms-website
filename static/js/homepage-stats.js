// Homepage Statistics Real-time Updates
document.addEventListener('DOMContentLoaded', function() {
    // Update statistics from Gregory-MS API
    updateHomepageStats();
});

async function updateHomepageStats() {
    console.log('Fetching homepage statistics...');
    
    // Fetch all data in parallel for better performance
    const promises = [
        fetchTrialsData(),
        fetchArticlesData(),
        fetchAuthorsData(),
        fetchDonationsData()
    ];
    
    // Wait for all promises to complete (but don't fail if one fails)
    await Promise.allSettled(promises);
    console.log('Homepage stats update complete');
}

async function fetchTrialsData() {
    try {
        const response = await Promise.race([
            fetch('https://api.gregory-ms.com/trials/?team_id=1&subject_id=1&format=json'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (response.ok) {
            const data = await response.json();
            const count = data.count || 5271;
            updateStatCard('trials-count', formatNumber(count));
            console.log('Trials count updated:', count);
        }
    } catch (error) {
        console.log('Using fallback for trials count:', error.message);
        updateStatCard('trials-count', '5,271');
    }
}

async function fetchArticlesData() {
    try {
        const response = await Promise.race([
            fetch('https://api.gregory-ms.com/articles/?team_id=1&subject_id=1&format=json'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (response.ok) {
            const data = await response.json();
            const count = data.count || 33592;
            updateStatCard('articles-count', formatNumber(count));
            console.log('Articles count updated:', count);
        }
    } catch (error) {
        console.log('Using fallback for articles count:', error.message);
        updateStatCard('articles-count', '33,592');
    }
}

async function fetchAuthorsData() {
    try {
        const response = await Promise.race([
            fetch('https://api.gregory-ms.com/authors/by_team_subject/?format=json&subject_id=1&team_id=1'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (response.ok) {
            const data = await response.json();
            const count = data.count || 171297;
            updateStatCard('authors-count', formatNumber(count));
            console.log('Authors count updated:', count);
        }
    } catch (error) {
        console.log('Using fallback for authors count:', error.message);
        updateStatCard('authors-count', '171,297');
    }
}

async function fetchDonationsData() {
    try {
        const response = await Promise.race([
            fetch('https://stripe-transparency.dash-tech-daf.workers.dev'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (response.ok) {
            const data = await response.json();
            const totalAmount = data.current_year?.total_amount || data.total_amount_paid || 270;
            const goalAmount = 500;
            const percentage = Math.round(Math.min((totalAmount / goalAmount) * 100, 100));
            
            updateDonationCard(totalAmount, goalAmount, percentage);
            console.log('Donations updated:', totalAmount, 'Goal:', goalAmount, 'Percentage:', percentage);
        }
    } catch (error) {
        console.log('Using fallback for donations data:', error.message);
        updateDonationCard(270, 500, 54);
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add a subtle animation when updating
        element.style.transition = 'all 0.3s ease';
        
        // If it was showing "Loading...", add a success color briefly
        if (element.textContent === 'Loading...') {
            element.style.color = '#28a745';
            setTimeout(() => {
                element.style.color = '';
            }, 1500);
        }
        
        element.textContent = value;
    }
}

function updateDonationCard(totalAmount, goalAmount, percentage) {
    // Update donation amount
    const donationElement = document.getElementById('donation-amount');
    if (donationElement) {
        donationElement.textContent = `€${totalAmount} Raised`;
    }
    
    // Update goal text
    const goalElement = document.getElementById('donation-goal');
    if (goalElement) {
        if (percentage >= 100) {
            goalElement.textContent = `Goal reached! €${totalAmount} of €${goalAmount} (${percentage}%)`;
        } else {
            goalElement.textContent = `of €${goalAmount} goal (${percentage}%)`;
        }
    }
    
    // Update progress bar
    const progressBar = document.getElementById('donation-progress');
    if (progressBar) {
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
        progressBar.style.transition = 'width 0.8s ease-in-out';
        
        // Update progress bar color based on percentage
        progressBar.className = 'progress-bar';
        if (percentage >= 100) {
            progressBar.classList.add('bg-success');
        } else if (percentage >= 75) {
            progressBar.classList.add('bg-info');
        } else if (percentage >= 50) {
            progressBar.classList.add('bg-warning');
        } else {
            progressBar.classList.add('bg-success');
        }
    }
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}
