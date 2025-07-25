// src/components/showcase/ProjectsSection.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Github, Link as LinkIcon } from 'lucide-react';
import TechIcon from '@/assets/icons/TechIcon';

export const ProjectsSection = ({ projects }) => {
  const [expandedProjects, setExpandedProjects] = useState({});

  const toggleExpand = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  return (
    <section className="p-8 md:p-12 animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">My Portfolio Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <Card
              key={project.id}
              className="group flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary/50"
            >
              <div className="relative overflow-hidden w-full h-48 bg-muted">
                <img
                  src={project.image_url || 'https://via.placeholder.com/600x300?text=Project+Image'}
                  alt={project.title || 'Project Thumbnail'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy" // Lazy load images
                />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl font-semibold text-foreground">{project.title || 'Untitled Project'}</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {expandedProjects[project.id] || (project.ai_summary && project.ai_summary.length < 150)
                    ? project.ai_summary
                    : `${project.ai_summary?.substring(0, 150) || 'No summary available.'}...`}
                  {project.ai_summary && project.ai_summary.length >= 150 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => toggleExpand(project.id)}
                    >
                      {expandedProjects[project.id] ? 'Read Less' : 'Read More'}
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pb-4">
                {project.technologies && project.technologies.length > 0 ? (
                  project.technologies.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 text-sm font-medium"
                    >
                      <TechIcon techName={tech} className="h-4 w-4" /> {/* Use TechIcon here */}
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No Technologies</Badge>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 pt-0">
                {project.live_url && (
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 transition-colors duration-200">
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" /> Live Demo
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button asChild variant="outline" size="sm" className="hover:bg-muted-foreground/10 transition-colors duration-200">
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> GitHub
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground col-span-full">No public projects available yet.</p>
        )}
      </div>
    </section>
  );
};