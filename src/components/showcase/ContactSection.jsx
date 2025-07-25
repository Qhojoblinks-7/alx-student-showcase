// src/components/showcase/ContactSection.jsx
import React from 'react';
import { Button } from '../ui/button';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

export const ContactSection = ({ email, socialLinks }) => {
  return (
    <section className="p-8 md:p-12 text-center animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Get In Touch</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
        Have a project in mind, a question, or just want to connect? Feel free to reach out!
      </p>

      <div className="flex flex-col items-center space-y-6">
        {email && (
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <a href={`mailto:${email}`}>
              <Mail className="mr-3 h-5 w-5" /> {email}
            </a>
          </Button>
        )}

        <div className="flex space-x-6">
          {socialLinks?.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors duration-300">
              <Github size={32} />
            </a>
          )}
          {socialLinks?.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors duration-300">
              <Linkedin size={32} />
            </a>
          )}
          {socialLinks?.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors duration-300">
              <Twitter size={32} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};