// src/components/auth/SignUpForm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// Importing the signUp async thunk and clearAuthError action from the authSlice
import { signUp, clearAuthError } from '../../store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SignUpForm = () => {
  // Initialize Redux dispatch hook
  const dispatch = useDispatch();
  // Initialize React Router's navigate hook
  const navigate = useNavigate();

  // Select relevant state from the Redux auth slice
  // isLoading: indicates if an auth operation is in progress
  // error: stores any authentication error messages
  // isAuthenticated: indicates if the user is currently authenticated
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Local state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Effect hook to redirect the user if they are already authenticated.
  // This ensures authenticated users don't see the sign-up page.
  React.useEffect(() => {
    if (isAuthenticated) {
      // Use a timeout to ensure the UI has a chance to update before navigation,
      // and to avoid potential race conditions with Supabase's auth listener
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 50); // Small delay
      return () => clearTimeout(timer); // Cleanup the timeout
    }
  }, [isAuthenticated, navigate]); // Dependencies: isAuthenticated and navigate

  // Effect hook to display authentication errors using sonner toasts.
  // It also clears the error from Redux state after showing to prevent re-display.
  React.useEffect(() => {
    if (error) {
      toast.error('Registration Failed', { description: error });
      dispatch(clearAuthError()); // Dispatch action to clear the error state in Redux
    }
  }, [error, dispatch]); // Dependencies: error and dispatch

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Client-side validation checks
    if (!email || !password || !confirmPassword) {
      toast.error('Validation Error', { description: 'Please fill in all fields.' });
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Validation Error', { description: 'Passwords do not match.' });
      return;
    }
    // Basic password strength check (can be enhanced with more complex rules)
    if (password.length < 6) {
      toast.error('Validation Error', { description: 'Password must be at least 6 characters long.' });
      return;
    }

    // Dispatch the signUp async thunk.
    // This thunk (defined in authSlice) will handle the actual call to the Supabase authentication service.
    dispatch(signUp({ email, password }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create your account to start building your showcase.</CardDescription>
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
            <div className="grid gap-2 mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2 mb-6">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {/* Submit button with loading spinner when an auth operation is in progress */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/signin" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;