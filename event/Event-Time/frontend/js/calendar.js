// calendar.js — month nav, server-side month load, day modal
(function () {
  function pad(n){ return String(n).padStart(2,'0'); }
  function monthISOFromDate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; }
  function formatMonthLabel(d){ return d.toLocaleString(undefined, { month: 'long', year: 'numeric' }); }
  function escapeHtml(s){ const d = document.createElement('div'); d.textContent = String(s||''); return d.innerHTML; }

  let viewedDate = new Date(); // current viewed month
  const calendarGrid = document.querySelector('.calendar-grid');
  const monthLabelEl = document.querySelector('.calendar-header span');
  const prevBtn = document.querySelector('.calendar-nav button:first-child');
  const nextBtn = document.querySelector('.calendar-nav button:last-child');

  async function loadMonth(d){
    if (!calendarGrid) return;
    const monthISO = monthISOFromDate(d);
    calendarGrid.classList.add('loading');
    try {
      const res = await authUtils.apiCall(`/events?month=${monthISO}`);
      const events = (res && res.success) ? res.data || [] : [];
      renderCalendarMonth(d, events);
    } catch (err) {
      console.error('Calendar load error', err);
    } finally {
      calendarGrid.classList.remove('loading');
    }
  }

  function renderCalendarMonth(d, events){
    if (monthLabelEl) monthLabelEl.textContent = formatMonthLabel(d);

    const dayEls = Array.from(calendarGrid.querySelectorAll('.day'));
    dayEls.forEach(el => {
      el.classList.remove('has-event','today','selected');
      el.removeAttribute('data-day');
      el.onclick = null;
      el.onkeypress = null;
      el.tabIndex = -1;
    });

    const eventsByDay = {};
    events.forEach(ev => {
      const dateStr = ev.event_date || ev.date;
      if (!dateStr) return;
      const evDate = new Date(dateStr + 'T00:00:00');
      if (isNaN(evDate.getTime())) return;
      const day = evDate.getDate();
      eventsByDay[day] = eventsByDay[day] || [];
      eventsByDay[day].push(ev);
    });

    const today = new Date();
    const isThisMonth = today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth();

    dayEls.forEach(el => {
      const txt = el.textContent.trim();
      const n = parseInt(txt, 10);
      if (!Number.isInteger(n)) return;
      el.setAttribute('data-day', n);
      el.tabIndex = 0;
      if (isThisMonth && n === today.getDate()) el.classList.add('today');
      if (eventsByDay[n] && eventsByDay[n].length) {
        el.classList.add('has-event');
        el.addEventListener('click', () => openDayModal(n, eventsByDay[n]));
        el.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') openDayModal(n, eventsByDay[n]); });
      }
    });
  }

  function openDayModal(day, events){
    let modal = document.getElementById('calendarDayModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'calendarDayModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <button class="modal-close" aria-label="Close">✕</button>
          <h3 id="modalTitle"></h3>
          <div id="modalBody"></div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    }

    const monthName = formatMonthLabel(viewedDate);
    modal.querySelector('#modalTitle').textContent = `Events on ${monthName} ${day}`;
    const body = modal.querySelector('#modalBody');
    if (!events.length) {
      body.innerHTML = '<p>No events for this day.</p>';
    } else {
      body.innerHTML = events.map(ev => `
        <div class="modal-event">
          <h4>${escapeHtml(ev.title)}</h4>
          <p>${escapeHtml(ev.location || '')} • ${escapeHtml(ev.event_time || ev.time || '')}</p>
          <p>${escapeHtml(ev.description ? ev.description.slice(0,200) : '')}</p>
          <div class="modal-event-actions">
            <a class="btn" href="event_details.html?id=${ev.id}">View</a>
            <button class="btn save-inline" data-id="${ev.id}">${ev.saved ? 'Saved' : 'Save'}</button>
            <button class="btn book-inline" data-id="${ev.id}">Book</button>
          </div>
        </div>
      `).join('');
      body.querySelectorAll('.save-inline').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const id = btn.dataset.id;
            const res = await authUtils.apiCall(`/events/${id}/save`, 'POST');
            btn.textContent = res && res.saved ? 'Saved' : 'Save';
          } catch (err) { console.error('Save inline error', err); }
        });
      });
      body.querySelectorAll('.book-inline').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const id = btn.dataset.id;
            await authUtils.apiCall('/bookings', 'POST', { eventId: id, ticketCount: 1 });
            btn.textContent = 'Booked';
            setTimeout(() => btn.textContent = 'Book', 1200);
          } catch (err) { console.error('Book inline error', err); alert('Booking failed'); }
        });
      });
    }
    modal.style.display = 'block';
  }

  if (prevBtn) prevBtn.addEventListener('click', () => {
    viewedDate = new Date(viewedDate.getFullYear(), viewedDate.getMonth()-1, 1);
    loadMonth(viewedDate);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    viewedDate = new Date(viewedDate.getFullYear(), viewedDate.getMonth()+1, 1);
    loadMonth(viewedDate);
  });

  loadMonth(viewedDate);
})();
