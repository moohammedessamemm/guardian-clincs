require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRpc() {
    console.log('Testing track_session_activity...');

    // Call with dummy data just to see if function exists
    // We expect it to succeed or fail with constraint error, but NOT "function not found"
    const { error } = await supabase.rpc('track_session_activity', {
        p_session_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID (will likely fail FK if enforced, but that proves function exists)
        p_ip: '127.0.0.1',
        p_ua: 'TestScript',
        p_device_info: {}
    });

    if (error) {
        console.error('RPC Call Result:', error.message);
        if (error.code === '42883') { // Undefined function
            console.log('STATUS: MISSING');
        } else {
            console.log('STATUS: EXISTS (but failed with logic/constraint error, which is fine)');
        }
    } else {
        console.log('STATUS: EXISTS (Success)');
    }
}

checkRpc();
