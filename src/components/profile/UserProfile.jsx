import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase, subscribeToProjectChanges, backupProjectData, fetchUserBadges, awardBadge } from '../../lib/supabase.js';
import { getProjectRecommendations, generateProjectSummary } from '../../lib/ai-service.js';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { toast } from 'sonner';
import { Loader2, User, Github, Linkedin, BookOpen, Image, Info, Trophy, Star, Link as LinkIcon, Plus, Edit2 } from 'lucide-react'; // Added Plus and Edit2 icons
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog.jsx'; // Import Dialog components
import { ProjectForm } from '../projects/ProjectForm.jsx'; // Import the ProjectForm component
import { ProjectList } from '../projects/ProjectList.jsx'; // Import the ProjectList component

export function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    alx_id: '',
    github_username: '',
    linkedin_url: '',
    bio: '',
    avatar_url: '',
    certifications: [],
    skills: [],
    achievements: [],
    portfolio: [], // This will now store full project objects from the 'projects' table
  });
  const [badges, setBadges] = useState([
    { id: 1, name: 'Top Contributor', description: 'Awarded for contributing 10+ projects', icon: <Trophy className="h-8 w-8 text-yellow-500" /> },
    { id: 2, name: 'Most Endorsed', description: 'Received 50+ endorsements', icon: <Star className="h-8 w-8 text-blue-500" /> },
  ]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState('');

  // State for ProjectForm modal
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Stores the project being edited

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 means no rows found (new user)
        console.error('Error fetching profile:', String(userError)); // Explicitly stringify error for console
        toast.error('Failed to load profile: ' + (userError.message || 'Unknown error'));
        setProfile(prev => ({ // Reset to empty if error, but keep existing portfolio if already loaded
          ...prev,
          full_name: '', alx_id: '', github_username: '', linkedin_url: '', bio: '', avatar_url: '',
          certifications: [], skills: [], achievements: [],
        }));
      } else if (userData) {
        setProfile(prev => ({
          ...prev,
          full_name: userData.full_name || '',
          alx_id: userData.alx_id || '',
          github_username: userData.github_username || '',
          linkedin_url: userData.linkedin_url || '',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
          certifications: userData.certifications || [],
          skills: userData.skills || [],
          achievements: userData.achievements || [],
        }));
      }

      // Fetch user's projects for the portfolio section
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*') // Select all fields for project details
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching portfolio projects:', String(projectsError)); // Explicitly stringify error for console
        toast.error('Failed to load portfolio projects: ' + (projectsError.message || 'Unknown error'));
        setProfile(prev => ({ ...prev, portfolio: [] })); // Clear portfolio on error
      } else if (projectsData) {
        setProfile(prev => ({ ...prev, portfolio: projectsData }));
      }

    } catch (error) {
      console.error('Unexpected error during profile/projects fetch:', String(error)); // Explicitly stringify error for console
      toast.error('An unexpected error occurred while loading profile data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' }, // Listen to all events for projects
        (payload) => {
          console.log('Real-time project update:', payload);
          // Re-fetch projects or update state based on payload
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchProfile(); // Re-fetch to ensure consistency
            toast.info(`Project ${payload.eventType.toLowerCase()}d: ${payload.new?.title || payload.old?.title}`);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchProfile]); // Depend on fetchProfile to re-run if needed

  useEffect(() => {
    const loadBadges = async () => {
      try {
        if (!user || !user.id) {
          console.warn("User not available to load badges.");
          return;
        }
        const userBadges = await fetchUserBadges(user.id);
        // Only update if data is different or if there's new data
        if (userBadges && JSON.stringify(userBadges) !== JSON.stringify(badges)) {
          setBadges(userBadges);
        }
      } catch (error) {
        toast.error('Failed to load badges.');
        console.error('Error loading badges:', String(error)); // Explicitly stringify error for console
      }
    };

    if (user) {
      loadBadges();
    }
  }, [user, badges]); // Added badges to dependency array to prevent infinite loop

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save your profile.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email, // Ensure email is also passed for upsert
          ...profile,
          // Ensure arrays are stored as JSON if they are not native Postgres array types
          certifications: profile.certifications,
          skills: profile.skills,
          achievements: profile.achievements,
          // portfolio is handled by the projects table, not directly in user profile upsert
          // avatar_url might need special handling for file uploads, assuming URL for now
        }, { onConflict: 'id' }); // Use onConflict: 'id' for upserting by user ID

      if (error) {
        console.error('Supabase update profile error:', String(error)); // Explicitly stringify error for console
        throw error;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', String(error)); // Explicitly stringify error for console
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      if (!user || !user.id) {
        toast.error('User not authenticated. Cannot backup data.');
        return;
      }
      const backupData = {
        user_id: user.id,
        // Ensure portfolio is correctly structured for backup, e.g., JSON stringified if complex
        projects: profile.portfolio, // This will backup the full project objects
        profile_data: { // Include profile data in backup
          full_name: profile.full_name,
          alx_id: profile.alx_id,
          github_username: profile.github_username,
          linkedin_url: profile.linkedin_url,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          certifications: profile.certifications,
          skills: profile.skills,
          achievements: profile.achievements,
        }
      };
      await backupProjectData(backupData);
      toast.success('Project data backed up successfully!');
    } catch (error) {
      console.error('Error backing up project data:', String(error)); // Explicitly stringify error for console
      toast.error('Failed to back up project data.');
    }
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Handlers for opening/closing ProjectForm
  const handleOpenAddProjectForm = () => {
    setEditingProject(null); // Clear any existing project data
    setIsProjectFormOpen(true);
  };

  const handleEditProjectForm = (project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleProjectFormSuccess = (newOrUpdatedProject) => {
    // Re-fetch profile to ensure portfolio is updated with latest data from DB
    fetchProfile();
    setIsProjectFormOpen(false);
    setEditingProject(null);
    // The toast is already handled by ProjectForm, so no need for a redundant one here
  };

  const handleProjectFormCancel = () => {
    setIsProjectFormOpen(false);
    setEditingProject(null);
  };

  const handleShareProject = (project) => {
    // This function would typically open a share modal or trigger share logic
    toast.info(`Share functionality triggered for project: ${project.title}`);
    // You might dispatch an action here to open a Redux-managed share modal
    // For example: dispatch(openModal({ modalName: 'shareProject', data: project }));
  };

  const handleAwardBadge = async (badge) => {
    try {
      if (!user || !user.id) {
        toast.error('User not authenticated. Cannot award badge.');
        return;
      }
      await awardBadge(user.id, badge);
      setBadges((prev) => [...prev, badge]); // Optimistically update UI
      toast.success(`Badge awarded: ${badge.name}`);
    } catch (error) {
      console.error('Error awarding badge:', String(error)); // Explicitly stringify error for console
      toast.error('Failed to award badge.');
    }
  };

  const fetchRecommendations = useCallback(async () => {
    try {
      const userPreferences = {
        skills: profile.skills,
        interests: profile.bio,
      };
      const recommendedProjects = await getProjectRecommendations(userPreferences);
      setRecommendations(recommendedProjects);
    } catch (error) {
      console.error('Error fetching project recommendations:', String(error)); // Explicitly stringify error for console
      toast.error('Failed to fetch project recommendations.');
    }
  }, [profile.skills, profile.bio]);

  const fetchSummary = useCallback(async () => {
    try {
      // Combine relevant portfolio data for a comprehensive summary
      const combinedPortfolioData = {
        title: `${user?.email || 'My'} ALX Portfolio`,
        description: profile.bio,
        technologies: profile.skills,
        // Concatenate descriptions and technologies from actual portfolio projects
        portfolio_details: profile.portfolio.map(p => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies
        }))
      };

      const projectSummary = await generateProjectSummary(combinedPortfolioData);
      setSummary(projectSummary);
    } catch (error) {
      console.error('Error generating project summary:', String(error)); // Explicitly stringify error for console
      toast.error('Failed to generate project summary.');
    }
  }, [profile.portfolio, profile.bio, profile.skills, user]);

  useEffect(() => {
    // Only fetch recommendations if there are skills or a bio to base them on
    if (profile.skills.length > 0 || profile.bio) {
      fetchRecommendations();
    } else {
      setRecommendations([]); // Clear recommendations if no relevant data
    }
  }, [profile.skills, profile.bio, fetchRecommendations]);

  useEffect(() => {
    // Only fetch summary if there's portfolio data, skills, or a bio
    if (profile.portfolio.length > 0 || profile.bio || profile.skills.length > 0) {
      fetchSummary();
    } else {
      setSummary(''); // Clear summary if no relevant data
    }
  }, [profile.portfolio, profile.bio, profile.skills, fetchSummary]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-sm rounded-lg">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full   p-4 sm:p-6 shadow-sm rounded-lg">
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Profile Settings
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Update your profile information to showcase your ALX journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Section: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-purple-500" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={profile.full_name}
                  onChange={(e) => updateProfile('full_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="alx_id">ALX ID</Label>
                <Input
                  id="alx_id"
                  placeholder="ALX_001234"
                  value={profile.alx_id}
                  onChange={(e) => updateProfile('alx_id', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <LinkIcon className="h-5 w-5 text-green-500" /> Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github_username">GitHub Username</Label>
                <Input
                  id="github_username"
                  placeholder="johndoe"
                  value={profile.github_username}
                  onChange={(e) => updateProfile('github_username', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={profile.linkedin_url}
                  onChange={(e) => updateProfile('linkedin_url', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: About Me */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-yellow-500" /> About Me
            </h3>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your coding journey..."
                rows={4}
                value={profile.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
              />
            </div>
          </div>

          {/* Section: Avatar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Image className="h-5 w-5 text-orange-500" /> Avatar
            </h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-24 w-24 flex-shrink-0 border-2 border-blue-200 shadow-md">
                <AvatarImage src={profile.avatar_url} alt="User Avatar" />
                <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-600">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profile.avatar_url}
                  onChange={(e) => updateProfile('avatar_url', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Section: Certifications, Skills, Achievements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-purple-500" /> Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  placeholder="Enter certifications, separated by commas..."
                  value={profile.certifications.join(', ')}
                  onChange={(e) => updateProfile('certifications', e.target.value.split(',').map(item => item.trim()))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  placeholder="Enter skills, separated by commas..."
                  value={profile.skills.join(', ')}
                  onChange={(e) => updateProfile('skills', e.target.value.split(',').map(item => item.trim()))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea
                  id="achievements"
                  placeholder="Enter achievements, separated by commas..."
                  value={profile.achievements.join(', ')}
                  onChange={(e) => updateProfile('achievements', e.target.value.split(',').map(item => item.trim()))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section: Portfolio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-yellow-500" /> Portfolio
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto flex items-center gap-1"
                onClick={handleOpenAddProjectForm}
              >
                <Plus className="h-4 w-4" /> Add Project
              </Button>
            </h3>
            {/*
              NOTE: The ProjectList component needs to be updated to accept 'projects', 'loading', and 'error'
              as props instead of using useSelector internally to fetch them from Redux.
              Once updated, uncomment the following and remove the manual mapping below.
            */}
            <ProjectList
              projects={profile.portfolio}
              loading={loading} // Pass loading state from UserProfile
              error={null} // Pass specific error if you have one for portfolio fetching
              onEdit={handleEditProjectForm}
              onShare={handleShareProject}
              filters={{}} // Pass any relevant filters, or an empty object if none
            />
            {/* Original manual mapping (remove this once ProjectList is updated and uncommented above) */}
            {/* {profile.portfolio.length > 0 ? (
              profile.portfolio.map((project) => (
                <Card key={project.id} className="p-4 shadow-md flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-1">{project.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || 'No description provided.'}
                    </CardDescription>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProjectForm(project)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No projects added yet. Click "Add Project" to get started!
              </p>
            )} */}
          </div>

          {/* Section: Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-purple-500" /> Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm">
                    {badge.icon}
                    <div>
                      <h4 className="font-bold text-lg">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground">No badges awarded yet.</p>
              )}
            </div>
          </div>

          {/* Section: AI Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-purple-500" /> AI-Powered Recommendations
            </h3>
            {recommendations.length > 0 ? (
              <ul className="list-disc pl-5">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No recommendations available. Fill in your skills and bio to get AI-powered project recommendations!</p>
            )}
          </div>

          {/* Section: AI Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-purple-500" /> AI-Generated Summary
            </h3>
            {summary ? (
              <p>{summary}</p>
            ) : (
              <p className="text-muted-foreground">No summary available. Fill in your portfolio, skills, and bio to generate an AI-powered project summary!</p>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
          <Button onClick={handleBackup} className="w-full mt-2">
            Back Up Project Data
          </Button>
        </CardContent>
      </Card>

      {/* Project Form Dialog */}
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
  );
}

UserProfile.propTypes = {
  // No specific props for this component, but PropTypes can be defined if needed later
};
UserProfile.defaultProps = {
  // Default props can be defined here if needed
};