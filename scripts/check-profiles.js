require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfiles() {
    const ids = ['466ee147-c5ea-4d95-ba12-15f3d280e53a', 'ea7af91a-ed58-4208-a19c-5536b0a504a1'];
    console.log('Checking profiles for IDs:', ids);

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .in('id', ids);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(profiles, null, 2));
}

checkProfiles();
