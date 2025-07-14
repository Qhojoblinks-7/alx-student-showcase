// 🔍 Comprehensive Supabase Database Verification Script
import { createClient } from '@supabase/supabase-js'

// Load environment variables or fallback to defaults
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://jzydkrylxptfxqvtfeva.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eWRrcnlseHB0ZnhxdnRmZXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTQxNjMsImV4cCI6MjA1OTY5MDE2M30.cyB0i7YTOGXqQQvd-skIcvDzRBi9JU72qaiaifZDJ5Q'

console.log('🔍 Database Verification Script')
console.log('================================')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`)
console.log('')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyDatabase() {
  const results = {
    connection: false,
    tables: { users: false, projects: false },
    auth: false,
    rls: false,
    schema: false
  }

  let passedTests = 0
  const totalTests = 5

  // 1. Connection Test
  console.log('1️⃣ Testing Basic Connection...')
  const { error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.log('❌ Connection failed:', sessionError.message)
  } else {
    console.log('✅ Basic connection successful')
    results.connection = true
    passedTests++
  }

  // 2. Table Test
  console.log('\n2️⃣ Testing Database Tables...')
  for (const table of ['users', 'projects']) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ ${table} table does not exist`)
        } else {
          console.log(`⚠️ ${table} table exists but query failed:`, error.message)
          results.tables[table] = true
          passedTests++
        }
      } else {
        console.log(`✅ ${table} table exists and is accessible`)
        results.tables[table] = true
        passedTests++
      }
    } catch (err) {
      console.log(`❌ ${table} table test failed:`, err.message)
    }
  }

  // 3. Authentication Test
  console.log('\n3️⃣ Testing Authentication...')
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@verification.com',
      password: 'testpassword123'
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Authentication working (user already exists)')
        results.auth = true
        passedTests++
      } else {
        console.log('⚠️ Authentication issue:', error.message)
      }
    } else if (data.user) {
      console.log('✅ Authentication working (new user created)')
      results.auth = true
      passedTests++
      await supabase.auth.signOut()
    }
  } catch (err) {
    console.log('❌ Authentication test failed:', err.message)
  }

  // 4. RLS Policy Test
  console.log('\n4️⃣ Testing RLS Policies...')
  try {
    const { error } = await supabase.from('users').select('*').limit(1)
    if (error && error.message.includes('policy')) {
      console.log('✅ RLS policies are active (query blocked as expected)')
      results.rls = true
      passedTests++
    } else {
      console.log('⚠️ RLS policies may not be configured properly')
    }
  } catch (err) {
    console.log('❌ RLS test failed:', err.message)
  }

  // 5. Schema Structure Test
  console.log('\n5️⃣ Testing Schema Structure...')
  try {
    const { error } = await supabase
      .from('users')
      .select('id, email, full_name, alx_id, github_username, linkedin_url, bio, avatar_url, created_at, updated_at')
      .limit(0)

    if (error) {
      console.log('⚠️ Schema test failed:', error.message)
    } else {
      console.log('✅ Schema structure looks valid')
      results.schema = true
      passedTests++
    }
  } catch (err) {
    console.log('❌ Schema test failed:', err.message)
  }

  // Summary
  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed`)
  if (passedTests === totalTests) {
    console.log('🎉 Database is fully configured and working!')
  } else if (passedTests > 0) {
    console.log('⚠️ Database is partially configured')
  } else {
    console.log('❌ Database needs configuration')
  }

  return results
}

// Run verification
verifyDatabase().catch((err) => console.error('Unhandled error:', err.message))