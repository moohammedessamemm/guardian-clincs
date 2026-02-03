require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('Inspecting supabase.auth.admin:');
console.log(Object.keys(supabase.auth.admin));
console.log('Proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(supabase.auth.admin)));

if (typeof supabase.auth.admin.deleteSession === 'function') {
    console.log('deleteSession EXISTS');
} else {
    console.log('deleteSession MISSING');
}
