import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../ui/card';
import { Button } from './../ui/button.jsx';
import { Input } from './../ui/input.jsx';
import { Label } from './../ui//label.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './../ui/tabs.jsx';
import { supabase } from '../../lib/supabase'; // Assuming your Supabase client is initialized here
import { toast } from 'sonner'; // For displaying notifications
import { Eye, EyeOff, Github, Mail, Lock, User, Loader2 } from 'lucide-react'; // Icons

/**
 * Auth Component
 *
 * Provides a user authentication interface with sign-in, sign-up, password reset,
 * and OAuth options using Supabase.
 *
 * @param {object} props - The component properties.
 * @param {string} [props.redirectTo='/dashboard'] - The path to redirect to after successful authentication.
 */
export function Auth({ redirectTo = '/dashboard' }) {
  // State for managing loading indicators during async operations
  const [loading, setLoading] = useState(false);
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State for controlling the active tab in the authentication form
  const [activeTab, setActiveTab] = useState('signin');

  // State for sign-in form data
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // State for sign-up form data
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  // State for password reset email input
  const [resetEmail, setResetEmail] = useState('');

  /**
   * Handles the sign-in process.
   * Prevents default form submission, validates input, and attempts to sign in
   * the user using Supabase. Displays toast notifications for success or error.
   * @param {Event} e - The form submission event.
   */
  const handleSignIn = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Client-side validation
    if (!signInData.email || !signInData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        throw error; // Throw error to be caught by catch block
      }

      toast.success('Welcome back!');
      // Redirection after successful sign-in is typically handled by
      // a Supabase auth state change listener in your main application setup.
    } catch (error) {
      console.error('Sign in error:', error);
      // Display a user-friendly error message
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  /**
   * Handles the sign-up process.
   * Prevents default form submission, validates input (including password match and length),
   * and attempts to create a new user account with Supabase.
   * Displays toast notifications and handles email verification.
   * @param {Event} e - The form submission event.
   */
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Client-side validation for sign-up
    if (!signUpData.email || !signUpData.password || !signUpData.fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName, // Store full name in user metadata
          },
          // Redirect URL after email verification
          emailRedirectTo: `${window.location.origin}${redirectTo}`
        }
      });

      if (error) {
        throw error; // Throw error to be caught by catch block
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email for a verification link');
      } else {
        toast.success('Account created successfully!');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  /**
   * Handles the password reset process.
   * Prevents default form submission, validates email input, and sends a password
   * reset email using Supabase.
   * Displays toast notifications.
   * @param {Event} e - The form submission event.
   */
  const handlePasswordReset = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Client-side validation
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        // Redirect URL after the user clicks the reset link in their email
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error; // Throw error to be caught by catch block
      }

      toast.success('Password reset email sent! Check your inbox.');
      setResetEmail(''); // Clear the email input field
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  /**
   * Handles OAuth (social) sign-in.
   * Initiates the OAuth flow with the specified provider (e.g., 'github', 'google').
   * Displays toast notifications for errors.
   * @param {'github' | 'google'} provider - The OAuth provider to use.
   */
  const handleOAuthSignIn = async (provider) => {
    setLoading(true); // Show loading indicator
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Redirect URL after successful OAuth authentication
          redirectTo: `${window.location.origin}${redirectTo}`
        }
      });

      if (error) {
        throw error; // Throw error to be caught by catch block
      }
      // Supabase handles the redirection for OAuth, so no success toast needed here directly.
    } catch (error) {
      console.error('OAuth error:', error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false); // Hide loading indicator if an error occurs before redirect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          {/* Application Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          {/* Application Title */}
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ALX Showcase
          </CardTitle>
          {/* Application Description */}
          <CardDescription className="text-base">
            Share your coding journey with the ALX community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Authentication Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            {/* Sign In Tab Content */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                {/* Email Input for Sign In */}
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@alxswe.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Input for Sign In */}
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"} // Toggle password visibility
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    {/* Button to toggle password visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-60" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab Content */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Full Name Input for Sign Up */}
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email Input for Sign Up */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@alxswe.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Input for Sign Up */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 6 chars)"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      required
                    />
                    {/* Button to toggle password visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input for Sign Up */}
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Create Account Button */}
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-60" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Password Reset Tab Content */}
            <TabsContent value="reset" className="space-y-4">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {/* Email Input for Password Reset */}
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Send Reset Email Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Email...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* OAuth Providers Section */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* GitHub OAuth Button */}
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>

              {/* Google OAuth Button */}
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="w-full"
              >
                {/* Google SVG Icon */}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center text-sm text-gray-600">
            <p>
              By signing up, you agree to showcase your amazing ALX projects
              and inspire fellow students! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// PropTypes for type-checking the component's props
Auth.propTypes = {
  redirectTo: PropTypes.string
};