// ======================================
// Event Next Door - Events List Script
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

    const response = await EventsAPI.getAllEvents();

    if (!response.success) {
        container.innerHTML = `<p class="events-status events-error">${response.message || "Could not load events."}</p>`;
        return;
    }

    allEvents = response.events || [];
    renderEvents(allEvents);
}

function renderEvents(events) {
    const container = document.getElementById("eventsContainer");
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `<p class="events-status">No events found.</p>`;
        return;
    }

    container.innerHTML = `<div class="event-grid">${events.map(buildEventCard).join("")}</div>`;
}

function buildEventCard(event) {
    const imageUrl = event.image || "https://placehold.co/600x400?text=Event";
    const dateLabel = formatDate(event.date);

    return `
        <a href="event_details.html?id=${event.id}" class="event-card">
            <div class="event-image">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(event.title)}">
            </div>
            <div class="event-info">
                <h3>${escapeHtml(event.title)}</h3>
                <p class="event-meta">${dateLabel}</p>
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
    div.textContent = String(str);
    return div.innerHTML;
}

function handleSearch(event) {
    const term = event.target.value.trim().toLowerCase();

    if (term === "") {
        renderEvents(allEvents);
        return;
    }

    const filtered = allEvents.filter((e) =>
        (e.title || "").toLowerCase().includes(term)
    );

    renderEvents(filtered);
}