// ================================
// Event Next Door API
// ================================

const API_BASE_URL = "http://localhost:5000";

// ================================
// Token Helpers
// ================================

function setToken(token) {
    localStorage.setItem("authToken", token);
}

function getToken() {
    return localStorage.getItem("authToken");
}

function removeToken() {
    localStorage.removeItem("authToken");
}

// Plain JSON headers — used for register/login where no token exists yet
function getJsonHeaders() {
    return {
        "Content-Type": "application/json"
    };
}

// Authenticated headers — used for requests that require a logged-in user
function getAuthHeaders() {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// ================================
// REGISTER
// ================================
// FIX: signature now matches the 4 arguments register.js actually sends
// (fullName, email, phone, password). Previously "phone" was missing,
// which shifted "password" into the wrong slot.
async function register(fullName, email, phone, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: getJsonHeaders(),
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password
            })
        });

        const data = await response.json();

        // If email confirmation is off, Supabase returns a session
        // immediately — log the user in right away in that case.
        if (data.success && data.token) {
            setToken(data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        return data;

    } catch (error) {
        return {
            success: false,
            message: "Could not reach the server. Please check your connection and try again."
        };
    }
}

// ================================
// LOGIN
// ================================

async function login(email, password) {

    try {

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {

            method: "POST",

            headers: getJsonHeaders(),

            body: JSON.stringify({

                email,

                password

            })

        });

        const data = await response.json();

        if (data.success) {

            if (data.token) {
                setToken(data.token);
            }

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

        }

        return data;

    } catch (error) {

        return {

            success: false,

            message: "Could not reach the server. Please check your connection and try again."

        };

    }

}

// ================================
// LOGOUT
// ================================

function logout() {

    removeToken();

    localStorage.removeItem("user");

}

// ================================
// GET PROFILE
// ================================

async function getProfile() {

    try {

        const response = await fetch(

            `${API_BASE_URL}/api/auth/profile`,

            {

                method: "GET",

                headers: getAuthHeaders()

            }

        );

        return await response.json();

    } catch (error) {

        return {

            success: false,

            message: "Could not reach the server. Please check your connection and try again."

        };

    }

}

// ================================
// AUTH CHECK
// ================================

function isAuthenticated() {

    return localStorage.getItem("user") !== null;

}

// ================================
// CURRENT USER
// ================================

function getCurrentUser() {

    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;

}

// ================================
// EXPORT
// ================================

const AuthAPI = {

    register,

    login,

    logout,

    getProfile,

    isAuthenticated,

    getCurrentUser

};

// ================================
// EVENTS
// ================================

async function getAllEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/events`, {
            method: "GET",
            headers: getJsonHeaders()
        });

        return await response.json();

    } catch (error) {
        return {
            success: false,
            message: "Could not reach the server. Please check your connection and try again."
        };
    }
}

async function getEventById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
            method: "GET",
            headers: getJsonHeaders()
        });

        return await response.json();

    } catch (error) {
        return {
            success: false,
            message: "Could not reach the server. Please check your connection and try again."
        };
    }
}

const EventsAPI = {
    getAllEvents,
    getEventById
};

// ================================
// BOOKINGS
// ================================

async function createBooking(eventId, tierId, quantity) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                event_id: eventId,
                tier_id: tierId,
                quantity
            })
        });

        return await response.json();

    } catch (error) {
        return {
            success: false,
            message: "Could not reach the server. Please check your connection and try again."
        };
    }
}

async function getMyBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        return await response.json();

    } catch (error) {
        return {
            success: false,
            message: "Could not reach the server. Please check your connection and try again."
        };
    }
}

async function cancelBooking(bookingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
            method: "PUT",
            headers: getAuthHeaders()
        });

        return await response.json();

    } catch (error) {
        return {
            success: false,
            message: "Could not reach the server. Please check your connection and try again."
        };
    }
}

const BookingsAPI = {
    createBooking,
    getMyBookings,
    cancelBooking
};