// Test script to check database connectivity
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://test-project.supabase.co'
const supabaseAnonKey = 'test-key-for-debugging'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase...')
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('Error details:', error)
    } else {
      console.log('✅ Basic connection successful')
      console.log('Session data:', data)
    }
    
    // Test database query (this will fail with invalid credentials)
    console.log('\nTesting database query...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (userError) {
      console.error('❌ Database query failed:', userError.message)
      console.error('This is expected with invalid credentials')
    } else {
      console.log('✅ Database query successful')
      console.log('User data:', userData)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()