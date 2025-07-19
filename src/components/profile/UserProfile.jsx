import { useState, useEffect, useCallback } from 'react'; // Added useEffect
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
import { Loader2, User, Github, Linkedin, BookOpen, Image, Info, Trophy, Star } from 'lucide-react'; // Added more icons
import {Link} from 'react-router-dom'

export function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    alx_id: '',
    github_username: '',
    linkedin_url: '',
    bio: '',
    avatar_url: '',
    certifications: [], // Changed to array
    skills: [], // Changed to array
    achievements: [], // Changed to array
    portfolio: [],
  });
  const [badges, setBadges] = useState([
    { id: 1, name: 'Top Contributor', description: 'Awarded for contributing 10+ projects', icon: <Trophy className="h-8 w-8 text-yellow-500" /> },
    { id: 2, name: 'Most Endorsed', description: 'Received 50+ endorsements', icon: <Star className="h-8 w-8 text-blue-500" /> },
  ]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false); // If no user, stop loading
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message ? String(error.message) : String(error));
        toast.error('Failed to load profile: ' + (error.message || 'Unknown error'));
        setProfile({ // Reset to empty if error
          full_name: '', alx_id: '', github_username: '', linkedin_url: '', bio: '', avatar_url: '',
        });
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          alx_id: data.alx_id || '',
          github_username: data.github_username || '',
          linkedin_url: data.linkedin_url || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          certifications: data.certifications || [], // Parse as array
          skills: data.skills || [], // Parse as array
          achievements: data.achievements || [], // Parse as array
          portfolio: data.portfolio || [], // Map portfolio
        });
      }
    } catch (error) {
      console.error('Unexpected error during profile fetch:', error.message ? String(error.message) : String(error));
      toast.error('An unexpected error occurred while loading profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Depend on fetchProfile to re-run when user changes

  useEffect(() => {
    const subscription = subscribeToProjectChanges((updatedProject) => {
      console.log('Real-time project update:', updatedProject);
      toast.info(`Project updated: ${updatedProject.title}`);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const userBadges = await fetchUserBadges(user.id);
        setBadges(userBadges);
      } catch (error) {
        toast.error('Failed to load badges.');
      }
    };

    if (user) {
      loadBadges();
    }
  }, [user]);

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
        });

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message ? String(error.message) : String(error));
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      const backupData = {
        user_id: user.id,
        projects: profile.portfolio,
      };
      await backupProjectData(backupData);
      toast.success('Project data backed up successfully!');
    } catch (error) {
      toast.error('Failed to back up project data.');
    }
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addPortfolioProject = (project) => {
    setProfile((prev) => ({ ...prev, portfolio: [...prev.portfolio, project] }));
  };

  const handleAwardBadge = async (badge) => {
    try {
      await awardBadge(user.id, badge);
      setBadges((prev) => [...prev, badge]);
      toast.success(`Badge awarded: ${badge.name}`);
    } catch (error) {
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
      toast.error('Failed to fetch project recommendations.');
    }
  }, [profile.skills, profile.bio]);

  const fetchSummary = useCallback(async () => {
    try {
      const projectDetails = profile.portfolio;
      const projectSummary = await generateProjectSummary(projectDetails);
      setSummary(projectSummary);
    } catch (error) {
      toast.error('Failed to generate project summary.');
    }
  }, [profile.portfolio]);

  useEffect(() => {
    if (profile.skills.length > 0) {
      fetchRecommendations();
    }
  }, [profile.skills, fetchRecommendations]);

  useEffect(() => {
    if (profile.portfolio.length > 0) {
      fetchSummary();
    }
  }, [profile.portfolio, fetchSummary]);

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
    <Card className="w-full max-w-2xl mx-auto p-4 sm:p-6 shadow-sm rounded-lg"> {/* Added responsive padding and shadow */}
      <CardHeader className="mb-6"> {/* Added margin-bottom */}
        <CardTitle className="text-2xl font-bold flex items-center gap-2"> {/* Added flex and gap */}
          <User className="h-6 w-6 text-blue-600" /> {/* Larger icon with color */}
          Profile Settings
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Update your profile information to showcase your ALX journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8"> {/* Increased overall spacing */}
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
            <Link className="h-5 w-5 text-green-500" /> Social Links
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
            <Avatar className="h-24 w-24 flex-shrink-0 border-2 border-blue-200 shadow-md"> {/* Larger avatar with border/shadow */}
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
          </h3>
          <Button onClick={() => addPortfolioProject({ title: 'New Project', description: 'Project description' })}>
            Add Project
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.portfolio.map((project, index) => (
              <Card key={index} className="p-4 shadow-md">
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>

        {/* Section: Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-purple-500" /> Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm">
                {badge.icon}
                <div>
                  <h4 className="font-bold text-lg">{badge.name}</h4>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: AI Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-purple-500" /> AI-Powered Recommendations
          </h3>
          <ul className="list-disc pl-5">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Section: AI Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-purple-500" /> AI-Generated Summary
          </h3>
          <p>{summary}</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full mt-6"> {/* Increased margin-top */}
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
        <Button onClick={handleBackup} className="w-full mt-6">
          Back Up Project Data
        </Button>
      </CardContent>
    </Card>
  );
}

UserProfile.propTypes = {
  // No specific props for this component, but PropTypes can be defined if needed later
};
