# Event Next Door - Express + Supabase backend

This folder contains a minimal Express implementation that matches the API contract described in event/BACKEND_GUIDE.md.

Files:
- server/index.js - app entry
- server/routes/* - route handlers
- server/utils/supabaseClient.js - supabase client wrapper
- server/middleware/auth.js - JWT auth middleware

Setup
1. Copy `.env.example` to `.env` and set values for SUPABASE_URL, SUPABASE_KEY, JWT_SECRET and PORT.
2. Install dependencies: `npm install`
3. Run in development: `npm run dev` (nodemon) or `npm start`

Notes
- This implementation expects the database tables described in BACKEND_GUIDE.md (users, events, bookings, event_attendees).
- No migrations are included; create the tables in Supabase before using the API.
- Do not commit secrets. Use environment variables or repository secrets for deployments.
