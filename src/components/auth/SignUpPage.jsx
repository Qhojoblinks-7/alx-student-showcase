// src/pages/SignUpPage.jsx
import { Link } from 'react-router-dom';
import AuthForm from './AuthForm'

export function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <AuthForm mode="sign_up" /> {/* Use AuthForm for sign-up */}
      <div className="text-center text-sm text-gray-600 mt-6 space-y-2"> {/* Increased top margin and added vertical spacing for text */}
        <p>
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-600 hover:underline font-medium"> {/* Added font-medium for emphasis */}
            Sign In
          </Link>
        </p>
        <p className="max-w-xs sm:max-w-sm mx-auto text-muted-foreground"> {/* Added max-width for better readability on larger screens */}
          By signing up, you agree to showcase your amazing ALX projects
          and inspire fellow students! 🚀
        </p>
      </div>
    </div>
  );
}
