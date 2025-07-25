// src/components/DashboardSidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '@/store/slices/uiSlice.js'; // Assuming uiSlice provides setSidebarOpen
import { useAuth } from '@/hooks/selectors'; // Import useAuth to get user email

// Shadcn Sheet components and other UI elements
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet.jsx'; // Import SheetHeader, SheetTitle, SheetDescription
import { Button } from '@/components/ui/button.jsx';
import { FolderDot, BarChart2, User, X, PlusCircle } from 'lucide-react'; // Lucide React icons
import { cn } from '@/lib/utils'; // Utility for conditional classnames

/**
 * SidebarNav is a helper component for rendering navigation links.
 * @param {object} props - Component props.
 * @param {function} props.onAddProject - Function to open the Add Project form modal.
 * @param {string} [props.className] - Optional additional class names.
 */
const SidebarNav = ({ onAddProject, className }) => {
  const navLinks = [
    { to: '/dashboard/projects', icon: FolderDot, label: 'My Projects' },
    { to: '/dashboard/stats', icon: BarChart2, label: 'Stats' },
    { to: '/dashboard/profile', icon: User, label: 'Profile Settings' },
  ];

  return (
    <nav className={cn("flex flex-col gap-2 p-4 pt-0", className)}>
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
              isActive && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100" // Active link styling
            )
          }
        >
          <link.icon className="h-5 w-5" />
          {link.label}
        </NavLink>
      ))}
      <Button
        onClick={onAddProject}
        className="mt-4 w-full justify-start text-left bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors duration-200"
      >
        <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
      </Button>
    </nav>
  );
};

/**
 * DashboardSidebar component provides the main navigation for the dashboard.
 * It functions as a collapsible sidebar on desktop and a sheet on mobile.
 * @param {object} props - Component props.
 * @param {function} props.onAddProject - Function to open the Add Project form modal.
 */
export function DashboardSidebar({ onAddProject }) {
  const dispatch = useDispatch();
  const location = useLocation(); // To get current path for active link styling
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen); // Get sidebar state from Redux
  const { user } = useAuth(); // Get user for email display

  // Function to close sidebar (for mobile view)
  const handleCloseSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSidebarOpen} onOpenChange={(open) => dispatch(setSidebarOpen(open))}>
        <SheetContent side="left" className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col">
          {/* Added SheetHeader, SheetTitle, and SheetDescription for accessibility */}
          <SheetHeader className="mb-6 flex flex-row items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">ALX Showcase</SheetTitle>
            <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
              <X className="h-6 w-6" />
            </Button>
          </SheetHeader>
          {/* Visually hidden description for screen readers */}
          <SheetDescription className="sr-only">Main navigation menu for the dashboard.</SheetDescription>

          {user && (
            <div className="mb-4 px-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.email}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
          )}
          <SidebarNav onAddProject={() => { onAddProject(); handleCloseSidebar(); }} className="flex-1" />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 pt-8 shrink-0">
        <div className="mb-6 px-2">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ALX Showcase</h2>
          {user && (
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          )}
        </div>
        <SidebarNav onAddProject={onAddProject} className="flex-1" />
      </div>
    </>
  );
}

export default DashboardSidebar;