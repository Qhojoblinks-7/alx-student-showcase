import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, Database, RefreshCw, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types'; // Import PropTypes

export function DatabaseErrorHandler({ children }) {
  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    isChecking: true,
    error: null,
    tablesExist: false,
    authWorking: false
  });

  const checkDatabaseHealth = useCallback(async () => { // Wrap in useCallback
    setDbStatus(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // Test 1: Basic connection - Attempt to get a session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // Ensure error message is a string
        throw new Error(`Connection failed: ${sessionError.message ? String(sessionError.message) : String(sessionError)}`);
      }

      // Test 2: Check if required tables exist
      // This attempts to select a count from the 'users' table.
      // If the table doesn't exist, Supabase's PostgREST API will return an error with code 'PGRST116'.
      const { data: tablesData, error: tablesError } = await supabase
        .from('profiles') // Assuming 'users' is a critical, required table for your app
        .select('count')
        .limit(1);

      const tablesExist = !tablesError || tablesError.code !== 'PGRST116';

      // Test 3: Test authentication by attempting a sign-up/sign-in and then fetching profile
      let authWorking = false;
      let testUser = null; // To store the user object if created or found

      try {
        const testEmail = "healthcheck@example.com"; 
        const testPassword = 'testpassword123';

        // Attempt to sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword
        });

        if (signUpError) {
          // If user already exists, try to sign in
          if (signUpError.message.includes('already registered') || signUpError.message.includes('user already exists')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: testEmail,
              password: testPassword
            });
            if (signInError) {
              console.error('Auth sign-in test error:', signInError.message ? String(signInError.message) : String(signInError));
            } else if (signInData.user) {
              testUser = signInData.user;
            }
          } else {
            console.error('Auth signup test error:', signUpError.message ? String(signUpError.message) : String(signUpError));
          }
        } else if (signUpData.user) {
          testUser = signUpData.user;
        }

        // If we have a test user (either new or signed in), try to fetch their profile with retries
        if (testUser) {
          const MAX_RETRIES = 5;
          const RETRY_DELAY_MS = 500; // 0.5 seconds

          for (let i = 0; i < MAX_RETRIES; i++) {
            const { data: profileData, error: profileError } = await supabase
              .from(profiles)
              .select('id') // Just need to confirm existence
              .eq('id', testUser.id)
              .single(); // Use .single() as we expect one row for a specific ID

            if (profileData && !profileError) {
              authWorking = true;
              break; // Profile found, exit retry loop
            } else if (profileError && profileError.code === 'PGRST116') { // Supabase error code for "no rows found"
                console.warn(`Attempt ${i + 1}/${MAX_RETRIES}: Profile not yet found for test user. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                // Other unexpected errors or multiple rows returned (which shouldn't happen for ID)
                console.error('Profile fetch test error:', profileError ? (profileError.message ? String(profileError.message) : String(profileError)) : 'Profile data missing or unexpected error');
                break; // Stop retrying on other errors
            }
          }
        }
      } catch (authTestError) {
        console.error('Auth test overall error:', authTestError.message ? String(authTestError.message) : String(authTestError));
      } finally {
        // Always try to sign out the test user if they were logged in
        if (supabase.auth.currentUser) {
          await supabase.auth.signOut();
        }
      }

      // Update status based on all checks
      setDbStatus({
        isConnected: true,
        isChecking: false,
        error: null,
        tablesExist,
        authWorking
      });

    } catch (error) {
      // Catch any errors from the main connection or table existence checks
      // Explicitly convert error to string for robust logging
      console.error('Database health check failed:', error.message ? String(error.message) : String(error));
      setDbStatus({
        isConnected: false,
        isChecking: false,
        error: error.message ? String(error.message) : String(error), // Store the error message
        tablesExist: false,
        authWorking: false
      });
    }
  }, []); // Empty dependency array as supabase is assumed to be stable

  useEffect(() => {
    checkDatabaseHealth();
  }, [checkDatabaseHealth]); // Add checkDatabaseHealth to dependency array

  if (dbStatus.isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Checking database connection...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dbStatus.isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Database className="h-5 w-5" />
              Database Connection Failed
            </CardTitle>
            <CardDescription>
              Unable to connect to the database. Please check your configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                {dbStatus.error || 'Unknown database error'}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Troubleshooting Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Check if Supabase project is created and running</li>
                <li>Verify environment variables are set correctly (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)</li>
                <li>Ensure database schema is initialized</li>
                <li>Check network connectivity</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button onClick={checkDatabaseHealth} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dbStatus.tablesExist) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Database Schema Missing
            </CardTitle>
            <CardDescription>
              Database is connected but required tables are missing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                The database schema needs to be initialized. Please run the setup script.
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Required Actions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Open Supabase Dashboard</li>
                <li>Go to SQL Editor</li>
                <li>Run the schema from `supabase-schema.txt` (or your schema file)</li>
                <li>Verify tables are created</li>
              </ol>
            </div>

            <Button onClick={checkDatabaseHealth} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dbStatus.authWorking) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Authentication Issues
            </CardTitle>
            <CardDescription>
              Database is connected but authentication is not working properly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                There may be issues with authentication configuration (e.g., email templates, allowed redirect URLs).
              </div>
            </div>

            <Button onClick={checkDatabaseHealth} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Everything is working fine
  return (
    <>
      {children}
      {/* Optional: Show a small status indicator when everything is connected */}
      <div className="fixed bottom-4 right-4">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <CheckCircle className="h-4 w-4" />
          Database Connected
        </div>
      </div>
    </>
  );
}

DatabaseErrorHandler.propTypes = {
  children: PropTypes.node.isRequired,
};
