document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
  
    navbar.addEventListener('click', (event) => {
      const target = event.target.closest('a.nav-link');
      if (target) {
        event.preventDefault();
        const activeTab = document.querySelector('.nav-link.active');
        if (activeTab) {
            // Remove active class from previous active tab
            activeTab.classList.remove('active');
        }
        // Add active class to clicked tab
        target.classList.add('active'); 
        // Log a message to verify the active class addition
        console.log('active class added');
      }
    });
  });