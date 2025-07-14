// src/pages/SignInPage.jsx
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import  AuthForm  from './AuthForm'; // Import the new AuthForm component
=======
import AuthForm from './AuthForm'; // Import the new AuthForm component
>>>>>>> 6ec6261e759395dd9f49a69591a7d1f20bf29527

export function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <AuthForm mode="sign_in" /> {/* Use AuthForm for sign-in */}
      <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline ">
            Sign Up
          </Link>
        </p>
        <p>
          <Link to="/reset-password" className="text-blue-600 hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}