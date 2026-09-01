document.addEventListener('DOMContentLoaded', async function() {
    if (!authUtils.isAuthenticated()) {
        authUtils.redirectToLogin();
        return;
    }

    const container = document.getElementById('savedContainer');
    if (!container) return;

    container.innerHTML = '<p>Loading saved events...</p>';
    try {
        const res = await authUtils.apiCall('/users/saved');
        if (!res || !res.success) {
            container.innerHTML = `<p class=\"events-status events-error\">${(res && res.message) || 'Unable to load saved events'}</p>`;
            return;
        }
        const saved = res.data.saved || [];
        const events = res.data.events || [];
        if (!events.length) {
            container.innerHTML = '<p>No saved events.</p>'; return;
        }
        container.innerHTML = events.map(e => `<div class=\"saved-item\"><h4>${escapeHtml(e.title)}</h4><p>${escapeHtml(e.event_date || e.date || '')}</p><a href=\"event_details.html?id=${e.id}\">View</a></div>`).join('');
    } catch (err) {
        console.error('Saved events error', err);
        container.innerHTML = `<p class=\"events-status events-error\">Error: ${err.message}</p>`;
    }

    function escapeHtml(s){ const d = document.createElement('div'); d.textContent = String(s||''); return d.innerHTML; }
});
