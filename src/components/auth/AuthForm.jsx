// src/components/AuthForm.jsx
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import PropTypes from 'prop-types';
import { User } from 'lucide-react'; // Import User icon

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
  // --- SUPABASE CLIENT CHECK START ---
  if (!supabase || typeof supabase.auth === 'undefined' || !supabase.auth) {
    // Ensure error message is a string
    console.error("CRITICAL ERROR: Supabase client is not properly initialized or missing its .auth object. Check lib/supabase.js and .env file.");
    return <div className="text-red-600 text-center p-4">Error: Supabase client configuration failed. Please check console.</div>;
  }
  // --- SUPABASE CLIENT CHECK END ---

  // Handle successful sign-up for onboarding
  const handleSignedUp = () => {
    // Set a flag in local storage to indicate a new user has signed up.
    // This flag can then be checked by the Dashboard or a dedicated onboarding component
    // to trigger the first-time user experience.
    localStorage.setItem('isNewUser', 'true');
    console.log('New user signed up! Setting isNewUser flag in localStorage.');
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-lg"> {/* Added rounded-lg */}
      <CardHeader className="text-center space-y-4 pt-6 pb-4"> {/* Adjusted padding */}
        {/* Added icon and branding div */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <User className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ALX Showcase
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground px-4"> {/* Changed text-blue to text-muted-foreground and added px-4 */}
          {mode === 'sign_in'
            ? 'Sign in to your account to continue'
            : 'Create an account to start showcasing your projects'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6"> {/* Adjusted padding */}
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
              anchor: 'text-blue-600 hover:text-blue-700 font-medium', // Added font-medium
              button: 'bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-base font-semibold', // Adjusted padding and font-size
              input: 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 py-2', // Adjusted padding for input
              label: 'text-gray-700',
              message: 'text-red-500',
            }
          }}
          providers={['github', 'google']}
          redirectTo={`${window.location.origin}/dashboard`}
          showLinks={true} /* Changed to true to show links for switching between sign-in/sign-up */
          onSignedUp={handleSignedUp} /* Add onSignedUp callback */
        />
      </CardContent>
    </Card>
  );
}

AuthForm.propTypes = {
  mode: PropTypes.oneOf(['sign_in', 'sign_up', 'forgot_password', 'update_password']),
};
