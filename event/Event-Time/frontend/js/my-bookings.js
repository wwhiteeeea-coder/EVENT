// ======================================
// Event Next Door - My Bookings Script
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    if (!AuthAPI.isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }

    loadBookings();
});

async function loadBookings() {
    const container = document.getElementById("bookingsContainer");
    if (!container) return;

    container.innerHTML = `<p style="text-align:center;color:rgb(246,242,242);">Loading your bookings...</p>`;

    const response = await BookingsAPI.getMyBookings();

    if (!response.success) {
        container.innerHTML = `<p style="text-align:center;color:#ff8a8a;">${escapeHtml(response.message || "Could not load your bookings.")}</p>`;
        return;
    }

    const bookings = response.bookings || [];

    if (bookings.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:rgb(246,242,242);">You haven't booked any events yet.</p>`;
        return;
    }

    container.innerHTML = bookings.map(buildBookingCard).join("");

    container.querySelectorAll("[data-cancel-id]").forEach((btn) => {
        btn.addEventListener("click", () => handleCancel(btn.dataset.cancelId));
    });
}

function buildBookingCard(booking) {
    // These come from the joined query in bookingController.getUserBookings —
    // "events" and "event_tiers" are the alias names used in that select().
    const event = booking.events || {};
    const tier = booking.event_tiers || {};

    const dateLabel = formatDate(event.date);
    const isCancelled = booking.status === "cancelled";
    const total = Number(booking.total_price || 0).toLocaleString();

    return `
        <div class="booking-card">
            <h3>${escapeHtml(event.title || "Event")}</h3>
            <p>${dateLabel}${event.location ? " · " + escapeHtml(event.location) : ""}</p>
            <p>Ticket: ${escapeHtml(tier.name || "—")} × ${booking.quantity}</p>
            <p>Total: KSh ${total}</p>
            <p>Status: <strong class="${isCancelled ? "booking-status-cancelled" : ""}">${escapeHtml(booking.status || "confirmed")}</strong></p>
            ${!isCancelled ? `<button class="booking-cancel-btn" data-cancel-id="${booking.id}">Cancel Booking</button>` : ""}
        </div>
    `;
}

async function handleCancel(bookingId) {
    if (!confirm("Cancel this booking?")) {
        return;
    }

    const response = await BookingsAPI.cancelBooking(bookingId);

    if (!response.success) {
        alert(response.message || "Could not cancel this booking.");
        return;
    }

    // Reload the list so the cancelled booking's status/button updates
    loadBookings();
}

function formatDate(dateString) {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}