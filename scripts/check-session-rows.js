require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function dumpSessions() {
    console.log('Fetching all user_sessions...');
    // We don't have the user ID handy, so let's just dump the last 5 sessions modified.

    const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('session_id, user_id, ip_address, user_agent, is_revoked, last_active_at')
        .order('last_active_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(sessions, null, 2));

    // Check if session_id looks like a UUID or if it matches user_id (collision fallback)
    sessions.forEach(s => {
        if (s.session_id === s.user_id) {
            console.log(`[WARNING] Collision Detected! Session ${s.session_id} MATCHES User ID. Middleware fallback is active.`);
        } else {
            console.log(`[OK] Session ${s.session_id} is distinct from user ID.`);
        }
    });
}

dumpSessions();
