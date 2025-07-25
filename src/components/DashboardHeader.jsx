// src/components/DashboardHeader.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '@/store/slices/authSlice'; // Assuming authSlice provides signOut
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User, Sun, Moon, Plus, Github, Lightbulb, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, useProfile, useUI } from '@/hooks/selectors'; // Custom hooks for auth, profile, ui state
import { setSidebarOpen } from '@/store/slices/uiSlice'; // Import setSidebarOpen action

/**
 * DashboardHeader component provides the persistent top navigation bar for the dashboard.
 * It includes the app title, mobile menu toggle, and user dropdown.
 * @param {object} props - Component props.
 * @param {function} props.toggleSidebar - Function to toggle the mobile sidebar.
 * @param {function} props.onAddProject - Function to open the Add Project form modal.
 * @param {function} props.onImportGitHub - Function to open the GitHub Import wizard modal.
 */
export function DashboardHeader({ toggleSidebar, onAddProject, onImportGitHub }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user from auth hook
    const { userProfile } = useProfile(); // Get user profile from profile hook (for avatar/name)
    const { theme } = useUI(); // Assuming theme is managed in uiSlice (placeholder for now)

    const handleSignOut = async () => {
        try {
            await dispatch(signOut()).unwrap();
            toast.success('Signed out successfully!');
            navigate('/signin'); // Redirect to sign-in page after sign out
        } catch (err) {
            toast.error('Sign out failed: ' + (err.message || 'Unknown error'));
            console.error('Sign out error:', err);
        }
    };

    const handleToggleTheme = () => {
        // Dispatch an action to toggle theme in uiSlice
        // dispatch(toggleTheme()); // Assuming you have a 'toggleTheme' action in uiSlice
        console.log('DashboardHeader: Toggle theme clicked');
        toast.info('Theme toggling not yet implemented in uiSlice');
    };

    const getUserInitials = (email) => {
        if (!email) return 'UN';
        const parts = email.split('@')[0].split('.');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return email[0].toUpperCase();
    };

    return (
        <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Sheet Trigger (Hamburger Menu) */}
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                    <Menu className="h-6 w-6" />
                </Button>

                {/* App Title/Logo */}
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    <Link to="/dashboard/projects" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        ALX Showcase
                    </Link>
                </h1>
            </div>

            {/* Right Section: Actions and User */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle Button */}
                <Button variant="ghost" size="icon" onClick={handleToggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Desktop Action Buttons */}
                <Button onClick={() => {
                    console.log('DashboardHeader: "Add Project" button clicked');
                    onAddProject();
                }} className="hidden md:flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Project
                </Button>
                <Button onClick={() => {
                    // Log to confirm this button's onClick handler is firing
                    console.log('DashboardHeader: "Import GitHub" button clicked. Calling onImportGitHub prop.');
                    onImportGitHub();
                }} variant="outline" className="hidden md:flex items-center gap-1">
                    <Github className="h-4 w-4" /> Import GitHub
                </Button>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'User'}`} alt="User Avatar" />
                                <AvatarFallback>{getUserInitials(user?.email)}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userProfile?.full_name || user?.email}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        {/* Placeholder for Work Log Generator or other tools */}
                        <DropdownMenuItem onClick={() => toast.info('Work Log Generator coming soon!')}>
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Work Log Generator
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default DashboardHeader;