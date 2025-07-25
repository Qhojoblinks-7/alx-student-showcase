// src/components/DashboardHeader.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu, LogOut, LayoutDashboard, User2 } from 'lucide-react'; // Icons
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'; // Shadcn Avatar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'; // Shadcn Dropdown
import { Button } from './ui/button'; // Shadcn Button
import { signOut } from '../store/slices/authSlice';
import { toggleSidebar } from '../store/slices/uiSlice'; // Import toggleSidebar

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Get user from authSlice

  const handleSignOut = () => {
    dispatch(signOut());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const getInitials = (email) => {
    if (!email) return 'UN';
    const parts = email.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gray-900 border-b border-gray-700 h-16 flex items-center px-4 md:px-6 shadow-md">
      {/* Mobile Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-gray-300 hover:text-white"
        onClick={handleToggleSidebar}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {/* App Logo/Title */}
      <div className="flex-1 flex justify-center md:justify-start">
        <Link to="/dashboard/projects" className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-teal-400" />
          <span className="text-xl font-bold text-white tracking-tight">ALX Showcase</span>
        </Link>
      </div>

      {/* User Avatar & Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9 border border-gray-600">
              {/* You can add user profile image here if available */}
              {/* <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" /> */}
              <AvatarFallback className="bg-gray-700 text-teal-400 font-semibold text-sm">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-800 text-white border-gray-700" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs leading-none text-gray-400">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-700">
            <Link to="/dashboard/profile" className="flex items-center w-full">
              <User2 className="mr-2 h-4 w-4 text-gray-400" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-700" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4 text-gray-400" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default DashboardHeader;