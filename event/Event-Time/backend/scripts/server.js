require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('../middleware/errorHandler');

// Import routes
const authRoutes = require('../routes/authRoutes');
const eventRoutes = require('../routes/eventRoutes');
const bookingRoutes = require('../routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
// FIX: previously only allowed http://localhost:3000 (via CORS_ORIGIN env
// var or that hardcoded default). Your frontend pages are actually served
// by VS Code Live Server on port 5500, so every fetch from login.html /
// register.html was being silently blocked by the browser before it ever
// reached this server. That was the root cause of "nothing happens on
// submit". This now allows a list of common local dev origins — set
// CORS_ORIGIN in your .env to add/override your real origin in production.
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;