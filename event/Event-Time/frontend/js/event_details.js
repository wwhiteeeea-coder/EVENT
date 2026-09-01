// ======================================
// Event Next Door - Event Details + Booking Script
// ======================================

let currentEvent = null;
let selectedTierId = null;

document.addEventListener("DOMContentLoaded", () => {
    const eventId = getEventIdFromUrl();

    if (!eventId) {
        renderError("No event was specified.");
        return;
    }

    loadEvent(eventId);
});

function getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadEvent(id) {
    const response = await EventsAPI.getEventById(id);

    if (!response.success) {
        renderError(response.message || "Could not load this event.");
        return;
    }

    currentEvent = response.event;
    renderEventDetails(currentEvent);
}

function renderError(message) {
    const container = document.getElementById("eventDetailsContainer");
    if (!container) return;
    container.innerHTML = `<p class="events-status events-error">${escapeHtml(message)}</p>`;
}

function renderEventDetails(event) {
    const container = document.getElementById("eventDetailsContainer");
    if (!container) return;

    const imageUrl = event.image || "https://placehold.co/800x500?text=Event";
    const dateLabel = formatDate(event.date);
    const tiers = event.tiers || [];

    container.innerHTML = `
        <div class="event-details-hero">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(event.title)}">
        </div>

        <div class="event-details-body">
            <div class="event-details-info">
                ${event.category ? `<span class="event-category-pill">${escapeHtml(event.category)}</span>` : ""}
                <h1>${escapeHtml(event.title)}</h1>
                <p class="event-details-meta">${dateLabel}${event.location ? " · " + escapeHtml(event.location) : ""}</p>
                ${event.description ? `<p class="event-details-description">${escapeHtml(event.description)}</p>` : ""}
            </div>

            <div class="booking-panel">
                <h2>Book Tickets</h2>
                <div id="formError" class="booking-form-error"></div>
                ${tiers.length > 0 ? buildBookingForm(tiers) : `<p class="events-status">No tickets are available for this event yet.</p>`}
            </div>
        </div>
    `;

    if (tiers.length > 0) {
        attachBookingHandlers(tiers);
    }
}

function buildBookingForm(tiers) {
    const tierOptions = tiers.map((t) => {
        const soldOut = t.available <= 0;
        return `
            <label class="tier-option ${soldOut ? "tier-sold-out" : ""}">
                <input
                    type="radio"
                    name="tier"
                    value="${t.id}"
                    data-price="${t.price}"
                    data-available="${t.available}"
                    ${soldOut ? "disabled" : ""}
                >
                <span class="tier-name">${escapeHtml(t.name)}</span>
                <span class="tier-price">KSh ${Number(t.price).toLocaleString()}</span>
                <span class="tier-availability">${soldOut ? "Sold out" : t.available + " left"}</span>
            </label>
        `;
    }).join("");

    return `
        <form id="bookingForm">
            <div class="tier-list">
                ${tierOptions}
            </div>

            <div class="quantity-row">
                <label for="quantityInput">Quantity</label>
                <input type="number" id="quantityInput" min="1" value="1">
            </div>

            <div class="booking-total">
                <span>Total</span>
                <span id="totalPrice">KSh 0</span>
            </div>

            <button type="submit" class="view-event-btn booking-submit-btn">Confirm Booking</button>
        </form>
    `;
}

function attachBookingHandlers(tiers) {
    const form = document.getElementById("bookingForm");
    const quantityInput = document.getElementById("quantityInput");
    const tierInputs = form.querySelectorAll('input[name="tier"]');

    const updateTotal = () => {
        const selected = form.querySelector('input[name="tier"]:checked');
        const totalEl = document.getElementById("totalPrice");

        if (!selected) {
            totalEl.textContent = "KSh 0";
            return;
        }

        const price = Number(selected.dataset.price);
        const qty = Math.max(1, Number(quantityInput.value) || 1);
        totalEl.textContent = `KSh ${(price * qty).toLocaleString()}`;
    };

    tierInputs.forEach((input) => {
        input.addEventListener("change", updateTotal);
    });
    quantityInput.addEventListener("input", updateTotal);

    form.addEventListener("submit", (e) => handleBookingSubmit(e, form));
}

async function handleBookingSubmit(event, form) {
    event.preventDefault();

    const formError = document.getElementById("formError");
    formError.textContent = "";

    if (!AuthAPI.isAuthenticated()) {
        formError.textContent = "Please log in to book tickets.";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return;
    }

    const selected = form.querySelector('input[name="tier"]:checked');

    if (!selected) {
        formError.textContent = "Please select a ticket type.";
        return;
    }

    const tierId = selected.value;
    const available = Number(selected.dataset.available);
    const quantity = Number(document.getElementById("quantityInput").value);

    if (!Number.isInteger(quantity) || quantity < 1) {
        formError.textContent = "Please enter a valid quantity.";
        return;
    }

    if (quantity > available) {
        formError.textContent = `Only ${available} ticket(s) left for this tier.`;
        return;
    }

    const submitBtn = form.querySelector(".booking-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Booking...";

    const response = await BookingsAPI.createBooking(currentEvent.id, tierId, quantity);

    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Booking";

    if (!response.success) {
        formError.textContent = response.message || "Booking failed. Please try again.";
        return;
    }

    alert("Booking confirmed!");
    window.location.href = "my-bookings.html";
}

function formatDate(dateString) {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}