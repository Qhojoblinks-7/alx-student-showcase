// Comprehensive Database Verification Script
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://test-project.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'test-key-for-debugging'

console.log('🔍 Database Verification Script')
console.log('================================')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`)
console.log('')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyDatabase() {
  const results = {
    connection: false,
    tables: {
      users: false,
      projects: false
    },
    auth: false,
    rls: false,
    triggers: false
  }

  try {
    console.log('1. Testing Basic Connection...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Connection failed:', sessionError.message)
      return results
    }
    
    console.log('✅ Basic connection successful')
    results.connection = true

    console.log('\n2. Testing Database Tables...')
    
    // Test users table
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (usersError) {
        if (usersError.code === 'PGRST116') {
          console.log('❌ Users table does not exist')
        } else {
          console.log('⚠️ Users table exists but query failed:', usersError.message)
          results.tables.users = true
        }
      } else {
        console.log('✅ Users table exists and is accessible')
        results.tables.users = true
      }
    } catch (error) {
      console.log('❌ Users table test failed:', error.message)
    }

    // Test projects table
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('count')
        .limit(1)
      
      if (projectsError) {
        if (projectsError.code === 'PGRST116') {
          console.log('❌ Projects table does not exist')
        } else {
          console.log('⚠️ Projects table exists but query failed:', projectsError.message)
          results.tables.projects = true
        }
      } else {
        console.log('✅ Projects table exists and is accessible')
        results.tables.projects = true
      }
    } catch (error) {
      console.log('❌ Projects table test failed:', error.message)
    }

    console.log('\n3. Testing Authentication...')
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test@verification.com',
        password: 'testpassword123'
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('✅ Authentication working (user already exists)')
          results.auth = true
        } else {
          console.log('⚠️ Authentication test:', authError.message)
        }
      } else if (authData.user) {
        console.log('✅ Authentication working (new user created)')
        results.auth = true
        // Clean up test user
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.log('❌ Authentication test failed:', error.message)
    }

    console.log('\n4. Testing RLS Policies...')
    try {
      // Try to query without authentication (should be blocked by RLS)
      const { data: publicData, error: publicError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (publicError && publicError.message.includes('policy')) {
        console.log('✅ RLS policies are active (query blocked as expected)')
        results.rls = true
      } else {
        console.log('⚠️ RLS policies may not be configured properly')
      }
    } catch (error) {
      console.log('❌ RLS test failed:', error.message)
    }

    console.log('\n5. Testing Schema Structure...')
    try {
      // Test if we can get table information
      const { data: schemaData, error: schemaError } = await supabase
        .from('users')
        .select('id, email, full_name, alx_id, github_username, linkedin_url, bio, avatar_url, created_at, updated_at')
        .limit(0)

      if (schemaError) {
        console.log('⚠️ Schema test failed:', schemaError.message)
      } else {
        console.log('✅ Users table schema appears correct')
      }
    } catch (error) {
      console.log('❌ Schema test failed:', error.message)
    }

  } catch (error) {
    console.log('❌ Verification failed:', error.message)
  }

  // Summary
  console.log('\n📊 Verification Summary')
  console.log('========================')
  console.log(`Connection: ${results.connection ? '✅' : '❌'}`)
  console.log(`Users Table: ${results.tables.users ? '✅' : '❌'}`)
  console.log(`Projects Table: ${results.tables.projects ? '✅' : '❌'}`)
  console.log(`Authentication: ${results.auth ? '✅' : '❌'}`)
  console.log(`RLS Policies: ${results.rls ? '✅' : '❌'}`)

  const totalTests = Object.keys(results).length + Object.keys(results.tables).length - 1
  const passedTests = (results.connection ? 1 : 0) + 
                     (results.tables.users ? 1 : 0) + 
                     (results.tables.projects ? 1 : 0) + 
                     (results.auth ? 1 : 0) + 
                     (results.rls ? 1 : 0)

  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`)

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
verifyDatabase().catch(console.error)