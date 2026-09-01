document.addEventListener('DOMContentLoaded', function() {
    if (!authUtils.isAuthenticated()) {
        authUtils.redirectToLogin();
        return;
    }

    const container = document.getElementById('bookingsContainer');
    async function loadBookings() {
        if (!container) return;
        container.innerHTML = '<p>Loading bookings...</p>';
        try {
            const res = await authUtils.apiCall('/bookings');
            if (!res || !res.success) {
                container.innerHTML = `<p class=\"events-status events-error\">${(res && res.message) || 'Unable to load bookings'}</p>`;
                return;
            }
            renderBookings(res.data || []);
        } catch (err) {
            console.error('Bookings error', err);
            container.innerHTML = `<p class=\"events-status events-error\">Error loading bookings: ${err.message}</p>`;
        }
    }

    function renderBookings(bookings) {
        if (!container) return;
        if (!bookings.length) {
            container.innerHTML = '<p>No bookings found.</p>';
            return;
        }
        container.innerHTML = bookings.map(b => bookingCard(b)).join('');
        // attach cancel handlers
        document.querySelectorAll('.booking-cancel-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.dataset.bookingId;
                if (!confirm('Cancel this booking?')) return;
                try {
                    await authUtils.apiCall(`/bookings/${id}`, 'DELETE');
                    authUtils.showSuccess('formSuccess', 'Booking cancelled');
                    await loadBookings();
                } catch (err) {
                    console.error('Cancel error', err);
                    authUtils.showError('formError', err.message || 'Could not cancel booking');
                }
            });
        });
    }

    function bookingCard(b) {
        const title = b.event?.title || 'Event';
        const date = b.event?.event_date || b.booking_date || b.bookingDate || 'Date';
        return `
            <div class="booking-card">
                <h3>${escapeHtml(title)}</h3>
                <p>Date: ${escapeHtml(String(date))}</p>
                <p>Tickets: ${escapeHtml(String(b.ticket_count || 1))}</p>
                <p>Status: ${escapeHtml(b.status || 'confirmed')}</p>
                <button class="booking-cancel-btn" data-booking-id="${b.id}">Cancel booking</button>
            </div>
        `;
    }

    function escapeHtml(s){ const d = document.createElement('div'); d.textContent = String(s||''); return d.innerHTML; }

    loadBookings();
});
