/* eslint-disable */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const password = encodeURIComponent('hrrz2006#2006');
const connectionString = `postgresql://postgres:${password}@db.wdkidnnitwldttiblboo.supabase.co:5432/postgres`;

async function migrate() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase in some envs
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        const schemaPath = path.join(__dirname, '../supabase/schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        // Split by semicolons isn't perfect for PL/pgSQL, but Supabase SQL usually runs OK as one block 
        // IF the client supports multi-statement. 'pg' supports multi-statement queries.
        await client.query(sql);

        console.log('Schema applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
