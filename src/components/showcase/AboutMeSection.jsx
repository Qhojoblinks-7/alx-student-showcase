// src/components/showcase/AboutMeSection.jsx
import React from 'react';

export const AboutMeSection = ({ bio }) => {
  return (
    <section className="p-8 md:p-12 animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">About Me</h2>
      <div className="max-w-4xl mx-auto text-lg text-muted-foreground leading-relaxed space-y-4">
        {bio ? (
          bio.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
          ))
        ) : (
          <p>
            Welcome to my professional showcase! I am a dedicated and passionate ALX software engineering student,
            constantly exploring new technologies and building impactful solutions. My journey has equipped me with
            a strong foundation in various programming languages and frameworks, and I thrive on challenges that
            push me to learn and grow. I am eager to contribute to innovative projects and collaborate with
            forward-thinking teams.
          </p>
        )}
      </div>
    </section>
  );
};