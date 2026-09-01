const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, and password are required.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  try {
    // Supabase Auth handles password hashing, duplicate-email checks,
    // and JWT issuance for us. fullName/phone are stored as user metadata
    // since we're not keeping a separate profiles table right now.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          phone
        }
      }
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      user: {
        id: data.user.id,
        fullName: data.user.user_metadata.fullName,
        email: data.user.email,
        phone: data.user.user_metadata.phone
      },
      // May be null if your Supabase project requires email confirmation
      // before a session is issued — see note below in the chat response.
      token: data.session ? data.session.access_token : null
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Give a specific, actionable message when the account exists but
      // hasn't been confirmed yet — everything else stays generic so we
      // don't reveal whether an email is registered.
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return res.status(401).json({
          success: false,
          message: 'Please check your inbox and confirm your email before logging in.'
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      user: {
        id: data.user.id,
        fullName: data.user.user_metadata.fullName,
        email: data.user.email,
        phone: data.user.user_metadata.phone
      },
      token: data.session.access_token
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

module.exports = router;