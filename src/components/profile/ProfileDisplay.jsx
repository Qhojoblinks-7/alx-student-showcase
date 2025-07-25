import React from 'react';
import PropTypes from 'prop-types';

// UI Components (Shadcn UI)
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { Badge } from '../ui/badge.jsx';

// Icons (Lucide React)
import {
  User,
  Github,
  Linkedin,
  BookOpen,
  Info,
  Trophy,
  Sparkle,
  AlertCircle,
  FolderDot,
  Check,
  Star,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';

// Sub-components
import  ProjectList  from '../projects/ProjectList.jsx'; // Reusing existing ProjectList
import { AIRecommendations } from './AIRecommendations.jsx'; // Import AIRecommendations
import { PortfolioSummary } from './PortfolioSummary.jsx'; // Import PortfolioSummary

/**
 * ProfileDisplay component for the public, read-only professional portfolio showcase view.
 * Displays a user's profile, projects, and AI-generated insights.
 *
 * @param {object} props - Component props.
 * @param {object} props.profile - The profile data object for the user being displayed.
 * @param {Array<object>} props.projects - Array of project objects for the user.
 * @param {boolean} props.loadingProjects - Loading state for projects.
 * @param {string|null} props.projectsError - Error message if projects failed to load.
 */
export function ProfileDisplay({ profile, projects, loadingProjects, projectsError }) {
  // Placeholder for badges (these would ideally come from the profile data)
  const badges = [
    { id: '1', name: 'ALX Graduate', description: 'Completed the ALX Software Engineering program.', icon: <Trophy className="h-6 w-6 text-yellow-500" /> },
    { id: '2', name: 'First Public Project', description: 'Published first public project.', icon: <FolderDot className="h-6 w-6 text-blue-500" /> },
  ];

  // Filter projects to only show public ones in the showcase
  const publicProjects = projects.filter(p => p.is_public);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-inter antialiased">
      {/* Header - Simple and Clean */}
      <header className="sticky top-0 z-20 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ALX Showcase
        </h1>
        {profile?.linkedin_url && (
          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-full px-4 py-2 text-sm sm:text-base border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-800">
              Connect <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black overflow-hidden">
        {/* Subtle background gradients/blobs can be reused here from LandingPage if desired */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-blue-400 dark:border-blue-600 shadow-xl transition-all duration-300 hover:scale-105">
            <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'ALX'}`} alt={`${profile?.full_name}'s Avatar`} />
            <AvatarFallback className="text-5xl font-bold bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AL'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {profile?.full_name || "ALX Learner's Name"}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
            {/* AI-generated summary or impactful tagline */}
            {profile?.ai_portfolio_summary || profile?.bio || "Innovating solutions at ALX, passionate about [Key Skill] and [Key Interest]."}
          </p>
          <div className="flex justify-center gap-4 mb-8">
            {profile?.github_username && (
              <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <Github className="h-6 w-6" />
                </Button>
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-300 dark:border-gray-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <Linkedin className="h-6 w-6" />
                </Button>
              </a>
            )}
          </div>
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {badges.map((badge) => (
                <Badge key={badge.id} className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                  {badge.icon && React.cloneElement(badge.icon, { className: 'h-4 w-4 mr-1' })}
                  {badge.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="w-full max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column (Desktop - About, Skills, Certs, Achievements, AI Summary) */}
        <div className="lg:col-span-1 space-y-10">
          {/* About Me Section */}
          <Card className="p-6 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" /> About Me
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 dark:text-gray-300 leading-relaxed">
              {profile?.bio || "A passionate ALX learner dedicated to building impactful software solutions. My journey through the ALX program has equipped me with a strong foundation in problem-solving, data structures, algorithms and hands-on experience in various technologies. I thrive on tackling complex challenges and continuously expanding my skill set to create innovative and efficient applications."}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="p-6 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" /> Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-wrap gap-2">
              {profile?.skills?.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <Badge key={index} className="px-4 py-1.5 rounded-full bg-blue-500 text-white dark:bg-blue-700 dark:text-blue-100 text-sm font-medium">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Certifications Section */}
          <Card className="p-6 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-500" /> Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {profile?.certifications?.length > 0 ? (
                profile.certifications.map((cert, index) => (
                  <p key={index} className="text-gray-700 dark:text-gray-300 text-base flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {cert}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No certifications listed yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="p-6 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-purple-500" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {profile?.achievements?.length > 0 ? (
                profile.achievements.map((achievement, index) => (
                  <p key={index} className="text-gray-700 dark:text-gray-300 text-base flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" /> {achievement}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No achievements listed yet.</p>
              )}
            </CardContent>
          </Card>

          {/* AI-Generated Portfolio Summary - Now using PortfolioSummary component */}
          <PortfolioSummary
            summary={profile?.ai_portfolio_summary}
            isLoading={false} // In read-only view, AI generation isn't triggered here
            onRegenerate={() => toast.info('Regeneration is available in your profile editing settings.')}
          />
        </div>

        {/* Right Column (Desktop - Portfolio Projects, AI Recommendations) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Portfolio Projects Section */}
          <Card className="p-6 shadow-md rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <FolderDot className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Portfolio Projects
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                A selection of my key projects, highlighting my skills and contributions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* ProjectList in read-only mode */}
              <ProjectList
                projects={publicProjects} // Pass only public projects
                loading={loadingProjects}
                error={projectsError}
                onEdit={null} // Disable edit button in public view
                onShare={null} // Disable share button in public view
                filters={{}} // Filters are not applicable for display here, or can be pre-applied
                isPublicView={true} // Crucial prop to adjust ProjectList rendering
              />
              {publicProjects.length === 0 && !loadingProjects && !projectsError && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                  This user has not added any public projects yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI-Powered Project Recommendations - Now using AIRecommendations component */}
          <AIRecommendations
            recommendations={profile?.ai_recommendations || []}
            isLoading={false} // In read-only view, AI generation isn't triggered here
            onRegenerate={() => toast.info('Regeneration is available in your profile editing settings.')}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 dark:bg-gray-900 py-6 sm:py-8 text-gray-300 text-center text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p>&copy; {new Date().getFullYear()} ALX Showcase. All rights reserved.</p>
          <p className="mt-1 sm:mt-2">Built with passion for the ALX Community.</p>
        </div>
      </footer>
    </div>
  );
}

ProfileDisplay.propTypes = {
  profile: PropTypes.object,
  projects: PropTypes.array.isRequired,
  loadingProjects: PropTypes.bool.isRequired,
  projectsError: PropTypes.string,
};
ProfileDisplay.defaultProps = {
  profile: null,
  projectsError: null,
};
