const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, events: data });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load events. Please try again.' });
  }
});

// Get a single event by id, including its ticket tiers
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (eventError) {
      return res.status(500).json({ success: false, message: eventError.message });
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const { data: tiers, error: tiersError } = await supabase
      .from('event_tiers')
      .select('*')
      .eq('event_id', id)
      .order('price', { ascending: true });

    if (tiersError) {
      return res.status(500).json({ success: false, message: tiersError.message });
    }

    res.json({
      success: true,
      event: {
        ...event,
        tiers: (tiers || []).map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          // Don't expose internal booking counts to the client —
          // just whether seats remain and how many.
          available: t.quantity_available - t.quantity_booked
        }))
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load event. Please try again.' });
  }
});

module.exports = router;