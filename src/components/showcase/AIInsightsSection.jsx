// src/components/showcase/AIInsightsSection.jsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'; // Assuming Shadcn Tooltip

export const AIInsightsSection = ({ portfolioSummary, projectRecommendations }) => {
  return (
    <section className="p-8 md:p-12 animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">AI Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* AI-Generated Portfolio Summary */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold">
              AI-Generated Summary
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">This content is AI-generated to provide quick insights and can be managed from your dashboard.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-muted-foreground">A concise overview of your professional profile.</CardDescription>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground leading-relaxed">
            {portfolioSummary || "AI-generated portfolio summary will appear here. This section provides a concise overview of the user's skills and experience based on their projects and profile data."}
          </CardContent>
        </Card>

        {/* AI Project Ideas / Recommendations */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold">
              AI Project Ideas
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">These are AI-generated project recommendations based on your skills and interests, manageable from your dashboard.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-muted-foreground">Suggestions for your next impactful projects.</CardDescription>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground leading-relaxed">
            {projectRecommendations && projectRecommendations.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {projectRecommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p>AI-generated project recommendations will appear here. These insights can help guide future learning and development.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};