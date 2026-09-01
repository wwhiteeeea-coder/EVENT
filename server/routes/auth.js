const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check existing
    const { data: existing, error: checkErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (checkErr) throw checkErr;
    if (existing && existing.length) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertPayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password_hash,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('users').insert([insertPayload]).select();
    if (error) throw error;

    const user = data[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ success: true, token, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing email or password' });

    const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1);
    if (error) throw error;
    if (!data || !data.length) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = data[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    try {
      const { data, error } = await supabase.from('users').select('id, first_name, last_name, email, phone, profile_image').eq('id', decoded.id).limit(1);
      if (error) throw error;
      res.json({ success: true, user: data[0] });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });
});

module.exports = router;
