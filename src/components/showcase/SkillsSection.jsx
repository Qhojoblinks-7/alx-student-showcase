import React from 'react';
import { Badge } from '../ui/badge';
import { Award, CheckCircle } from 'lucide-react'; // For certifications/achievements
import TechIcon from '@/assets/icons/TechIcon';

export const SkillsSection = ({ skills, certifications, achievements }) => {
  return (
    <section className="p-8 md:p-12 animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">My Expertise</h2>

      {/* Skills */}
      <div className="bg-card p-6 rounded-lg shadow-md mb-12">
        <h3 className="text-2xl font-semibold text-foreground mb-6">Skills</h3>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {skills && skills.length > 0 ? (
            skills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-1 px-3 py-1 text-md font-medium border border-primary/20 bg-primary/5 text-primary-foreground/90 hover:bg-primary/10 transition-colors duration-200"
              >
                <TechIcon techName={skill} className="h-4 w-4" /> {/* Use TechIcon here */}
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No skills listed yet.</p>
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-card p-6 rounded-lg shadow-md mb-12">
        <h3 className="text-2xl font-semibold text-foreground mb-6">Certifications</h3>
        <ul className="list-none text-lg text-muted-foreground space-y-2 max-w-3xl mx-auto">
          {certifications && certifications.length > 0 ? (
            certifications.map((cert, index) => (
              <li key={index} className="flex items-center">
                <Award className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                {cert}
              </li>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No certifications listed yet.</p>
          )}
        </ul>
      </div>

      {/* Achievements */}
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-foreground mb-6">Achievements</h3>
        <ul className="list-none text-lg text-muted-foreground space-y-2 max-w-3xl mx-auto">
          {achievements && achievements.length > 0 ? (
            achievements.map((achieve, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                {achieve}
              </li>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No achievements listed yet.</p>
          )}
        </ul>
      </div>
    </section>
  );
};