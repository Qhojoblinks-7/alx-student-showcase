// src/components/layout/AppHeader.jsx
import React from 'react';
import { Button } from '../ui/button'; // Assuming you have Shadcn UI Button installed
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'; // For mobile menu
import { Menu } from 'lucide-react'; // For mobile menu icon

const AppHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-gray-950/80 backdrop-blur-sm shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Branding */}
        <a href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 hover:opacity-80 transition-opacity">
          ALX Showcase
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="/signin"
            className="text-gray-300 hover:text-white transition-colors duration-200 text-lg font-medium"
          >
            Sign In
          </a>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg px-6 py-2 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 text-lg font-medium">
            <a href="/get-started">Get Started</a>
          </Button>
        </nav>

        {/* Mobile Menu (Shadcn UI Sheet) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-l border-gray-700 text-white flex flex-col pt-12">
              <nav className="flex flex-col gap-6 text-xl">
                <a
                  href="/signin"
                  className="hover:text-blue-400 transition-colors duration-200"
                >
                  Sign In
                </a>
                <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg px-6 py-3 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 text-xl font-medium">
                  <a href="/get-started">Get Started</a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;