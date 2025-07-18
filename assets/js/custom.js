window.onload = function() {
    // make navigation change color
    var img = document.createElement('img');
    var src = document.querySelector('.page-header-image')?.style.backgroundImage.slice(4, -1).replace(/"/g, "");
    if (src) {
        img.setAttribute('src', src)
        img.addEventListener('load', function() {
            var vibrant = new Vibrant(img);
            var swatches = vibrant.swatches()
            let nav = document.querySelector('nav.bg-dynamic')
            if (nav !== null) {
                nav.style.cssText = `background-color:${swatches["Vibrant"].getHex()}`
            }
        });
    } else {
        const navElement = document.querySelector('nav.bg-dynamic');
        if (navElement) {
            navElement.classList.add('bg-primary');
            navElement.classList.remove('navbar-transparent');
            navElement.classList.remove('bg-dynamic');
        }        
    }
    
    // Handle anchor scrolling with offset for fixed navbar
    handleAnchorScrolling();
};

// Function to handle anchor scrolling with offset for fixed navbar
function handleAnchorScrolling() {
    // Add smooth scrolling to all links with hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Don't handle empty anchors or javascript: links
            if (this.getAttribute('href') === '#' || this.getAttribute('href').startsWith('javascript:')) {
                return;
            }
            
            // Prevent default anchor behavior
            e.preventDefault();
            
            // Get the target element from the href
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Get navbar height to use as offset (add a little extra padding)
                const navbar = document.querySelector('.navbar.fixed-top');
                const navbarHeight = navbar ? navbar.offsetHeight + 20 : 20;
                
                // Calculate position to scroll to (element position - navbar height)
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle direct anchor links when page loads
    if (window.location.hash) {
        setTimeout(function() {
            // Get the target element from the hash
            const target = document.querySelector(window.location.hash);
            
            if (target) {
                // Get navbar height to use as offset
                const navbar = document.querySelector('.navbar.fixed-top');
                const navbarHeight = navbar ? navbar.offsetHeight + 20 : 20;
                
                // Calculate position to scroll to (element position - navbar height)
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 300); // Short delay to ensure page is fully loaded
    }
}