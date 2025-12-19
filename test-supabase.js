// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? 'Set ✓' : 'Missing ✗')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n1. Testing games table query...')
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .order('score', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Error:', error)
    } else {
      console.log('✅ Success! Found', games?.length || 0, 'games')
      if (games && games.length > 0) {
        console.log('Sample game:', {
          user_id: games[0].user_id,
          score: games[0].score,
          date: games[0].date
        })
      }
    }

    console.log('\n2. Testing users table query...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersError) {
      console.error('❌ Error:', usersError)
    } else {
      console.log('✅ Success! Found', users?.length || 0, 'users')
    }

  } catch (err) {
    console.error('❌ Exception:', err)
  }
}

testConnection()
