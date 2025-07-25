import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase'; // We need supabase directly for the username lookup

import { fetchUserProfile, selectUserProfile, selectUserProfileLoading, selectUserProfileError } from '../store/slices/profileSlice';
// IMPORTANT CHANGE: Import selectProjectsStatus instead of selectProjectsLoading
import { fetchProjects, selectPublicProjects, selectProjectsStatus, selectProjectsError } from '../store/slices/projectsSlice';
import { HeroSection } from '../components/showcase/HeroSection';
import { TechStackSection } from '../components/showcase/TechStackSection';
import { AboutMeSection } from '../components/showcase/AboutMeSection';
import { SkillsSection } from '../components/showcase/SkillsSection';
import { ProjectsSection } from '../components/showcase/ProjectsSection';
import { AIInsightsSection } from '../components/showcase/AIInsightsSection';
import { ContactSection } from '../components/showcase/ContactSection';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export const PublicShowcasePage = () => {
  // Use a more generic name for the URL parameter, as it could be a UUID or a username/email
  const { userId: profileIdentifier } = useParams();
  const dispatch = useDispatch();

  const userProfile = useSelector(selectUserProfile);
  const profileLoading = useSelector(selectUserProfileLoading);
  const profileError = useSelector(selectUserProfileError);

  // IMPORTANT CHANGE: Use selectProjectsStatus instead of selectProjectsLoading
  const projectsStatus = useSelector(selectProjectsStatus);
  // Derive a boolean loading state from status for convenience in rendering
  const projectsLoading = projectsStatus === 'loading';
  const publicProjects = useSelector(selectPublicProjects);
  const projectsError = useSelector(selectProjectsError);

  useEffect(() => {
    const loadProfileAndProjects = async () => {
      if (!profileIdentifier) {
        console.warn("PublicShowcasePage: No profile identifier provided in URL.");
        dispatch(fetchUserProfile(null)); // Clear profile state if no identifier
        return;
      }

      let actualUserId = null;

      // 1. Check if the profileIdentifier from the URL is already a UUID
      // This regex checks for a standard UUID format.
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profileIdentifier);

      if (isUUID) {
        // If it's a UUID, use it directly
        actualUserId = profileIdentifier;
      } else {
        // If it's not a UUID, assume it's a username or email and try to look it up
        try {
          // IMPORTANT: This assumes you have a 'username' column in your 'user_profiles' table.
          // If you use 'email' as the public identifier, change .eq('username', profileIdentifier) to .eq('email', profileIdentifier)
          // Or use .or() to check both.
          const { data, error } = await supabase
            .from('user_profiles')
            .select('id') // Only need the id (UUID)
            // Try matching by username OR email for flexibility
            .or(`username.eq.${profileIdentifier},email.eq.${profileIdentifier}`)
            .single(); // Expecting one unique profile

          if (error && error.code === 'PGRST116') { // Supabase returns PGRST116 if no rows found
            console.warn(`Profile with identifier '${profileIdentifier}' not found.`);
            dispatch(fetchUserProfile(null)); // Set profile to null to trigger "Not Found" message
            return;
          } else if (error) {
            throw new Error(error.message || `Failed to find user ID for identifier: ${profileIdentifier}`);
          }

          if (data && data.id) {
            actualUserId = data.id; // Found the UUID
          } else {
            // This case should ideally be caught by PGRST116, but as a fallback:
            console.warn(`Could not retrieve user ID for identifier: ${profileIdentifier}.`);
            dispatch(fetchUserProfile(null));
            return;
          }

        } catch (err) {
          console.error("Error looking up user by identifier:", err.message);
          dispatch(fetchUserProfile(null)); // Clear profile state on lookup error
          return;
        }
      }

      // 2. Now that we have the actualUserId (which is a UUID), dispatch fetches
      if (actualUserId) {
        dispatch(fetchUserProfile(actualUserId));
        // Pass the specific userId to fetchProjects to filter for THAT user's public projects
        dispatch(fetchProjects({ userId: actualUserId, filters: { isPublic: true } }));
      } else {
        console.warn("PublicShowcasePage: No valid userId determined for fetching.");
        dispatch(fetchUserProfile(null)); // Fallback to ensure state is clear
      }
    };

    loadProfileAndProjects();
  }, [profileIdentifier, dispatch]); // Re-run effect if profileIdentifier changes

  // --- Render Loading, Error, or Not Found States ---
  // Using projectsStatus here for more granular control if needed, but projectsLoading is derived.
  if (profileLoading || projectsLoading) { // projectsLoading is now derived from projectsStatus
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Skeleton className="w-48 h-48 rounded-full mb-4" />
        <Skeleton className="w-64 h-8 mb-2" />
        <Skeleton className="w-56 h-6 mb-8" />
        <div className="space-y-4 w-full max-w-4xl">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (profileError || projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>
            {profileError || projectsError || "Could not load the user's profile or projects. Please check the identifier or try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <Alert>
          <AlertTitle>Profile Not Found</AlertTitle>
          <AlertDescription>
            The user profile "{profileIdentifier}" does not exist, is not public, or no matching user was found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Destructure userProfile for rendering ---
  const {
    full_name, avatar_url, bio, skills, certifications, achievements,
    ai_portfolio_summary, ai_project_recommendations,
    github_url, linkedin_url, twitter_url, email,
    main_tech_stack = ['React', 'Python', 'JavaScript', 'Tailwind CSS', 'SQL', 'Git', 'Docker', 'AWS']
  } = userProfile;

  // --- Render Profile Sections ---
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-background/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">{full_name}</h1>
        </div>
      </header>

      <main className="pt-16">
        <section id="hero" className="py-20 md:py-32 px-4 max-w-7xl mx-auto">
          <HeroSection
            fullName={userProfile.full_name}
            avatarUrl={userProfile.avatar_url}
            tagline={userProfile.ai_portfolio_summary?.short_tagline} // Reusing for the left side tagline
            socialLinks={{
              github: userProfile.github_url,
              linkedin: userProfile.linkedin_url,
              twitter: userProfile.twitter_url,
            }}
            contactEmail={userProfile.email}
            phoneNumber={userProfile.phone_number || '+1 (234) 567-8900'} // Ensure userProfile has this field
            resumeUrl={userProfile.resume_url || '/path/to/your/resume.pdf'} // Ensure userProfile has this field
            heroHeadline={userProfile.hero_headline || "Your Custom Dynamic Headline"} // Add to user_profiles if dynamic
            heroSubheading={userProfile.hero_subheading || "Your Custom Dynamic Subheading."} // Add to user_profiles if dynamic
          />
        </section>

        <section id="tech-stack" className="py-16 px-4 max-w-7xl mx-auto">
          <TechStackSection techStack={main_tech_stack} />
        </section>

        <section id="about" className="py-20 px-4 max-w-7xl mx-auto bg-card rounded-lg shadow-md mb-20">
          <AboutMeSection bio={bio} />
        </section>

        <section id="skills" className="py-20 px-4 max-w-7xl mx-auto mb-20">
          <SkillsSection
            skills={skills || []}
            certifications={certifications || []}
            achievements={achievements || []}
          />
        </section>

        <section id="projects" className="py-20 px-4 max-w-7xl mx-auto mb-20">
          <ProjectsSection projects={publicProjects} />
        </section>

        <section id="ai-insights" className="py-20 px-4 max-w-7xl mx-auto bg-card rounded-lg shadow-md mb-20">
          <AIInsightsSection
            portfolioSummary={ai_portfolio_summary?.summary}
            projectRecommendations={ai_project_recommendations || []}
          />
        </section>

        <section id="contact" className="py-20 px-4 max-w-7xl mx-auto mb-20">
          <ContactSection
            email={email}
            socialLinks={{ github: github_url, linkedin: linkedin_url, twitter: twitter_url }}
          />
        </section>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>Powered by <a href="#" className="underline hover:text-primary">ALX Showcase</a></p>
      </footer>
    </div>
  );
};