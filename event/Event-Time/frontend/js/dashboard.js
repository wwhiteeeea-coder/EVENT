/* ============================================
   Dashboard Handler
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!authUtils.isAuthenticated()) {
        authUtils.redirectToLogin();
        return;
    }

    // Get user data
    const userData = authUtils.getUserData();

    // Update user info in sidebar
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting && userData) {
        userGreeting.textContent = `Welcome, ${userData.firstName}!`;
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        console.log('Search query:', query);
        // Implement search logic here
    });

    // Location selector
    const locationSelect = document.getElementById('locationSelect');
    locationSelect?.addEventListener('change', function(e) {
        console.log('Location selected:', e.target.value);
        // Implement location filtering here
    });

    // Create Event buttons
    const createEventBtns = document.querySelectorAll('.btn-create-event, .btn-create-event-header');
    createEventBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'new.html';
        });
    });

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.href.includes('#')) {
                return;
            }
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn?.addEventListener('click', function() {
        console.log('Notifications clicked');
        // Implement notifications here
    });

    // User avatar menu
    const userAvatarHeader = document.querySelector('.user-avatar-header');
    userAvatarHeader?.addEventListener('click', function() {
        console.log('User menu clicked');
        // Implement user menu here
    });

    // Event cards - save button
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = this.textContent === '📌' ? '🔖' : '📌';
            this.style.opacity = this.textContent === '🔖' ? '1' : '0.5';
        });
    });

    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.querySelector('h3').textContent;
            if (category !== 'More') {
                console.log('Category selected:', category);
                // Implement category filtering
            }
        });
    });

    // Upcoming items - action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Event action clicked');
            // Implement event details navigation
        });
    });

    // Recommended items - favorite buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = this.textContent === '♡' ? '♥' : '♡';
            this.style.color = this.textContent === '♥' ? '#EF4444' : 'var(--text-muted)';
        });
    });

    // Calendar navigation
    const calendarNavBtns = document.querySelectorAll('.calendar-nav button');
    calendarNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Calendar navigation clicked');
            // Implement calendar navigation
        });
    });

    // Calendar day selection
    const calendarDays = document.querySelectorAll('.day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            calendarDays.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            console.log('Date selected:', this.textContent);
        });
    });

    // Logout function
    window.logout = function() {
        authUtils.clearAuthToken();
        authUtils.redirectToLogin();
    };

    // Load events from API
    async function loadEvents() {
        try {
            // Replace with actual API endpoint
            // const events = await authUtils.apiCall('/events');
            console.log('Loading events...');
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Load events on page load
    loadEvents();
});