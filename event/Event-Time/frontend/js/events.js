// ======================================
// Event Next Door - Events List Script (wired to backend)
// ======================================

let allEvents = [];

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }
});

async function loadEvents() {
    const container = document.getElementById("eventsContainer");
    if (!container) return;

    container.innerHTML = `<p class="events-status">Loading events...</p>`;

    try {
        const response = await authUtils.apiCall('/events');
        // backend returns { success: true, data: [...], count }
        if (!response || !response.success) {
            container.innerHTML = `<p class="events-status events-error">${(response && response.message) || "Could not load events."}</p>`;
            return;
        }

        allEvents = response.data || [];
        renderEvents(allEvents);
    } catch (err) {
        console.error('Failed to load events', err);
        container.innerHTML = `<p class="events-status events-error">Error loading events: ${err.message}</p>`;
    }
}

function renderEvents(events) {
    const container = document.getElementById("eventsContainer");
    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML = `<p class="events-status">No events found.</p>`;
        return;
    }

    container.innerHTML = `<div class="event-grid">${events.map(buildEventCard).join("")}</div>`;

    // attach save handlers
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const id = this.dataset.eventId;
            try {
                const res = await authUtils.apiCall(`/events/${id}/save`, 'POST');
                // toggle UI
                if (res && res.saved) {
                    this.textContent = '🔖';
                    this.style.opacity = '1';
                } else {
                    this.textContent = '📌';
                    this.style.opacity = '0.6';
                }
            } catch (err) {
                console.error('Save error', err);
                authUtils.showError('errorMessage', err.message || 'Could not save event');
            }
        });
    });
}

function buildEventCard(event) {
    const imageUrl = event.image_url || event.image || "https://placehold.co/600x400?text=Event";
    const dateLabel = event.event_date || event.date || 'Date TBA';

    return `
        <a href="event_details.html?id=${event.id}" class="event-card">
            <div class="event-image">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(event.title)}">
            </div>
            <div class="event-info">
                <h3>${escapeHtml(event.title)}</h3>
                <p class="event-meta">${escapeHtml(formatDate(dateLabel))}</p>
                <button class="save-btn" data-event-id="${event.id}" style="opacity:0.6">📌</button>
            </div>
        </a>
    `;
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

// Basic HTML escaping so event data can never break card markup or inject script content
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str || '');
    return div.innerHTML;
}

function handleSearch(event) {
    const term = event.target.value.trim().toLowerCase();

    if (term === "") {
        renderEvents(allEvents);
        return;
    }

    const filtered = allEvents.filter((e) =>
        (e.title || "").toLowerCase().includes(term) || (e.description || "").toLowerCase().includes(term)
    );

    renderEvents(filtered);
}
