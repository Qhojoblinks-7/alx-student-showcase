// src/components/sections/HeroSection.jsx
import React from 'react';
import { Button } from '../ui/button'; // Assuming Shadcn UI Button

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center py-20 px-4 overflow-hidden bg-gray-950">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Subtle geometric grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23334155%22%2F%3E%3C%2Fsvg%3E')] bg-[size:20px_20px] pointer-events-none opacity-20 animate-fade-in-slow"></div>

        {/* Animated Gradient Blobs (requires @keyframes blob in global CSS) */}
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 leading-tight drop-shadow-lg animate-slide-up">
          Showcase Your Code, Define Your Future.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in delay-500">
          Transform your GitHub into a professional, AI-powered portfolio.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 mt-8 animate-fade-in delay-1000">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 font-semibold">
            <a href="/get-started">Get Started</a>
          </Button>
          <Button asChild variant="outline" className="border border-blue-500 text-blue-300 bg-transparent hover:bg-blue-900/20 hover:text-white rounded-lg px-8 py-3 text-lg transition-colors duration-300 font-semibold">
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;