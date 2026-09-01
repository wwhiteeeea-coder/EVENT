/* ============================================
   Login Form Handler
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const googleBtn = document.getElementById('googleBtn');
    const githubBtn = document.getElementById('githubBtn');

    // Email validation on blur
    emailInput?.addEventListener('blur', function() {
        if (this.value && !authUtils.validateEmail(this.value)) {
            authUtils.setFieldError('email', 'Please enter a valid email address');
        } else if (this.value) {
            authUtils.setFieldSuccess('email');
        }
    });

    // Real-time validation as user types
    emailInput?.addEventListener('input', function() {
        const formGroup = this.closest('.form-group');
        if (this.value && authUtils.validateEmail(this.value)) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
        } else {
            formGroup.classList.remove('success', 'error');
        }
    });

    passwordInput?.addEventListener('input', function() {
        if (this.value.length >= 8) {
            authUtils.setFieldSuccess('password');
        }
    });

    // Form submission
    loginForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        authUtils.clearAllErrors('loginForm');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        let hasError = false;

        // Validation
        if (!email) {
            authUtils.setFieldError('email', 'Email is required');
            hasError = true;
        } else if (!authUtils.validateEmail(email)) {
            authUtils.setFieldError('email', 'Please enter a valid email');
            hasError = true;
        }

        if (!password) {
            authUtils.setFieldError('password', 'Password is required');
            hasError = true;
        } else if (password.length < 6) {
            authUtils.setFieldError('password', 'Password must be at least 6 characters');
            hasError = true;
        }

        if (hasError) return;

        // Submit login
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        authUtils.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call - replace with actual backend call
            const response = await authUtils.apiCall('/auth/login', 'POST', {
                email,
                password
            });

            authUtils.storeAuthToken(response.token);
            authUtils.storeUserData(response.user);
            
            authUtils.showSuccess('successMessage', 'Login successful! Redirecting...');
            
            setTimeout(() => {
                authUtils.redirectToDashboard();
            }, 1500);

        } catch (error) {
            authUtils.showError('errorMessage', error.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', error);
        } finally {
            authUtils.setButtonLoading(submitBtn, false);
        }
    });

    // Google login
    googleBtn?.addEventListener('click', async function() {
        authUtils.setButtonLoading(this, true);
        try {
            // Implement Google OAuth here
            console.log('Google login clicked');
            authUtils.showError('errorMessage', 'Google login coming soon');
        } finally {
            authUtils.setButtonLoading(this, false);
        }
    });

    // GitHub login
    githubBtn?.addEventListener('click', async function() {
        authUtils.setButtonLoading(this, true);
        try {
            // Implement GitHub OAuth here
            console.log('GitHub login clicked');
            authUtils.showError('errorMessage', 'GitHub login coming soon');
        } finally {
            authUtils.setButtonLoading(this, false);
        }
    });

    // Check if already authenticated
    if (authUtils.isAuthenticated()) {
        authUtils.redirectToDashboard();
    }
});