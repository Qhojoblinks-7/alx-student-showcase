const Auth = React.lazy(() =>
  import('@supabase/auth-ui-react').then(module => ({ default: module.Auth }))
)

const ThemeSupa = React.lazy(() =>
  import('@supabase/auth-ui-shared').then(module => ({ default: module.ThemeSupa }))
)

const supabase = React.lazy(() =>
  import('../../lib/supabase').then(module => ({ default: module.supabase }))
)

const Card = React.lazy(() =>
  import('../../components/ui/card').then(module => ({ default: module.Card }))
)
const CardContent = React.lazy(() =>
  import('../../components/ui/card').then(module => ({ default: module.CardContent }))
)
// ...repeat for CardHeader, CardDescription, CardTitle
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
export function AuthForm({ mode = 'sign_in' }) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm"> {/* Reverted card background to white/90 for better contrast with text and buttons */}
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
        <CardDescription className="text-base text-blue"> {/* Added a default text color for description */}
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
                  // Using specific hex color values directly
                  // Example: Tailwind's blue-600 and purple-600 hex codes
                  brand: '#2563EB',        // A shade of blue, similar to Tailwind's blue-600
                  brandAccent: '#7C3AED',  // A shade of purple, similar to Tailwind's purple-600
                  // You can add other custom colors for specific elements if needed
                  // inputBackground: '#FFFFFF',
                  // inputBorder: '#D1D5DB',
                  // inputText: '#1F2937',
                  // messageText: '#EF4444', // For destructive messages
                }
              }
            },
            className: {
              // Overriding default CSS classes with Tailwind classes
              // Use a specific color for anchors, matching your brand colors or a common link color
              anchor: 'text-blue-600 hover:text-blue-700', // Adjusted to use a specific blue from Tailwind
              button: 'bg-blue-600 hover:bg-blue-700 text-white', // Consistent with brand color
              input: 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500', // More specific input styling
              label: 'text-gray-700', // Label styling
              message: 'text-red-500', // Error/success message styling (Tailwind red-500)
              // You might want to add more classes for a complete custom look:
              // container: 'space-y-6',
              // divider: 'text-gray-400',
              // inputDescription: 'text-gray-500',
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