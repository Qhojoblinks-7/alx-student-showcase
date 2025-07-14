import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, Database, RefreshCw, CheckCircle } from 'lucide-react';

export function DatabaseErrorHandler({ children }) {
  const [dbStatus, setDbStatus] = useState({
    isConnected: false,
    isChecking: true,
    error: null,
    tablesExist: false,
    authWorking: false
  });

  const checkDatabaseHealth = async () => {
    setDbStatus(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // Test 1: Basic connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Connection failed: ${sessionError.message}`);
      }

      // Test 2: Check if tables exist
      const { data: tablesData, error: tablesError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      const tablesExist = !tablesError || tablesError.code !== 'PGRST116';

      // Test 3: Test authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      // Clean up test user if created
      if (authData.user) {
        await supabase.auth.signOut();
      }

      setDbStatus({
        isConnected: true,
        isChecking: false,
        error: null,
        tablesExist,
        authWorking: !authError || authError.message.includes('already registered')
      });

    } catch (error) {
      setDbStatus({
        isConnected: false,
        isChecking: false,
        error: error.message,
        tablesExist: false,
        authWorking: false
      });
    }
  };

  useEffect(() => {
    checkDatabaseHealth();
  }, []);

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
                <li>Verify environment variables are set correctly</li>
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
                <li>Run the schema from supabase-schema.txt</li>
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
                There may be issues with authentication configuration.
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
      {/* Optional: Show a small status indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          <CheckCircle className="h-4 w-4" />
          Database Connected
        </div>
      </div>
    </>
  );
}