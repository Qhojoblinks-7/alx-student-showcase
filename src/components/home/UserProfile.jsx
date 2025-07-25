// src/components/UserProfile.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user);

  // In a real application, you'd have state for form fields
  // and dispatch actions to update the profile via profileSlice.
  // For now, it's a display of current user data.

  return (
    <Card className="bg-gray-900 text-white border-gray-700 shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-400">Profile Settings</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your account information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled // Email is often not editable directly via profile
            className="bg-gray-800 border-gray-700 text-gray-300 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={user?.user_metadata?.full_name || ''}
            placeholder="Your full name"
            className="bg-gray-800 border-gray-700 text-white focus:ring-teal-500"
            // Add onChange handler and local state in a real scenario
          />
        </div>
        {/* Add more profile fields as needed */}
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfile;