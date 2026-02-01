/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for script simplicity (reading env in pure JS is annoying)
const SUDABASE_URL = 'https://wdkidnnitwldttiblboo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2lkbm5pdHdsZHR0aWJsYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODA2ODcsImV4cCI6MjA4NTM1NjY4N30.lPpiavzgTkdNw1fcR0UMUGBaEjDiWMdArvDYcbOHMBc';

const supabase = createClient(SUDABASE_URL, SUPABASE_ANON_KEY);

const users = [
    { email: 'patient@guardian.com', password: 'password123', role: 'patient', name: 'Frank Patient' },
    { email: 'doctor@guardian.com', password: 'password123', role: 'doctor', name: 'Dr. Sarah Smith' },
    { email: 'staff@guardian.com', password: 'password123', role: 'staff', name: 'Nurse Jackie' },
    { email: 'admin@guardian.com', password: 'password123', role: 'admin', name: 'System Administrator' },
];

async function createUsers() {
    console.log('Creating test users...');

    for (const user of users) {
        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    full_name: user.name,
                    // We try to pass role, but trigger overwrites it to 'patient' for security
                    // We will fix this with SQL later
                }
            }
        });

        if (error) {
            console.error(`[FAIL] ${user.email}: ${error.message}`);
        } else if (data.user && !data.session) {
            console.log(`[WARN] ${user.email} created but requires EMAIL CONFIRMATION.`);
        } else {
            console.log(`[OK] ${user.email} created.`);
        }
    }
}

createUsers();
