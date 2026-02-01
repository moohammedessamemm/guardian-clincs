const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
    console.log('Attempting login with wrong password...')
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'WRONG_PASSWORD_123',
        })

        if (error) {
            console.log('Supabase returned error (as expected):', error.message)
            console.log('Error status:', error.status)
        } else {
            console.log('Login successful (unexpected!):', data)
        }
    } catch (err) {
        console.error('CAUGHT EXCEPTION:', err)
    }
}

testLogin()
