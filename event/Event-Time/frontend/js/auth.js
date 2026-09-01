/* ============================================
   Form Validation & Utility Functions
   Updated: API base URL and improved apiCall handling
   ============================================ */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// API base - frontend can override by setting window.API_BASE_URL before scripts load
const API_BASE = window.API_BASE_URL || (window.location.origin.includes('http') ? window.location.origin : 'http://localhost:3000');

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
            const err = group.querySelector('.form-error');
            if (err) err.textContent = '';
        });
    }
}

// Set field error
function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        const err = formGroup.querySelector('.form-error');
        if (err) err.textContent = message;
    }
}

// Set field success
function setFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        const err = formGroup.querySelector('.form-error');
        if (err) err.textContent = '';
    }
}

// Toggle button loading state
function setButtonLoading(buttonElement, isLoading) {
    if (!buttonElement) return;
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

// API call helper - uses API_BASE and includes Authorization header when token exists
async function apiCall(endpoint, method = 'GET', data = null, raw = false) {
    const url = `${API_BASE}/api${endpoint}`;
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        // If unauthorized, clear token and redirect to login
        if (response.status === 401 || response.status === 403) {
            clearAuthToken();
            // if current page isn't login, redirect
            if (!window.location.pathname.includes('login')) {
                redirectToLogin();
            }
            throw new Error('Unauthorized');
        }

        // 204 No Content
        if (response.status === 204) return {};

        const text = await response.text();
        const json = text ? JSON.parse(text) : {};

        if (!response.ok) {
            const message = (json && json.message) ? json.message : `HTTP ${response.status}`;
            throw new Error(message);
        }

        return raw ? text : json;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export functions for use in other files
window.authUtils = {
    API_BASE,
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
