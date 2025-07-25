// src/components/auth/SignInPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signIn, setError } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // For password toggle and loading spinner

const SignInPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Clear Redux error when component mounts or unmounts
  useEffect(() => {
    dispatch(setError(null));
    return () => {
      dispatch(setError(null));
    };
  }, [dispatch]);

  // Redirection after successful sign-in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard'); // Redirect to dashboard
    }
  }, [user, isLoading, navigate]);

  // Client-side email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    validateEmail(email); // Re-validate just before submission

    if (emailError || !email || !password) {
      return;
    }

    // Dispatch Redux thunk
    dispatch(signIn({ email, password }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 px-4">
      <Card className="w-full max-w-md bg-neutral-900 border border-neutral-700 text-white shadow-lg animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            Sign in to access your ALX Showcase dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-400 text-sm text-center mb-4" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                  onBlur={(e) => validateEmail(e.target.value)} // Validate on blur
                  className={`bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-blue-500 ${emailError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && <p id="email-error" className="text-red-400 text-sm mt-1">{emailError}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 font-semibold text-lg"
              disabled={isLoading || !!emailError || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-center text-sm mt-2">
            <Link to="/forgot-password" className="text-blue-400 hover:underline">
              Forgot Password?
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;