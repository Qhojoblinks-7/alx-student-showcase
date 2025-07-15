// src/pages/SignInPage.jsx
import { Link } from 'react-router-dom';
import AuthForm from './AuthForm.jsx'; // Corrected import path

export function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <AuthForm mode="sign_in" /> {/* Use AuthForm for sign-in */}
      <div className="text-center text-sm text-gray-600 mt-6 space-y-2"> {/* Increased top margin and added vertical spacing for text */}
        <p className="max-w-xs sm:max-w-sm mx-auto text-muted-foreground"> {/* Added max-width for better readability on larger screens */}
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-medium"> {/* Added font-medium for emphasis */}
            Sign Up
          </Link>
        </p>
        <p className="max-w-xs sm:max-w-sm mx-auto text-muted-foreground"> {/* Added max-width for better readability on larger screens */}
          <Link to="/reset-password" className="text-blue-600 hover:underline font-medium"> {/* Added font-medium for emphasis */}
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
