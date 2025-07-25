// src/components/showcase/HeroSection.jsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Github, Linkedin, Mail, Twitter, Phone, FileText } from 'lucide-react'; // Added FileText icon for resume

export const HeroSection = ({
  fullName,
  avatarUrl,
  socialLinks, // { github, linkedin, twitter }
  contactEmail,
  phoneNumber,
  resumeUrl,
  heroHeadline,
  heroSubheading,
tagline = "Welcome to my showcase!"
}) => {

  // Default content for the headline and subheading if props are not provided
  const defaultHeadline = "Crafting Digital Futures with AI & Innovation";
  const defaultSubheading = "Leveraging cutting-edge technologies and intuitive design to build impactful web experiences and intelligent solutions.";

  return (
    <section className="relative flex flex-col justify-center min-h-screen p-6 md:p-12 overflow-hidden bg-background text-foreground">

      {/* --- Sophisticated Animated Background Layer 1 (Subtle, large shapes) --- */}
      {/* These elements are behind the main content and the blur layer, creating depth.
          They use a 'mix-blend-multiply' effect for richer color interaction in dark themes. */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-floating animation-delay-0"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-green-500/20 to-yellow-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-floating animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-red-500/20 to-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-floating animation-delay-4000"></div>
      </div>

      {/* --- "Frozen Glass" Effect (Behind Content, in front of animated background) --- */}
      {/* This layer provides the frosted glass look, applying blur to everything behind it. */}
      <div className="absolute inset-0 z-10 bg-background/60 backdrop-filter backdrop-blur-xl shadow-2xl rounded-xl m-4 md:m-8"></div>

      {/* --- Main Content Area - Responsive Grid Layout --- */}
      {/* This grid holds all the profile information, centered, with a max-width, and a higher z-index. */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 max-w-7xl mx-auto items-center w-full h-full">

        {/* --- Left Column: Avatar with Animated Circles and Core Profile Info --- */}
        <div className="flex flex-col items-center lg:items-start justify-center order-2 lg:order-1 p-4 lg:p-0">
          <div className="relative w-60 h-60 md:w-80 md:h-80 flex items-center justify-center mb-8">
            {/* Larger circle (behind avatar, top-left 45deg) - more subtle, softer blur */}
            <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/15 -top-16 -left-16 rotate-45 transform -translate-x-1/2 -translate-y-1/2 blur-2xl opacity-70 animate-spin-slow"></div>

            {/* Smaller circle (overlaying border, right 135deg) - more subtle, softer blur */}
            <div className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-secondary/20 -bottom-10 -right-10 rotate-135 transform translate-x-1/2 translate-y-1/2 blur-xl opacity-80 animate-spin-fast"></div>

            {/* Avatar component with enhanced styling */}
            <Avatar className="w-60 h-60 md:w-80 md:h-80 z-10 shadow-2xl border-4 border-primary/50 transition-all duration-500 ease-out hover:scale-105 rounded-full overflow-hidden animate-fade-in-up">
              <AvatarImage src={avatarUrl || 'https://github.com/shadcn.png'} alt={fullName || 'User Avatar'} className="object-cover w-full h-full" />
              <AvatarFallback className="text-8xl md:text-9xl font-bold bg-primary/20 text-primary-foreground/80">
                {fullName ? fullName.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User's Name - Prominent and impactful */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 leading-tight tracking-tight drop-shadow-lg animate-fade-in-up" data-animation-delay="100">
            {fullName || 'ALX Innovator'}
          </h1>
          {/* User's Tagline - Clear and concise */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl animate-fade-in-up" data-animation-delay="200">
            {tagline || 'AI-Powered Full-Stack Developer | Crafting Future Solutions'}
          </p>

          {/* Social Links - Elegant and accessible */}
          <div className="flex space-x-6 mt-8 animate-fade-in-up" data-animation-delay="300">
            {socialLinks?.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-foreground hover:text-primary transition-colors duration-300 transform hover:-translate-y-1">
                <Github size={36} />
              </a>
            )}
            {socialLinks?.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-foreground hover:text-primary transition-colors duration-300 transform hover:-translate-y-1">
                <Linkedin size={36} />
              </a>
            )}
            {socialLinks?.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="text-foreground hover:text-primary transition-colors duration-300 transform hover:-translate-y-1">
                <Twitter size={36} />
              </a>
            )}
          </div>
        </div>

        {/* --- Right Column: Headline, Contact Card, Action Buttons --- */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2 p-4 lg:p-0">

          {/* "About Me" Button - Elevated and clearly interactive */}
          <Button
            asChild
            variant="ghost" // Using 'ghost' variant for a minimalist look that stands out on hover
            className="mb-6 self-center lg:self-start text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full px-6 py-3 text-lg transition-all duration-300 animate-slide-in-right animation-delay-200"
          >
            <a href="#about">Learn More About Me →</a>
          </Button>

          {/* Dynamic Headline & Subheading - Larger, bolder, more impactful */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight tracking-tight animate-slide-in-right animation-delay-400 drop-shadow-md">
            {heroHeadline || defaultHeadline}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl animate-slide-in-right animation-delay-600">
            {heroSubheading || defaultSubheading}
          </p>

          {/* Contact Card - Sleek and integrated frosted glass style */}
          <div className="bg-card/70 backdrop-blur-md p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mb-10 border border-border/50 animate-slide-in-right animation-delay-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start">
              {/* Name & Email details */}
              <div className="text-left flex flex-col justify-between h-full">
                <div>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Name</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{fullName || 'ALX Student'}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Email</p>
                  <a href={`mailto:${contactEmail || 'contact@example.com'}`} className="text-primary hover:underline text-lg flex items-center mt-1">
                    <Mail size={16} className="mr-2 opacity-70" /> {contactEmail || 'contact@example.com'}
                  </a>
                </div>
              </div>

              {/* Phone & Social Icons details */}
              <div className="text-left sm:text-right flex flex-col justify-between h-full">
                <div>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Phone</p>
                  <p className="text-xl font-semibold text-foreground mt-1 break-all flex items-center sm:justify-end">
                    <Phone size={16} className="mr-2 opacity-70 sm:order-2" /> {phoneNumber || '+1 (234) 567-8900'}
                  </p>
                </div>
                <div className="flex mt-4 sm:mt-0 space-x-4 sm:justify-end">
                  {socialLinks?.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-foreground hover:text-primary transition-colors duration-300">
                      <Github size={24} />
                    </a>
                  )}
                  {socialLinks?.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-foreground hover:text-primary transition-colors duration-300">
                      <Linkedin size={24} />
                    </a>
                  )}
                  {socialLinks?.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="text-foreground hover:text-primary transition-colors duration-300">
                      <Twitter size={24} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons - prominent and distinct call-to-actions */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-in-right animation-delay-1000">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <a href={`mailto:${contactEmail || 'contact@example.com'}`}>
                <Mail className="mr-2 h-5 w-5" /> Contact Me
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary" // Using 'secondary' variant for a softer look or custom styling
              className="rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <a href={resumeUrl || '#'} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-5 w-5" /> Download My Resume
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};