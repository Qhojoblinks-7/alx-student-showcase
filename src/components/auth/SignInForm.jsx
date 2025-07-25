// src/components/auth/SignInForm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// Import the selectors you need from authSlice
import {
  signIn,
  signInWithGitHub, // <--- Import the new GitHub sign-in thunk
  clearAuthError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '../../store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Loader2, Github } from 'lucide-react'; // <--- Import Github icon
import { toast } from 'sonner';

const SignInForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthLoading); // This refers to general auth loading (email/password)
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  console.log("SignInForm render: isAuthenticated =", isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Effect to redirect if the user is already authenticated
  React.useEffect(() => {
    console.log("SignInForm useEffect: Checking authentication. isAuthenticated =", isAuthenticated);
    if (isAuthenticated) {
      console.log("SignInForm useEffect: Authenticated! Redirecting to /dashboard");
      // Use a timeout to ensure the UI has a chance to update before navigation,
      // and to avoid potential race conditions with Supabase's auth listener
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 50); // Small delay
      return () => clearTimeout(timer); // Cleanup the timeout
    } else {
      console.log("SignInForm useEffect: Not authenticated, or state not yet updated for redirection.");
    }
  }, [isAuthenticated, navigate]);

  // Show error toast if there's an authentication error
  React.useEffect(() => {
    if (error) {
      toast.error('Login Failed', { description: error });
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  // Handler for email/password form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Validation Error', { description: 'Please enter both email and password.' });
      return;
    }

    // Dispatch the email/password sign-in thunk
    dispatch(signIn({ email, password }));
  };

  // Handler for GitHub sign-in
  const handleGitHubSignIn = () => {
    // Dispatch the GitHub sign-in thunk
    dispatch(signInWithGitHub());
    // Note: This will typically cause a redirect, so no local state changes needed here immediately.
    // The App.jsx listener will handle the post-redirect authentication.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2 mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2 mb-6">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Separator for social login */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* GitHub Sign-in Button */}
          <Button
            variant="outline"
            className="w-full flex items-center"
            onClick={handleGitHubSignIn}
            disabled={isLoading} // Disable if any auth operation is in progress
          >
            <Github className="mr-2 h-4 w-4" /> Sign in with GitHub
          </Button>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;