// src/components/sections/FeaturesSection.jsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LayoutDashboard, Github, Brain, Share2, User, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: "Intuitive Portfolio Management",
    description: "Organize your projects with detailed descriptions, technologies, and links effortlessly.",
  },
  {
    icon: Github,
    title: "Seamless GitHub Integration",
    description: "Effortlessly import repositories, including commit history, to populate your portfolio.",
  },
  {
    icon: Brain,
    title: "Intelligent AI Content Generation",
    description: "Generate concise project summaries, work logs, and recommendations from your code.",
  },
  {
    icon: Share2,
    title: "Optimized Social Sharing",
    description: "Tailor project updates and work logs for seamless sharing across social platforms.",
  },
  {
    icon: User,
    title: "Professional User Profiles",
    description: "Create a dedicated, shareable, and visually stunning public profile page.",
  },
  {
    icon: BarChart2,
    title: "Insightful Project Analytics",
    description: "Visualize project distribution, technology usage, and progress over time with rich charts.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-12">
          Unlock Your Potential with ALX Showcase
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-neutral-800/50 border border-neutral-700/70 rounded-xl p-6 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] transform-gpu animate-fade-in-up"
            >
              <CardHeader className="p-0 pb-4">
                <div className="w-14 h-14 bg-blue-400/10 rounded-full flex items-center justify-center mb-4 border border-blue-400/30">
                  <feature.icon className="text-blue-400 w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="text-gray-400 mt-2">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;