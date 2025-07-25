import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import TechIcon from '@/assets/icons/TechIcon';

/**
 * Renders a prominent section showcasing the user's main technology stack.
 * This is intended for key technologies the user wants to highlight at a glance.
 *
 * @param {object} props - Component props.
 * @param {string[]} props.techStack - An array of strings representing key technologies (e.g., ['React', 'Python', 'Docker']).
 */
export const TechStackSection = ({ techStack }) => {
  if (!techStack || techStack.length === 0) {
    return null; // Don't render if no tech stack is provided
  }

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto animate-fade-in-up">
      <Card className="p-8 md:p-12 shadow-lg bg-card rounded-lg">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">My Core Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {techStack.map((tech, index) => (
            <Badge
              key={index}
              variant="default" // Use default or primary for prominence
              className="flex items-center gap-2 px-4 py-2 text-lg md:text-xl font-semibold rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 transform hover:scale-105"
            >
              <TechIcon techName={tech} className="h-6 w-6" /> {/* Larger icon for prominence */}
              {tech}
            </Badge>
          ))}
        </div>
      </Card>
    </section>
  );
};