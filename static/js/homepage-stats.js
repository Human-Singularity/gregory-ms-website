// Homepage Statistics Real-time Updates
document.addEventListener('DOMContentLoaded', function() {
    // Update statistics from Gregory-MS API
    updateHomepageStats();
});

async function updateHomepageStats() {
    try {
        // Fetch trials data
        const trialsResponse = await Promise.race([
            fetch('https://api.gregory-ms.com/trials/'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (trialsResponse.ok) {
            const trialsData = await trialsResponse.json();
            const trialsCount = trialsData.count || 5271; // Fallback to current value
            updateStatCard('trials-count', formatNumber(trialsCount));
        }
    } catch (error) {
        console.log('Using fallback for trials count');
        updateStatCard('trials-count', '5,271');
    }

    try {
        // Fetch articles data
        const articlesResponse = await Promise.race([
            fetch('https://api.gregory-ms.com/articles/'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            const articlesCount = articlesData.count || 33592; // Fallback to current value
            updateStatCard('articles-count', formatNumber(articlesCount));
        }
    } catch (error) {
        console.log('Using fallback for articles count');
        updateStatCard('articles-count', '33,592');
    }

    try {
        // Fetch authors data
        const authorsResponse = await Promise.race([
            fetch('https://api.gregory-ms.com/authors/by_team_subject/?format=json&subject_id=1&team_id=1'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (authorsResponse.ok) {
            const authorsData = await authorsResponse.json();
            const authorsCount = authorsData.count || 171297; // Use count field, fallback to latest known value
            updateStatCard('authors-count', formatNumber(authorsCount));
        }
    } catch (error) {
        console.log('Using fallback for authors count');
        updateStatCard('authors-count', '171,297');
    }

    try {
        // Fetch donations data from Stripe API
        const donationsResponse = await Promise.race([
            fetch('https://stripe-transparency.dash-tech-daf.workers.dev/'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (donationsResponse.ok) {
            const donationsData = await donationsResponse.json();
            const totalAmount = donationsData.total_amount_paid || 270; // Fallback to current value
            const goalAmount = 500;
            const percentage = Math.round((totalAmount / goalAmount) * 100);
            
            updateDonationCard(totalAmount, goalAmount, percentage);
        }
    } catch (error) {
        console.log('Using fallback for donations data');
        updateDonationCard(270, 500, 54);
    }
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Add a subtle animation when updating
        element.style.transition = 'all 0.3s ease';
        element.textContent = value;
        
        // Brief highlight effect
        element.style.color = '#28a745';
        setTimeout(() => {
            element.style.color = '';
        }, 1000);
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
        goalElement.textContent = `of €${goalAmount} goal (${percentage}%)`;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('donation-progress');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        progressBar.style.transition = 'width 0.8s ease-in-out';
    }
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}
