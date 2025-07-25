// src/components/layout/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-gray-950/80 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Branding */}
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          ALX Showcase
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/signin" className="text-gray-300 hover:text-white transition-colors duration-200">
            Sign In
          </a>
          <a href="/get-started" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
            Get Started
          </a>
        </nav>

        {/* Mobile Menu Icon (Placeholder) */}
        <div className="md:hidden">
          {/* We'll use a Shadcn UI Sheet/Dialog later for the mobile menu */}
          <button className="text-gray-300 hover:text-white">
            {/* Lucide React Menu icon goes here */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;