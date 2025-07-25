// src/components/DashboardSidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart2, User, X } from 'lucide-react'; // Icons
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'; // Shadcn Sheet
import { Button } from './ui/button'; // Shadcn Button
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '../store/slices/uiSlice'; // Import setSidebarOpen

const sidebarNavItems = [
  {
    title: 'My Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'Stats',
    href: '/dashboard/stats',
    icon: BarChart2,
  },
  {
    title: 'Profile Settings',
    href: '/dashboard/profile',
    icon: User,
  },
];

const SidebarContent = ({ onClose }) => {
  const location = useLocation();

  const getLinkClass = (href) => {
    return `flex items-center px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium
            ${location.pathname.startsWith(href)
              ? 'bg-gray-700 text-white border-l-4 border-teal-500 pl-[14px]' // Active state
              : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Inactive state
            }`;
  };

  return (
    <nav className="flex flex-col space-y-2 p-4 pt-8"> {/* Increased padding-top for visual spacing */}
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={getLinkClass(item.href)}
            onClick={onClose} // Close sidebar on link click (for mobile Sheet)
          >
            <Icon className="mr-3 h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

const DashboardSidebar = () => {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);

  const handleCloseSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0">
        <SidebarContent onClose={() => {}} /> {/* No-op for desktop */}
      </aside>

      {/* Mobile Sidebar (Sheet component) */}
      <Sheet open={isSidebarOpen} onOpenChange={(open) => dispatch(setSidebarOpen(open))}>
        <SheetContent
          side="left"
          className="w-64 bg-gray-800 text-white border-r border-gray-700 p-0 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 pb-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-teal-400" />
              <span className="text-lg font-bold">Menu</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white"
              onClick={handleCloseSidebar}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <SidebarContent onClose={handleCloseSidebar} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DashboardSidebar;