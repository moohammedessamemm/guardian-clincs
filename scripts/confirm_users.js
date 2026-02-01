/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');

const password = encodeURIComponent('hrrz2006#2006');
const connectionString = `postgresql://postgres:${password}@db.wdkidnnitwldttiblboo.supabase.co:5432/postgres`;

async function confirmUsers() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        const res = await client.query(`
      UPDATE auth.users
      SET email_confirmed_at = NOW()
      WHERE email_confirmed_at IS NULL;
    `);

        console.log(`Confirmed ${res.rowCount} user(s).`);
    } catch (err) {
        console.error('Failed to confirm users:', err);
    } finally {
        await client.end();
    }
}

confirmUsers();
