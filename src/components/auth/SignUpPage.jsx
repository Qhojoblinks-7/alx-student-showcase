// src/pages/SignUpPage.jsx
import { Link } from 'react-router-dom';
import { AuthForm } from './AuthForm'

export function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <AuthForm mode="sign_up" /> {/* Use AuthForm for sign-up */}
      <div className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <Link to="/signin" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
      <div className="text-center text-sm text-gray-600 mt-4">
        <p>
          By signing up, you agree to showcase your amazing ALX projects
          and inspire fellow students! 🚀
        </p>
      </div>
    </div>
  );
}