const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

// GET /api/events - list events with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, location, search, organizer_id, month } = req.query;
    let query = supabase.from('events').select('*');

    if (category) query = query.eq('category', category);
    if (location) query = query.eq('location', location);
    if (organizer_id) query = query.eq('organizer_id', organizer_id);

    // If month filter provided in format YYYY-MM, filter event_date like 'YYYY-MM%'
    if (month) {
      // supabase-js supports .like for pattern matching
      query = query.like('event_date', `${month}%`);
    }

    // basic search on title or description
    const { data, error } = await query;
    if (error) throw error;

    let filtered = data;
    if (search) {
      const q = search.toLowerCase();
      filtered = data.filter(e => (e.title && e.title.toLowerCase().includes(q)) || (e.description && e.description.toLowerCase().includes(q)));
    }

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('events').select('*').eq('id', id).limit(1);
    if (error) throw error;
    if (!data || !data.length) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/events - create event (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location, date, time, endTime, price, maxCapacity, image } = req.body;
    if (!title || !date || !time) return res.status(400).json({ success: false, message: 'Missing required fields' });

    const payload = {
      organizer_id: req.user.id,
      title,
      description,
      category,
      location,
      event_date: date,
      event_time: time,
      end_time: endTime || null,
      image_url: image || null,
      price: price || 0,
      max_capacity: maxCapacity || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('events').insert([payload]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: { id: data[0].id, title: data[0].title, createdAt: data[0].created_at } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/events/:id - update
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: existing, error: getErr } = await supabase.from('events').select('*').eq('id', id).limit(1);
    if (getErr) throw getErr;
    if (!existing || !existing.length) return res.status(404).json({ success: false, message: 'Event not found' });
    if (existing[0].organizer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { data, error } = await supabase.from('events').update(updates).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: existing, error: getErr } = await supabase.from('events').select('*').eq('id', id).limit(1);
    if (getErr) throw getErr;
    if (!existing || !existing.length) return res.status(404).json({ success: false, message: 'Event not found' });
    if (existing[0].organizer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
