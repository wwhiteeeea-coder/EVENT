const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/bookings - user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('user_id', req.user.id);
    if (error) throw error;
    // Optionally join event info
    const results = await Promise.all(data.map(async b => {
      const { data: ev } = await supabase.from('events').select('id, title, event_date, location, image_url').eq('id', b.event_id).limit(1);
      return { ...b, event: ev && ev[0] ? ev[0] : null };
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings - create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, ticketCount } = req.body;
    if (!eventId) return res.status(400).json({ success: false, message: 'Missing eventId' });

    // Basic existence check
    const { data: ev, error: evErr } = await supabase.from('events').select('id, max_capacity, attendees').eq('id', eventId).limit(1);
    if (evErr) throw evErr;
    if (!ev || !ev.length) return res.status(404).json({ success: false, message: 'Event not found' });

    const booking = {
      id: uuidv4(),
      user_id: req.user.id,
      event_id: eventId,
      ticket_count: ticketCount || 1,
      status: 'confirmed',
      booking_date: new Date().toISOString()
    };

    const { data, error } = await supabase.from('bookings').insert([booking]).select();
    if (error) throw error;

    // increment attendees (best-effort)
    try {
      await supabase.from('events').update({ attendees: (ev[0].attendees || 0) + (ticketCount || 1) }).eq('id', eventId);
    } catch (e) { console.warn('Failed to increment attendees', e.message); }

    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/bookings/:id - cancel
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: existing, error: getErr } = await supabase.from('bookings').select('*').eq('id', id).limit(1);
    if (getErr) throw getErr;
    if (!existing || !existing.length) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (existing[0].user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
