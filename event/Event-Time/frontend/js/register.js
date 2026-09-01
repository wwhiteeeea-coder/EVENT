/* ============================================
   Register Form Handler
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const termsCheckbox = document.getElementById('terms');
    const googleBtn = document.getElementById('googleBtn');
    const githubBtn = document.getElementById('githubBtn');

    // First Name validation
    firstNameInput?.addEventListener('blur', function() {
        if (this.value && this.value.length < 2) {
            authUtils.setFieldError('firstName', 'First name must be at least 2 characters');
        } else if (this.value) {
            authUtils.setFieldSuccess('firstName');
        }
    });

    firstNameInput?.addEventListener('input', function() {
        if (this.value.length >= 2) {
            authUtils.setFieldSuccess('firstName');
        }
    });

    // Last Name validation
    lastNameInput?.addEventListener('blur', function() {
        if (this.value && this.value.length < 2) {
            authUtils.setFieldError('lastName', 'Last name must be at least 2 characters');
        } else if (this.value) {
            authUtils.setFieldSuccess('lastName');
        }
    });

    lastNameInput?.addEventListener('input', function() {
        if (this.value.length >= 2) {
            authUtils.setFieldSuccess('lastName');
        }
    });

    // Email validation
    emailInput?.addEventListener('blur', function() {
        if (this.value && !authUtils.validateEmail(this.value)) {
            authUtils.setFieldError('email', 'Please enter a valid email address');
        } else if (this.value) {
            authUtils.setFieldSuccess('email');
        }
    });

    emailInput?.addEventListener('input', function() {
        if (this.value && authUtils.validateEmail(this.value)) {
            authUtils.setFieldSuccess('email');
        } else {
            const formGroup = this.closest('.form-group');
            formGroup.classList.remove('success', 'error');
        }
    });

    // Phone validation
    phoneInput?.addEventListener('blur', function() {
        if (this.value && !authUtils.validatePhone(this.value)) {
            authUtils.setFieldError('phone', 'Please enter a valid phone number');
        } else if (this.value) {
            authUtils.setFieldSuccess('phone');
        }
    });

    phoneInput?.addEventListener('input', function() {
        if (this.value && authUtils.validatePhone(this.value)) {
            authUtils.setFieldSuccess('phone');
        } else {
            const formGroup = this.closest('.form-group');
            formGroup.classList.remove('success', 'error');
        }
    });

    // Password validation
    passwordInput?.addEventListener('input', function() {
        const strength = authUtils.checkPasswordStrength(this.value);
        if (this.value.length >= 8 && strength >= 2) {
            authUtils.setFieldSuccess('password');
        } else if (this.value) {
            const formGroup = this.closest('.form-group');
            formGroup.classList.remove('success', 'error');
        }
    });

    passwordInput?.addEventListener('blur', function() {
        if (this.value && this.value.length < 8) {
            authUtils.setFieldError('password', 'Password must be at least 8 characters');
        } else if (this.value && authUtils.checkPasswordStrength(this.value) < 2) {
            authUtils.setFieldError('password', 'Password must include uppercase, lowercase, and numbers');
        }
    });

    // Confirm Password validation
    passwordConfirmInput?.addEventListener('input', function() {
        if (this.value === passwordInput.value && this.value) {
            authUtils.setFieldSuccess('passwordConfirm');
        } else if (this.value) {
            const formGroup = this.closest('.form-group');
            formGroup.classList.remove('success', 'error');
        }
    });

    passwordConfirmInput?.addEventListener('blur', function() {
        if (this.value && this.value !== passwordInput.value) {
            authUtils.setFieldError('passwordConfirm', 'Passwords do not match');
        }
    });

    // Form submission
    registerForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        authUtils.clearAllErrors('registerForm');
        
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;
        const termsAccepted = termsCheckbox.checked;

        let hasError = false;

        // Validation
        if (!firstName || firstName.length < 2) {
            authUtils.setFieldError('firstName', 'First name must be at least 2 characters');
            hasError = true;
        }

        if (!lastName || lastName.length < 2) {
            authUtils.setFieldError('lastName', 'Last name must be at least 2 characters');
            hasError = true;
        }

        if (!email || !authUtils.validateEmail(email)) {
            authUtils.setFieldError('email', 'Please enter a valid email');
            hasError = true;
        }

        if (!phone || !authUtils.validatePhone(phone)) {
            authUtils.setFieldError('phone', 'Please enter a valid phone number');
            hasError = true;
        }

        if (!password || password.length < 8) {
            authUtils.setFieldError('password', 'Password must be at least 8 characters');
            hasError = true;
        } else if (authUtils.checkPasswordStrength(password) < 2) {
            authUtils.setFieldError('password', 'Password must include uppercase, lowercase, and numbers');
            hasError = true;
        }

        if (!passwordConfirm || passwordConfirm !== password) {
            authUtils.setFieldError('passwordConfirm', 'Passwords do not match');
            hasError = true;
        }

        if (!termsAccepted) {
            authUtils.showError('errorMessage', 'You must accept the Terms of Service');
            hasError = true;
        }

        if (hasError) return;

        // Submit registration
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        authUtils.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call - replace with actual backend call
            const response = await authUtils.apiCall('/auth/register', 'POST', {
                firstName,
                lastName,
                email,
                phone,
                password
            });

            authUtils.storeAuthToken(response.token);
            authUtils.storeUserData(response.user);
            
            authUtils.showSuccess('successMessage', 'Registration successful! Redirecting...');
            
            setTimeout(() => {
                authUtils.redirectToDashboard();
            }, 1500);

        } catch (error) {
            authUtils.showError('errorMessage', error.message || 'Registration failed. Please try again.');
            console.error('Registration error:', error);
        } finally {
            authUtils.setButtonLoading(submitBtn, false);
        }
    });

    // Google signup
    googleBtn?.addEventListener('click', async function() {
        authUtils.setButtonLoading(this, true);
        try {
            // Implement Google OAuth here
            console.log('Google signup clicked');
            authUtils.showError('errorMessage', 'Google signup coming soon');
        } finally {
            authUtils.setButtonLoading(this, false);
        }
    });

    // GitHub signup
    githubBtn?.addEventListener('click', async function() {
        authUtils.setButtonLoading(this, true);
        try {
            // Implement GitHub OAuth here
            console.log('GitHub signup clicked');
            authUtils.showError('errorMessage', 'GitHub signup coming soon');
        } finally {
            authUtils.setButtonLoading(this, false);
        }
    });

    // Check if already authenticated
    if (authUtils.isAuthenticated()) {
        authUtils.redirectToDashboard();
    }
});