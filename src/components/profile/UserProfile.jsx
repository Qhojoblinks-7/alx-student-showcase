import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom'; // Import useParams
import { supabase, subscribeToProjectChanges, backupProjectData, fetchUserBadges, awardBadge } from '../../lib/supabase.js';
import { useDispatch } from 'react-redux'; // Import useDispatch

// Import Redux thunks from profileSlice
import {
  fetchUserProfile,
  updateUserProfile,
  regeneratePortfolioInsights,
triggerAIProjectContent,
uploadAvatar} from '../../store/slices/profileSlice.js';
// Import uploadAvatar from authSlice (assuming it handles avatar uploads)

// UI Components (Shadcn UI)
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx'; // Keep Badge for badges section
import { toast } from 'sonner';

// Icons (Lucide React)
import { Loader2, BookOpen, Plus, Trophy, FolderDot } from 'lucide-react'; // Keep necessary icons
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog.jsx'; // Import Dialog components

// Sub-components
import  ProjectList  from '../projects/ProjectList.jsx'; // Import the ProjectList component
import  ProfileForm  from './ProfileForm.jsx'; // Import the ProfileForm component for editing
import { ProfileDisplay } from './ProfileDisplay.jsx'; // Import the ProfileDisplay component for public view
import { openShareProjectModal } from '@/store/slices/uiSlice.js';
import { useAppSelector } from '@/store/selectors.js';


export function UserProfile() {
  const dispatch = useDispatch();
  const { user: currentUser, isLoading: isLoadingAuth } = useAuth(); // Get current user and auth loading state
  const { username: usernameParam } = useParams(); // Get username from URL for public showcase

  // Get profile state from Redux store
  const {
    userProfile: profile,
    isLoading: isLoadingProfile, // Loading state for fetching profile
    isUpdating, // Loading state for updating profile
    isGeneratingSummary, // Loading state for AI summary
    isGeneratingRecommendations, // Loading state for AI recommendations
    error: profileError, // Error for profile operations
  } = useAppSelector((state) => state.profile|| '');

  const [badges, setBadges] = useState([]); // Initialize as empty, will be fetched
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Stores the project being edited

  // Determine if the current view is the owner's editable profile or a public showcase
  const isOwnProfile = !usernameParam || (currentUser && currentUser.user_metadata?.github_username === usernameParam);

  const fetchProfileAndProjects = useCallback(async () => {
    if (isLoadingAuth) {
      // Wait for auth to initialize before fetching profile data
      return;
    }

    let identifier = null;
    if (isOwnProfile) {
      identifier = currentUser?.id;
      if (!identifier) {
        // If current user is not authenticated, and it's own profile, show error
        toast.error('User not authenticated. Please sign in to view your profile.');
        return;
      }
    } else {
      identifier = { username: usernameParam };
      if (!usernameParam) {
        toast.error('No username provided for public profile view.');
        return;
      }
    }

    try {
      // Dispatch fetchUserProfile thunk
      await dispatch(fetchUserProfile(identifier)).unwrap();

      // Fetch user's projects for the portfolio section (using the fetched profile's ID)
      const targetUserIdForProjects = isOwnProfile ? currentUser?.id : profile?.id; // Use current user ID or fetched profile ID
      if (targetUserIdForProjects) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', targetUserIdForProjects)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching portfolio projects:', String(projectsError));
          toast.error('Failed to load portfolio projects: ' + (projectsError.message || 'Unknown error'));
        } else if (projectsData) {
          // Update the profile state with portfolio projects (local to UserProfile component)
          // This is a temporary local state update for projects.
          // Ideally, projects would be managed by a separate 'projects' slice and selected here.
          // For now, we'll directly set it to the profile object for display.
          // Note: This won't update the Redux `userProfile.portfolio` directly.
          // If `userProfile` needs to include `portfolio` from Redux, `fetchUserProfile` thunk
          // would need to fetch projects as well, or you'd use `useAppSelector` for projects.
          // For simplicity, we'll keep `profile.portfolio` as a direct property of the local `profile` state.
          // If `profile` is from Redux, you'd merge projects into it.
          // For now, let's assume `profile` from Redux doesn't include `portfolio` directly,
          // and `ProjectList` takes `projects` as a prop.
          // We'll use a local state for `portfolio` for `ProfileDisplay` and `ProfileForm` if needed.
          // However, `ProfileForm` takes `initialProfileData` which is the Redux `profile`.
          // `ProfileDisplay` takes `profile` and `projects` separately.
          // So, we need to pass `projectsData` to `ProfileDisplay`.
          // For `ProfileForm`, the `initialProfileData` will be the Redux `profile`.
        }
      }
    } catch (error) {
      console.error('Unexpected error during profile/projects fetch:', String(error));
      toast.error('An unexpected error occurred while loading profile data.');
    }
  }, [currentUser, isLoadingAuth, isOwnProfile, usernameParam, dispatch, profile?.id]); // Added profile?.id to dependencies

  useEffect(() => {
    fetchProfileAndProjects();
  }, [fetchProfileAndProjects]);

  // Real-time listener for project changes (only for the current user's projects)
  useEffect(() => {
    if (!currentUser?.id) return; // Only listen for changes if user is logged in

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${currentUser.id}` },
        (payload) => {
          console.log('Real-time project update:', payload);
          // Re-fetch projects to ensure consistency, but only if it's the current user's project
          if (payload.new?.user_id === currentUser.id || payload.old?.user_id === currentUser.id) {
            fetchProfileAndProjects();
            toast.info(`Project ${payload.eventType.toLowerCase()}d: ${payload.new?.title || payload.old?.title}`);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, fetchProfileAndProjects]);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        // Load badges for the displayed profile's user ID
        const targetUserIdForBadges = isOwnProfile ? currentUser?.id : profile?.id;

        if (!targetUserIdForBadges) {
          console.warn("User ID not available to load badges.");
          return;
        }
        const userBadges = await fetchUserBadges(targetUserIdForBadges);
        if (userBadges && JSON.stringify(userBadges) !== JSON.stringify(badges)) {
          setBadges(userBadges);
        }
      } catch (error) {
        toast.error('Failed to load badges.');
        console.error('Error loading badges:', String(error));
      }
    };

    // Only load badges if profile data is loaded and a user ID is available
    if (!isLoadingProfile && (isOwnProfile ? currentUser : profile?.id)) {
      loadBadges();
    }
  }, [isLoadingProfile, isOwnProfile, currentUser, profile?.id, badges]);

  // Callback for ProfileForm save success
  const handleProfileSaveSuccess = useCallback(() => {
    toast.success('Profile updated successfully!');
    // No need to re-fetch here, Redux state will be updated by updateUserProfile.fulfilled
  }, []);

  // Callback for ProfileForm save error
  const handleProfileSaveError = useCallback((errorMessage) => {
    toast.error('Failed to update profile: ' + errorMessage);
  }, []);

  const handleBackup = async () => {
    try {
      if (!currentUser || !currentUser.id) {
        toast.error('User not authenticated. Cannot backup data.');
        return;
      }
      const backupData = {
        user_id: currentUser.id,
        projects: profile.portfolio, // Assuming portfolio is part of profile from Redux or passed down
        profile_data: {
          full_name: profile.full_name,
          alx_id: profile.alx_id,
          github_username: profile.github_username,
          linkedin_url: profile.linkedin_url,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          certifications: profile.certifications,
          skills: profile.skills,
          achievements: profile.achievements,
          ai_portfolio_summary: profile.ai_portfolio_summary,
          ai_recommendations: profile.ai_recommendations,
        }
      };
      await backupProjectData(backupData);
      toast.success('Project data backed up successfully!');
    } catch (error) {
      console.error('Error backing up project data:', String(error));
      toast.error('Failed to back up project data.');
    }
  };

  // Handlers for opening/closing ProjectForm (only for owner's profile)
  const handleOpenAddProjectForm = () => {
    setEditingProject(null);
    setIsProjectFormOpen(true);
  };

  const handleEditProjectForm = (project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleProjectFormSuccess = (newOrUpdatedProject) => {
    fetchProfileAndProjects(); // Re-fetch profile to ensure portfolio is updated with latest data from DB
    setIsProjectFormOpen(false);
    setEditingProject(null);
  };

  const handleProjectFormCancel = () => {
    setIsProjectFormOpen(false);
    setEditingProject(null);
  };

  const handleShareProject = (project) => {
    dispatch(openShareProjectModal({ modalName: 'shareProject', data: project }));
    toast.info(`Share functionality triggered for project: ${project.title}`);
  };

  const handleAwardBadge = async (badge) => {
    try {
      if (!currentUser || !currentUser.id) {
        toast.error('User not authenticated. Cannot award badge.');
        return;
      }
      await awardBadge(currentUser.id, badge);
      setBadges((prev) => [...prev, badge]); // Optimistically update UI
      toast.success(`Badge awarded: ${badge.name}`);
    } catch (error) {
      console.error('Error awarding badge:', String(error));
      toast.error('Failed to award badge.');
    }
  };

  if (isLoadingProfile || isLoadingAuth) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-sm rounded-lg">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  // If profile is null after loading and it's own profile, it means no profile exists yet.
  // We can show a message or redirect to a profile creation page.
  if (isOwnProfile && !profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-sm rounded-lg">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
          <p className="text-muted-foreground mb-4">
            It looks like you haven't set up your profile yet.
          </p>
          {/* You might want to automatically open the ProfileForm here, or provide a button */}
          <Button onClick={() => toast.info('Profile creation form will open here.')}>
            Create My Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render based on whether it's the owner's profile or a public view
  return (
    <div className="w-full"> {/* Added w-full to the outermost div */}
      {isOwnProfile ? (
        <>
          <ProfileForm
            initialProfileData={profile}
            userEmail={currentUser?.email}
            isUpdating={isUpdating}
            isUploadingAvatar={false} // This should come from authSlice if implemented
            isGeneratingSummary={isGeneratingSummary}
            isGeneratingRecommendations={isGeneratingRecommendations}
            onSaveSuccess={handleProfileSaveSuccess}
            onSaveError={handleProfileSaveError}
            onUpdateProfile={(data) => dispatch(updateUserProfile(data))}
            onUploadAvatar={({ userId, file }) => dispatch(uploadAvatar({ userId, file }))}
            onGenerateSummary={(profileData) => dispatch(generateAIPortfolioSummary(profileData))}
            onGenerateRecommendations={(profileData) => dispatch(generateAIProjectRecommendations(profileData))}
          />

          {/* Section: Portfolio (Editable for owner) */}
          <Card className="w-full p-4 sm:p-6 shadow-sm rounded-lg mt-8">
            <CardHeader className="mb-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-yellow-500" /> Portfolio
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-auto flex items-center gap-1"
                  onClick={handleOpenAddProjectForm}
                >
                  <Plus className="h-4 w-4" /> Add Project
                </Button>
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Manage your ALX projects and showcase your work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectList
                projects={profile?.portfolio || []} // Pass projects from profile
                loading={isLoadingProfile} // Use profile loading state
                error={profileError} // Use profile error state
                onEdit={handleEditProjectForm}
                onShare={handleShareProject}
                filters={{}}
              />
              {(profile?.portfolio?.length === 0 && !isLoadingProfile && !profileError) && (
                <p className="text-center text-muted-foreground mt-4">
                  No projects added yet. Click "Add Project" to get started!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Section: Badges (Editable for owner, though badges are awarded by system) */}
          <Card className="w-full p-4 sm:p-6 shadow-sm rounded-lg mt-8">
            <CardHeader className="mb-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" /> Badges
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Recognitions and achievements earned through your ALX journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
                      {badge.icon && React.cloneElement(badge.icon, { className: 'h-8 w-8 text-yellow-500' })}
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{badge.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">No badges awarded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Backup Button - Only for owner */}
          <div className="w-full flex justify-center mt-8">
            <Button onClick={handleBackup} className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg shadow-sm transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
              Back Up Project Data
            </Button>
          </div>

          {/* Project Form Dialog (only for owner) */}
          <Dialog open={isProjectFormOpen} onOpenChange={handleProjectFormCancel}>
            <DialogContent className="max-w-4xl p-6">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              </DialogHeader>
              <ProjectForm
                projectId={editingProject?.id}
                initialData={editingProject}
                onSuccess={handleProjectFormSuccess}
                onCancel={handleProjectFormCancel}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        // Public Profile View
        <ProfileDisplay
          profile={profile}
          projects={profile?.portfolio || []} // Pass public projects from profile
          loadingProjects={isLoadingProfile}
          projectsError={profileError}
        />
      )}
    </div>
  );
}

UserProfile.propTypes = {
  // No specific props for this component, as it manages its own state
};
UserProfile.defaultProps = {
  // Default props can be defined here if needed
};
export default UserProfile;