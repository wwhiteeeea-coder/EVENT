/* ============================================
   Form Validation & Utility Functions
   ============================================ */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
}

// Validate email
function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Show error message
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = message;
        container.classList.add('show');
        setTimeout(() => {
            container.classList.remove('show');
        }, 5000);
    }
}

// Show success message
function showSuccess(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.textContent = message;
        container.classList.add('show');
        setTimeout(() => {
            container.classList.remove('show');
        }, 5000);
    }
}

// Clear all errors
function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
            group.querySelector('.form-error').textContent = '';
        });
    }
}

// Set field error
function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        formGroup.querySelector('.form-error').textContent = message;
    }
}

// Set field success
function setFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        formGroup.querySelector('.form-error').textContent = '';
    }
}

// Toggle button loading state
function setButtonLoading(buttonElement, isLoading) {
    if (isLoading) {
        buttonElement.classList.add('loading');
        buttonElement.disabled = true;
    } else {
        buttonElement.classList.remove('loading');
        buttonElement.disabled = false;
    }
}

// Store auth token
function storeAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Clear auth token
function clearAuthToken() {
    localStorage.removeItem('authToken');
}

// Store user data
function storeUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Get user data
function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

// Check if user is authenticated
function isAuthenticated() {
    return getAuthToken() !== null;
}

// Redirect to dashboard
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

// Redirect to login
function redirectToLogin() {
    window.location.href = 'login.html';
}

// API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`/api${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export functions for use in other files
window.authUtils = {
    validateEmail,
    validatePhone,
    checkPasswordStrength,
    showError,
    showSuccess,
    clearAllErrors,
    setFieldError,
    setFieldSuccess,
    setButtonLoading,
    storeAuthToken,
    getAuthToken,
    clearAuthToken,
    storeUserData,
    getUserData,
    isAuthenticated,
    redirectToDashboard,
    redirectToLogin,
    apiCall
};