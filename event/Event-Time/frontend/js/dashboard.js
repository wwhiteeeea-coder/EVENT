document.addEventListener('DOMContentLoaded', function() {
    // Ensure user is authenticated
    if (!authUtils.isAuthenticated()) {
        // If not authenticated, keep page partially usable but prompt login for actions
        console.log('Not authenticated - some features disabled');
    }

    // Notifications
    const notificationBtn = document.querySelector('.notification-btn');
    notificationBtn?.addEventListener('click', async function() {
        try {
            const res = await authUtils.apiCall('/notifications');
            if (res && res.success) {
                showNotifications(res.data);
            }
        } catch (err) {
            console.error('Notifications error', err);
            authUtils.showError('errorMessage', err.message || 'Failed to load notifications');
        }
    });

    function showNotifications(items) {
        // Simple modal/list for demo purpose
        const html = items.map(n => `<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.04)"><strong>${escapeHtml(n.title)}</strong><div>${escapeHtml(n.message)}</div><small>${new Date(n.created_at).toLocaleString()}</small></div>`).join('');
        const w = window.open('', 'Notifications', 'width=400,height=600');
        w.document.body.style.background = '#081026';
        w.document.body.style.color = '#fff';
        w.document.body.innerHTML = `<h3 style="padding:8px;">Notifications</h3><div>${html}</div>`;
    }

    // Calendar: load events for current month
    async function loadCalendar(monthISO) {
        // monthISO e.g. '2026-05'
        try {
            const res = await authUtils.apiCall('/events'); // server currently supports filtering server-side if query params provided
            if (res && res.success) {
                // Filter client-side by month
                const events = (res.data || []).filter(ev => {
                    const evDate = ev.event_date || ev.date || null;
                    if (!evDate) return false;
                    return evDate.startsWith(monthISO);
                });
                markCalendarDays(events);
            }
        } catch (err) {
            console.error('Calendar load error', err);
        }
    }

    function markCalendarDays(events) {
        // Find .calendar-grid .day elements and mark ones that have events
        const days = document.querySelectorAll('.calendar-grid .day');
        days.forEach(d => d.classList.remove('has-event'));
        events.forEach(ev => {
            const day = new Date(ev.event_date || ev.date).getDate();
            const el = Array.from(days).find(x => x.textContent.trim() == String(day));
            if (el) el.classList.add('has-event');
        });
    }

    // initialize calendar for current month
    const now = new Date();
    const monthISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    loadCalendar(monthISO);

});

function escapeHtml(s){ const d = document.createElement('div'); d.textContent = String(s||''); return d.innerHTML; }
