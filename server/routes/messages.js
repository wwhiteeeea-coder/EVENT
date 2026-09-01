// server/routes/messages.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// POST /api/messages - send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const fromUser = req.user.id;
    const { toUserId, content } = req.body;
    if (!toUserId || !content) return res.status(400).json({ success: false, message: 'Missing fields' });

    const record = { id: uuidv4(), from_user_id: fromUser, to_user_id: toUserId, content, read: false, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('messages').insert([record]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/messages - get messages for user (inbox + sent)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase.from('messages').select('*').or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/messages/:id/mark-read
router.put('/:id/mark-read', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { data: existing, error: getErr } = await supabase.from('messages').select('*').eq('id', id).limit(1);
    if (getErr) throw getErr;
    if (!existing || !existing.length) return res.status(404).json({ success: false, message: 'Message not found' });

    // only recipient can mark read
    if (existing[0].to_user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { data, error } = await supabase.from('messages').update({ read: true }).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
