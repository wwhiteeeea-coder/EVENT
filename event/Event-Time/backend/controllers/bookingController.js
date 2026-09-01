const supabase = require('../config/supabase');

// Create a booking
const createBooking = async (req, res) => {
  const userId = req.user.id; // set by authMiddleware from the verified Supabase token
  const { event_id, tier_id, quantity } = req.body;

  if (!event_id || !tier_id || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'event_id, tier_id, and quantity are required.'
    });
  }

  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a whole number of 1 or more.'
    });
  }

  try {
    // Fetch the tier to check price and remaining availability
    const { data: tier, error: tierError } = await supabase
      .from('event_tiers')
      .select('*')
      .eq('id', tier_id)
      .eq('event_id', event_id)
      .maybeSingle();

    if (tierError) {
      return res.status(500).json({ success: false, message: tierError.message });
    }

    if (!tier) {
      return res.status(404).json({ success: false, message: 'Ticket tier not found for this event.' });
    }

    const remaining = tier.quantity_available - tier.quantity_booked;

    if (qty > remaining) {
      return res.status(409).json({
        success: false,
        message: remaining > 0
          ? `Only ${remaining} ${tier.name} ticket(s) left.`
          : `${tier.name} tickets are sold out.`
      });
    }

    const totalPrice = Number(tier.price) * qty;

    // Reserve the seats first using a conditional update: only succeeds if
    // quantity_booked hasn't changed since we read it (i.e. nobody else
    // booked the last seats in between our check above and this update).
    // This is what actually prevents overselling under concurrent requests.
    const { data: updatedTier, error: reserveError } = await supabase
      .from('event_tiers')
      .update({ quantity_booked: tier.quantity_booked + qty })
      .eq('id', tier_id)
      .eq('quantity_booked', tier.quantity_booked)
      .select()
      .maybeSingle();

    if (reserveError) {
      return res.status(500).json({ success: false, message: reserveError.message });
    }

    if (!updatedTier) {
      // Someone else booked in the meantime — ask the client to retry
      return res.status(409).json({
        success: false,
        message: 'These tickets were just booked by someone else. Please try again.'
      });
    }

    // Now create the booking record itself
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId,
        event_id,
        tier_id,
        quantity: qty,
        total_price: totalPrice,
        status: 'confirmed',
        booking_date: new Date().toISOString()
      }])
      .select()
      .maybeSingle();

    if (bookingError) {
      // Roll back the seat reservation since the booking itself failed
      await supabase
        .from('event_tiers')
        .update({ quantity_booked: tier.quantity_booked })
        .eq('id', tier_id);

      return res.status(500).json({ success: false, message: bookingError.message });
    }

    res.status(201).json({ success: true, booking });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Booking failed. Please try again.' });
  }
};

// Get all bookings for the logged-in user, with event + tier details
const getUserBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events:event_id ( title, date, location, image ),
        event_tiers:tier_id ( name )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, bookings: data });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load bookings. Please try again.' });
  }
};

// Cancel a booking and release the reserved seats back to the tier
const cancelBooking = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, message: fetchError.message });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    // Release the seats back to the tier
    const { data: tier } = await supabase
      .from('event_tiers')
      .select('quantity_booked')
      .eq('id', booking.tier_id)
      .maybeSingle();

    if (tier) {
      await supabase
        .from('event_tiers')
        .update({ quantity_booked: Math.max(0, tier.quantity_booked - booking.quantity) })
        .eq('id', booking.tier_id);
    }

    res.json({ success: true, message: 'Booking cancelled.' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking. Please try again.' });
  }
};

// Get attendee list for an event (for organizers — not used by the
// frontend yet, included since the route already references it)
const getEventAttendees = async (req, res) => {
  const { eventId } = req.params;

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('quantity, status, user_id')
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, attendees: data });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load attendees. Please try again.' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  getEventAttendees
};