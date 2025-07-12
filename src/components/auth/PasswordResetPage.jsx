// src/components/PasswordResetPage.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../ui/card';
import { Button } from './../ui/button.jsx';
import { Input } from './../ui/input.jsx';
import { Label } from './../ui/label.jsx';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Mail, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming you use React Router for navigation

/**
 * PasswordResetPage Component
 *
 * Provides an interface for users to request a password reset email.
 */
export function PasswordResetPage() {
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password-confirm` // A new route for confirming reset
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ALX Showcase
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handlePasswordReset} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin bg-gradient-to-r from-blue-600 to-purple-60" />
                  Sending Reset Email...
                </>
              ) : (
                'Send Reset Email'
              )}
            </Button>
          </form>

          {/* Link back to Sign In */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{' '}
            <Link to="/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}