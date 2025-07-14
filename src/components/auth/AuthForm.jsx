// src/components/AuthForm.jsx
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import PropTypes from 'prop-types';

/**
 * AuthForm Component
 *
 * A wrapper component that renders the Supabase Auth UI forms for sign-in or sign-up.
 * It integrates with ShadCN UI Cards for consistent styling and provides basic branding.
 *
 * @param {object} props - The component properties.
 * @param {'sign_in' | 'sign_up' | 'forgot_password' | 'update_password'} [props.mode='sign_in'] - The specific authentication view to display.
 */
export default function AuthForm({ mode = 'sign_in' }) {
  // --- DEBUG LOGS START ---
  console.log('--- AuthForm Debug Info (with Console Logs) ---');
  console.log('1. supabase client:', supabase);
  console.log('   Is supabase truthy?', !!supabase);
  console.log('   Does supabase have .auth?', !!supabase?.auth);
  console.log('2. ThemeSupa:', ThemeSupa);
  console.log('   Is ThemeSupa truthy?', !!ThemeSupa);
  console.log('   Type of ThemeSupa:', typeof ThemeSupa);
  console.log('3. mode prop:', mode);
  console.log('--- End AuthForm Debug Info ---');
  // --- DEBUG LOGS END ---

  // --- SUPABASE CLIENT CHECK START ---
  if (!supabase || typeof supabase.auth === 'undefined' || !supabase.auth) {
    console.error("CRITICAL ERROR: Supabase client is not properly initialized or missing its .auth object. Check lib/supabase.js and .env file.");
    return <div className="text-red-600 text-center p-4">Error: Supabase client configuration failed. Please check console.</div>;
  }
  // --- SUPABASE CLIENT CHECK END ---

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        {/*
          Consider adding an icon or logo here for better branding, e.g.:
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="h-8 w-8 text-white" /> {/* Make sure to import User icon from lucide-react if used
          </div>
        */}
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ">
          ALX Showcase
        </CardTitle>
        <CardDescription className="text-base text-blue">
          {mode === 'sign_in'
            ? 'Sign in to your account to continue'
            : 'Create an account to start showcasing your projects'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          view={mode}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563EB',
                  brandAccent: '#7C3AED',
                }
              }
            },
            className: {
              anchor: 'text-blue-600 hover:text-blue-700',
              button: 'bg-blue-600 hover:bg-blue-700 text-white',
              input: 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500',
              label: 'text-gray-700',
              message: 'text-red-500',
            }
          }}
          providers={['github', 'google']}
          redirectTo={`${window.location.origin}/dashboard`}
          showLinks={false}
        />
      </CardContent>
    </Card>
  );
}

AuthForm.propTypes = {
  mode: PropTypes.oneOf(['sign_in', 'sign_up', 'forgot_password', 'update_password']),
};