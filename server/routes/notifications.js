// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/notifications - list notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications - create a notification (system/admin)
router.post('/', async (req, res) => {
  try {
    const { user_id, title, message, meta } = req.body;
    if (!user_id || !title || !message) return res.status(400).json({ success: false, message: 'Missing fields' });
    const record = { id: uuidv4(), user_id, title, message, meta: meta || null, read: false, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('notifications').insert([record]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notifications/:id/mark-read
router.put('/:id/mark-read', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    // ensure notification belongs to user
    const { data: existing, error: getErr } = await supabase.from('notifications').select('*').eq('id', id).limit(1);
    if (getErr) throw getErr;
    if (!existing || !existing.length) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (existing[0].user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
