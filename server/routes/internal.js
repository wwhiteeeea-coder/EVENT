const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');

// Internal DB check endpoint. This endpoint is intended for non-production/dev only.
// It returns a lightweight check that the server can query the database using the Supabase client.
router.get('/db-check', async (req, res) => {
  try {
    // Restrict to non-production by default
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { data, error, status } = await supabase.from('events').select('id', { count: 'exact', head: false });
    if (error) {
      console.error('DB check error', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const count = Array.isArray(data) ? data.length : null;
    res.json({ success: true, db: { eventsCount: count }, time: new Date().toISOString() });
  } catch (err) {
    console.error('DB check exception', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
