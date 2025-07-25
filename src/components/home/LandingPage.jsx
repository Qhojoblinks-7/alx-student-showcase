// src/components/LandingPage.jsx
import React from 'react';
import { Button } from '../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../upgrade/store/slices/authSlice';
import { toast } from 'sonner'; // Import toast for notifications
import HeroSection from '../sections/HeroSection';
import FeaturesSection from '../sections/FeaturesSection';
import CallToActionSection from '../sections/CallToActionSection';
import Footer from '../layout/Footer';
import Header from '../layout/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-inter antialiased">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;