const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
// Prefer a server-side service role key for privileged operations. Fall back to SUPABASE_KEY or anon if provided.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

const keyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;

if (!SUPABASE_URL || !keyToUse) {
  console.warn('SUPABASE_URL or SUPABASE key is not set. Supabase client may fail.');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. The server is using a non-service key which may be insufficient or insecure for privileged operations. Set SUPABASE_SERVICE_ROLE_KEY in the server .env.');
}

// Create a server-side client. We disable session persistence on the server.
const supabase = createClient(SUPABASE_URL, keyToUse, { auth: { persistSession: false } });

module.exports = supabase;
