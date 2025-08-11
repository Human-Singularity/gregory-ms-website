// Homepage Statistics Real-time Updates
document.addEventListener('DOMContentLoaded', function() {
    // Update statistics from Gregory-MS API
    updateHomepageStats();
});

async function updateHomepageStats() {
    const dbgEnabled = isDebugEnabled();
    dbg(dbgEnabled, 'Fetching homepage statistics...');
    
    // Fetch all data in parallel for better performance
    const promises = [
        fetchTrialsData(),
        fetchArticlesData(),
        fetchAuthorsData(),
        fetchDonationsData()
    ];
    
    // Wait for all promises to complete (but don't fail if one fails)
    await Promise.allSettled(promises);
    dbg(dbgEnabled, 'Homepage stats update complete');
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
        const dbgEnabled = isDebugEnabled();
        console.time('fetchDonationsData');
        dbg(dbgEnabled, 'Starting donations fetch to https://stripe-transparency.dash-tech-daf.workers.dev');
        const response = await Promise.race([
            fetch('https://stripe-transparency.dash-tech-daf.workers.dev'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        dbg(dbgEnabled, 'Donations fetch response', { ok: response.ok, status: response.status });
        if (response.ok) {
            const data = await response.json();
            dbg(dbgEnabled, 'Donations payload', data);
            const currentYear = data.current_year || null;
            const totalAmount = (currentYear && typeof currentYear.total_amount !== 'undefined')
                ? currentYear.total_amount
                : (typeof data.total_amount_paid !== 'undefined' ? data.total_amount_paid : 270);
            const goalAmount = 500;
            const percentage = Math.round(Math.min((totalAmount / goalAmount) * 100, 100));
            
            updateDonationCard(totalAmount, goalAmount, percentage);
            dbg(dbgEnabled, 'Donations updated', { totalAmount, goalAmount, percentage, usedCurrentYear: !!currentYear });
            if (!currentYear) {
                console.warn('[HomepageStats] Donations payload missing current_year; falling back to total_amount_paid');
            } else if (typeof currentYear.total_amount === 'undefined') {
                console.warn('[HomepageStats] current_year object missing total_amount');
            }
            console.timeEnd('fetchDonationsData');
        } else {
            console.warn('[HomepageStats] Donations fetch returned non-OK status', response.status);
        }
    } catch (error) {
        console.error('[HomepageStats] Donations fetch error', error);
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
    const dbgEnabled = isDebugEnabled();
    dbg(dbgEnabled, 'Updating donation UI', { totalAmount, goalAmount, percentage });
    // Update donation amount
    const donationElement = document.getElementById('donation-amount');
    if (donationElement) {
        donationElement.textContent = `€${totalAmount} Raised`;
    } else {
        console.warn('[HomepageStats] donation-amount element not found');
    }
    
    // Update goal text
    const goalElement = document.getElementById('donation-goal');
    if (goalElement) {
        if (percentage >= 100) {
            goalElement.textContent = `Goal reached! €${totalAmount} of €${goalAmount} (${percentage}%)`;
        } else {
            goalElement.textContent = `of €${goalAmount} goal (${percentage}%)`;
        }
    } else {
        console.warn('[HomepageStats] donation-goal element not found');
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
        dbg(dbgEnabled, 'Progress bar updated');
    } else {
        console.warn('[HomepageStats] donation-progress element not found');
    }
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}

// Debug helpers
function isDebugEnabled() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.has('debug') && (params.get('debug') === '1' || params.get('debug') === 'true')) return true;
        const stored = window.localStorage ? localStorage.getItem('gregoryDebug') : null;
        return stored === '1' || stored === 'true';
    } catch (e) {
        return false;
    }
}

function dbg(enabled, ...args) {
    if (!enabled) return;
    const ts = new Date().toISOString();
    console.log('[HomepageStats]', ts, ...args);
}
