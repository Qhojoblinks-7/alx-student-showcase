import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { toast } from 'sonner';
import { Loader2, User } from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    alx_id: '',
    github_username: '',
    linkedin_url: '',
    bio: '',
    avatar_url: '',
  });

<<<<<<< HEAD
  
=======
>>>>>>> 6ec6261e759395dd9f49a69591a7d1f20bf29527
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
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
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
<<<<<<< HEAD
=======

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);
>>>>>>> 6ec6261e759395dd9f49a69591a7d1f20bf29527

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          ...profile,
        });

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Update your profile information to showcase your ALX journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              placeholder="https://example.com/avatar.jpg"
              value={profile.avatar_url}
              onChange={(e) => updateProfile('avatar_url', e.target.value)}
            />
          </div>
        </div>

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

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}