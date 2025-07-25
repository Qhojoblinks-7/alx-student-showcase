// src/components/profile/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  fetchUserProfile,
  updateUserProfile,
  regeneratePortfolioInsights,
  setError,
} from '../../store/slices/profileSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Loader2, User, Github, Linkedin, Twitter, Globe, Sparkle, RefreshCcw, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import  DynamicTextInputList  from '../common/DynamicTextInputList'; // Assuming this path
import { supabase } from '../../lib/supabase'; // Supabase client instance
import LoadingSpinner from '../layout/LoadingSpinner';
import ErrorMessage from '../Layout/ErrorMessage';
import TagInput from '../common/TagInput';

export const UserProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Select state from Redux profile slice
  const { userProfile, isLoading, error, isUpdating, isGeneratingAI } = useSelector(
    (state) => state.profile
  );
  // Select authenticated user from auth slice to get current user ID
  const { user } = useSelector((state) => state.auth);

  // Local state for form fields, initialized from userProfile or empty defaults
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    certifications: [],
    skills: [],
    achievements: [],
    ai_portfolio_summary: '',
    ai_project_recommendations: [],
    ai_skill_gaps: [],
      clearProfileStatus, // <--- Import the correct thunk

  });

  // State for avatar upload modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // --- Effects ---

  // Effect to fetch user profile data on component mount
  useEffect(() => {
    if (user && !userProfile && !isLoading && !error) {
      dispatch(fetchUserProfile(user.id));
            dispatch(clearProfileStatus()); // <--- Use the correct thunk here

    }
  }, [user, userProfile, isLoading, error, dispatch]);

  // Effect to populate form data when userProfile is loaded or updated from Redux
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        avatar_url: userProfile.avatar_url || '',
        github_url: userProfile.github_url || '',
        linkedin_url: userProfile.linkedin_url || '',
        twitter_url: userProfile.twitter_url || '',
        website_url: userProfile.website_url || '',
        certifications: userProfile.certifications || [],
        skills: userProfile.skills || [],
        achievements: userProfile.achievements || [],
        ai_portfolio_summary: userProfile.ai_portfolio_summary || '',
        ai_project_recommendations: userProfile.ai_project_recommendations || [],
        ai_skill_gaps: userProfile.ai_skill_gaps || [],
      });
      // Clear any existing avatar preview if profile has loaded
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);
    }
  }, [userProfile]);

  // Effect to show toasts for profile update success or error
  useEffect(() => {
    if (error) {
      toast.error('Profile Update Failed', { description: error });
      dispatch(clearProfileError());
    }
    if (!isUpdating && userProfile && Object.keys(userProfile).length > 0) {
      // This toast triggers after a successful update (isUpdating changes from true to false)
      // and only if userProfile exists, to avoid showing on initial load.
      // A more robust check might involve comparing previous state or using a success flag.
      // For simplicity here, we'll assume isUpdating becoming false after a successful
      // dispatch indicates success.
      // toast.success('Profile Updated', { description: 'Your profile has been saved successfully.' });
    }
  }, [error, isUpdating, userProfile, dispatch]);


  // --- Handlers ---

  // Generic handler for text input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handler for dynamic list changes (skills, certifications, achievements)
  const handleListChange = (field, newItems) => {
    setFormData((prev) => ({ ...prev, [field]: newItems }));
  };

  // Handler for avatar file selection
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatarFile(file);
      setAvatarPreviewUrl(URL.createObjectURL(file)); // Create a preview URL
    } else {
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);
    }
  };

  // Handler for avatar upload to Supabase Storage
  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile || !user) {
      toast.error('Upload Error', { description: 'No file selected or user not authenticated.' });
      return;
    }

    setIsUploadingAvatar(true);
    const fileExtension = selectedAvatarFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExtension}`; // Unique path for each upload

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('avatars') // Your Supabase Storage bucket name
        .upload(filePath, selectedAvatarFile, {
          cacheControl: '3600',
          upsert: false, // Set to true if you want to overwrite existing files at the same path
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for avatar.');
      }

      const newAvatarUrl = publicUrlData.publicUrl;

      // Update the formData with the new avatar_url
      setFormData((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
      toast.success('Avatar Uploaded', { description: 'Your new avatar has been uploaded.' });
      setIsAvatarModalOpen(false); // Close modal on successful upload
      setSelectedAvatarFile(null); // Clear selected file
      setAvatarPreviewUrl(null); // Clear preview

      // Optionally, dispatch an update to save the new avatar_url to the user_profiles table immediately
      // This ensures the URL is persisted even if the user doesn't hit "Save Changes" on the main form
      dispatch(updateUserProfile({ id: user.id, avatar_url: newAvatarUrl }));

    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Avatar Upload Failed', { description: error.message || 'An unknown error occurred during upload.' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handler for saving all profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Authentication Error', { description: 'User not authenticated.' });
      return;
    }

    // Basic validation for username
    if (!formData.username) {
      toast.error('Validation Error', { description: 'Username is required.' });
      return;
    }

    // Dispatch the updateUserProfile async thunk
    dispatch(updateUserProfile({ id: user.id, ...formData }));
    toast.success('Profile Updated', { description: 'Your profile has been saved successfully.' });
  };

  // Handler for regenerating AI insights
  const handleRegenerateAIInsights = () => {
    if (!user) {
      toast.error('Authentication Error', { description: 'User not authenticated.' });
      return;
    }
    dispatch(regeneratePortfolioInsights(user.id));
    toast.info('Generating AI Insights', { description: 'This may take a moment...' });
  };

  // --- Render Logic ---

  if (isLoading && !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // If no user profile exists (e.g., new user, or error after initial load),
  // we might want to show a message or redirect. For now, we'll allow the form
  // to be rendered with default empty states.
  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <ErrorMessage message="Could not load profile. Please try again." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage src={formData.avatar_url || `https://placehold.co/128x128?text=${formData.full_name ? formData.full_name.charAt(0) : '?'}`} alt={formData.full_name || 'User Avatar'} />
            <AvatarFallback className="text-4xl">
              {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <User />}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl">{formData.full_name || 'Unnamed User'}</CardTitle>
            <CardDescription className="text-muted-foreground">@{formData.username || 'no-username'}</CardDescription>
            <Button variant="outline" className="mt-2" onClick={() => setIsAvatarModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Change Avatar
            </Button>
            {formData.username && (
              <Link to={`/showcase/${formData.username}`} target="_blank" rel="noopener noreferrer">
                <Button variant="link" className="mt-2 ml-2">
                  <Eye className="mr-2 h-4 w-4" /> View Public Showcase
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your basic profile information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
              />
              <p className="text-sm text-muted-foreground">This will be part of your public showcase URL.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="A passionate ALX Software Engineering student focusing on full-stack development."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Achievements</CardTitle>
            <CardDescription>Showcase your technical skills, certifications, and notable achievements.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills</Label>
              <TagInput
                value={formData.skills}
                onChange={(newSkills) => handleListChange('skills', newSkills)}
                placeholder="Add a skill (e.g., React, Python, SQL)"
              />
              <p className="text-sm text-muted-foreground">Press Enter to add a skill.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certifications">Certifications</Label>
              <DynamicTextInputList
                value={formData.certifications}
                onChange={(newCerts) => handleListChange('certifications', newCerts)}
                placeholder="e.g., ALX Software Engineering Program"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="achievements">Achievements</Label>
              <DynamicTextInputList
                value={formData.achievements}
                onChange={(newAchievements) => handleListChange('achievements', newAchievements)}
                placeholder="e.g., Top 1% in ALX Hackathon 2024"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Social & Portfolio Links</CardTitle>
            <CardDescription>Link to your professional profiles and personal website.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <div className="relative">
                <Github className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <div className="relative">
                <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitter_url">Twitter/X URL</Label>
              <div className="relative">
                <Twitter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter_url"
                  type="url"
                  value={formData.twitter_url}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourusername"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website_url">Personal Website URL</Label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Portfolio Insights</CardTitle>
            <CardDescription>
              Get AI-generated summaries and recommendations based on your profile and projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>AI Portfolio Summary</Label>
              <Textarea
                value={formData.ai_portfolio_summary}
                readOnly
                disabled
                rows={3}
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label>AI Project Recommendations</Label>
              <Textarea
                value={formData.ai_project_recommendations.join('\n- ') || 'No recommendations yet.'}
                readOnly
                disabled
                rows={3}
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label>AI Skill Gaps</Label>
              <Textarea
                value={formData.ai_skill_gaps.join('\n- ') || 'No skill gaps identified yet.'}
                readOnly
                disabled
                rows={3}
                className="bg-muted/50 text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleRegenerateAIInsights}
              type="button" // Important: type="button" to prevent form submission
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              {isGeneratingAI ? 'Generating...' : 'Regenerate AI Insights'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2 flex items-center">
              <Sparkle className="h-4 w-4 mr-1 text-yellow-500" />
              These insights are automatically generated and can be updated by clicking the button above.
            </p>
          </CardContent>
        </Card>

        {/* Save Changes Button */}
        <div className="text-center pb-8">
          <Button type="submit" disabled={isUpdating} className="px-8 py-2">
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new image for your profile. Max file size: 5MB.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreviewUrl || formData.avatar_url || `https://placehold.co/128x128?text=Upload`} alt="Avatar Preview" />
                <AvatarFallback className="text-4xl">
                  {avatarPreviewUrl || formData.avatar_url ? <Upload /> : <User />}
                </AvatarFallback>
              </Avatar>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="max-w-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvatarModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAvatarUpload} disabled={!selectedAvatarFile || isUploadingAvatar}>
              {isUploadingAvatar ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Upload & Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfilePage;
