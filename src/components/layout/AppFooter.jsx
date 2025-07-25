// src/components/layout/AppFooter.jsx
import React from 'react';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-neutral-900 py-6 px-4 text-gray-500 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {currentYear} ALX Showcase. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="/privacy-policy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="hover:text-white transition-colors duration-200">
            Terms of Service
          </a>
        </div>
        {/* Optional: Add social media links here with Lucide React icons */}
      </div>
    </footer>
  );
};

export default AppFooter;