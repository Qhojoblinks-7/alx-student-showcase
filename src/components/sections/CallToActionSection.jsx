// src/components/sections/CallToActionSection.jsx
import React from 'react';
import { Button } from '../ui/button'; // Assuming Shadcn UI Button

const CallToActionSection = () => {
  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-gray-900 to-black text-white text-center animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-300 drop-shadow-lg">
          Ready to Elevate Your Portfolio?
        </h2>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg px-10 py-4 text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 font-semibold">
          <a href="/get-started">Get Started</a>
        </Button>
      </div>
    </section>
  );
};

export default CallToActionSection;