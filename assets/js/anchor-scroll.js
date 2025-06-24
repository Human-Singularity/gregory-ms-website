// Script to handle anchor scrolling with offset for fixed navbar
document.addEventListener('DOMContentLoaded', function() {
  // Add smooth scrolling to all links with hash
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      // Prevent default anchor behavior
      e.preventDefault();
      
      // Get the target element from the href
      const target = document.querySelector(this.getAttribute('href'));
      
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
  window.addEventListener('load', function() {
    // Check if URL contains a hash
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
  });
});
