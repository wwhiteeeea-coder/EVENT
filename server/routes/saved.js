// server/routes/saved.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// POST /api/events/:id/save - toggle save/favorite
router.post('/events/:id/save', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Check if saved
    const { data: existing, error: checkErr } = await supabase.from('saved_events').select('*').eq('event_id', eventId).eq('user_id', userId).limit(1);
    if (checkErr) throw checkErr;

    if (existing && existing.length) {
      // remove
      const { error } = await supabase.from('saved_events').delete().eq('id', existing[0].id);
      if (error) throw error;
      return res.json({ success: true, saved: false });
    }

    // insert
    const record = { id: uuidv4(), user_id: userId, event_id: eventId, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('saved_events').insert([record]).select();
    if (error) throw error;
    res.status(201).json({ success: true, saved: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/saved - list saved events for current user
router.get('/users/saved', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase.from('saved_events').select('id, event_id, created_at').eq('user_id', userId);
    if (error) throw error;

    // fetch event details
    const eventIds = data.map(s => s.event_id).filter(Boolean);
    let events = [];
    if (eventIds.length) {
      const { data: evData } = await supabase.from('events').select('id, title, event_date, location, image_url').in('id', eventIds);
      events = evData;
    }

    res.json({ success: true, data: { saved: data, events } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
