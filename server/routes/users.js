const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id, first_name, last_name, email, phone, profile_image, bio, created_at').eq('id', req.user.id).limit(1);
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const allowed = ['first_name','last_name','bio','profile_image','phone'];
    const payload = {};
    for (const k of allowed) if (updates[k] !== undefined) payload[k] = updates[k];

    const { data, error } = await supabase.from('users').update(payload).eq('id', req.user.id).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
