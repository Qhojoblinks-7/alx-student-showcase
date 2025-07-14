import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/use-auth'; // Ensure this path is correct
import {  useProjects, useGitHubLoading, useProjectsLoading } from '../lib/redux-selectors'
import { fetchProjects, fetchProjectStats } from '../store/slices/projectsSlice'; // Import thunks
import { setWizardStep } from '../store/slices/githubSlice'; // Import setWizardStep
import { useUI } from '../hooks/redux-hooks'; // Custom hook for UI state management
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { toast } from 'sonner';
import {
  Menu,
  Plus,
  Github,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  BarChart2,
  Share2,
  CalendarDays,
  Sun,
  Moon,
  Zap,
  Loader2,
} from 'lucide-react';

// Import components
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectForm } from '../components/projects/ProjectForm';
import { UserProfile } from '../components/profile/UserProfile';
import { GitHubImportWizard } from '../components/github/GitHubImportWizard';
import { ShareProjectModal } from '../components/sharing/ShareProjectModal';
import { AutoWorkLogShare } from '../components/sharing/AutoWorkLogShare';
import { WorkLogGenerator } from '../components/sharing/WorkLogGenerator';
import { DashboardStats } from '../components/DashboardStats'; // Assuming you have this component



import { 
  useModals, // Selector for UI modals state
  useActiveTab, // Selector for active tab state
  useTheme // Selector for theme state
} from '../lib/redux-selectors'; // Corrected import path for UI selectors


import { 
  openModal, // UI action creator
  closeModal, // UI action creator
  setActiveTab, // UI action creator
  toggleTheme // UI action creator
} from '../store/slices/uiSlice'; // Import UI action creators






export function Dashboard() {
  const dispatch = useDispatch();
  const { user, signOut, loading: authLoading } = useAuth(); // Get user and signOut from useAuth
  
  // Get UI state values using their respective selectors
  const activeTab = useActiveTab();
  const modals = useModals();
  const theme = useTheme();

  // Get other state values
  const projects = useProjects(); // projects is directly the array from the selector
  const { isLoading: projectsListLoading } = useProjectsLoading(); // Get specific loading state for project list fetching
  const { repositories: githubLoadingRepositories } = useGitHubLoading(); // Destructure 'repositories' directly

  const [editingProject, setEditingProject] = useState(null);
  const [sharingProject, setSharingProject] = useState(null);
  const [showAutoWorkLogShare, setShowAutoWorkLogShare] = useState(false);
  const [showWorkLogGenerator, setShowWorkLogGenerator] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State to control Sheet visibility

  // Fetch projects and stats when user is available and on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchProjects(user.id));
      dispatch(fetchProjectStats(user.id));
    }
  }, [user, dispatch]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error('Failed to sign out: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddProjectClick = () => {
    setEditingProject(null); // Clear any existing project for "Add New"
    dispatch(openModal({ modalName: 'projectForm' })); // Dispatch openModal action
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    dispatch(openModal({ modalName: 'projectForm', data: project })); // Dispatch openModal action with data
  };

  const handleShareProject = (project) => {
    setSharingProject(project);
    dispatch(openModal({ modalName: 'shareProject', data: project })); // Dispatch openModal action with data
  };

  const handleOpenAutoWorkLogShare = (project) => {
    setSharingProject(project);
    setShowAutoWorkLogShare(true);
  };

  const handleCloseAutoWorkLogShare = () => {
    setShowAutoWorkLogShare(false);
    setSharingProject(null);
  };

  const handleOpenWorkLogGenerator = () => {
    setShowWorkLogGenerator(true);
  };

  const handleCloseWorkLogGenerator = () => {
    setShowWorkLogGenerator(false);
  };

  const handleGitHubImportComplete = () => {
    dispatch(closeModal('gitHubImport')); // Dispatch closeModal action
    dispatch(setWizardStep('username')); // Reset wizard step
    if (user?.id) {
      dispatch(fetchProjects(user.id)); // Re-fetch projects after import
      dispatch(fetchProjectStats(user.id)); // Re-fetch stats after import
    }
    toast.success('GitHub projects imported successfully!');
  };

  const handleProjectFormSuccess = () => {
    dispatch(closeModal('projectForm')); // Dispatch closeModal action
    setEditingProject(null);
    if (user?.id) {
      dispatch(fetchProjects(user.id)); // Re-fetch projects after add/edit
      dispatch(fetchProjectStats(user.id)); // Re-fetch stats after add/edit
    }
  };

  const handleProjectFormCancel = () => {
    dispatch(closeModal('projectForm')); // Dispatch closeModal action
    setEditingProject(null);
  };

  const handleShareModalClose = () => {
    dispatch(closeModal('shareProject')); // Dispatch closeModal action
    setSharingProject(null);
  };

  const handleOpenUserProfile = () => {
    dispatch(openModal({ modalName: 'userProfile' })); // Dispatch openModal action
  };

  const handleCloseUserProfile = () => {
    dispatch(closeModal('userProfile')); // Dispatch closeModal action
  };

  const handleOpenGitHubImport = () => {
    dispatch(openModal({ modalName: 'gitHubImport' })); // Dispatch openModal action
  };

  const handleCloseGitHubImport = () => {
    dispatch(closeModal('gitHubImport')); // Dispatch closeModal action
    dispatch(setWizardStep('username')); // Reset wizard step on close
  };

  // Render loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl text-gray-700">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-gray-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-4 shadow-sm dark:bg-gray-800 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}> {/* Control Sheet visibility with state */}
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ALX Showcase
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                <Button variant="ghost" className="justify-start" onClick={() => { dispatch(setActiveTab('projects')); setIsSheetOpen(false); }}>
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Projects
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { dispatch(setActiveTab('profile')); setIsSheetOpen(false); }}>
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { handleOpenWorkLogGenerator(); setIsSheetOpen(false); }}>
                  <CalendarDays className="mr-3 h-5 w-5" />
                  Work Log
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { handleOpenGitHubImport(); setIsSheetOpen(false); }}>
                  <Github className="mr-3 h-5 w-5" />
                  Import from GitHub
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop App Title */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden lg:block">
            ALX Showcase
          </h1>
        </div>

        {/* Desktop Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => dispatch(setActiveTab(value))} className="hidden lg:block">
          <TabsList>
            <TabsTrigger value="projects">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart2 className="mr-2 h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Right side: Add Project, GitHub Import, User Dropdown */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleAddProjectClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
          <Button variant="outline" onClick={handleOpenGitHubImport} disabled={githubLoadingRepositories}>
            {githubLoadingRepositories ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Import GitHub
          </Button>
          <Button variant="outline" size="icon" onClick={() => dispatch(toggleTheme())}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'user'}`} />
                  <AvatarFallback>{user?.email ? user.email.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => dispatch(setActiveTab('profile'))}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenWorkLogGenerator}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Work Log Generator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={(value) => dispatch(setActiveTab(value))}>
          {/* TabsList is hidden on mobile, shown on desktop */}
          <TabsList className="hidden lg:grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="projects">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart2 className="mr-2 h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectList onEdit={handleEditProject} onShare={handleOpenAutoWorkLogShare} />
          </TabsContent>
          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
          <TabsContent value="stats">
            <DashboardStats />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {modals.projectForm && (
        <Sheet open={modals.projectForm} onOpenChange={() => handleProjectFormCancel()}>
          <SheetContent className="w-full max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</SheetTitle>
            </SheetHeader>
            <ProjectForm
              projectId={editingProject?.id}
              onSuccess={handleProjectFormSuccess}
              onCancel={handleProjectFormCancel}
            />
          </SheetContent>
        </Sheet>
      )}

      {modals.gitHubImport && (
        <GitHubImportWizard
          onClose={handleCloseGitHubImport}
          onImportComplete={handleGitHubImportComplete}
        />
      )}

      {modals.shareProject && sharingProject && (
        <ShareProjectModal
          project={sharingProject}
          onClose={handleShareModalClose}
        />
      )}

      {showAutoWorkLogShare && sharingProject && (
        <AutoWorkLogShare
          project={sharingProject}
          onClose={handleCloseAutoWorkLogShare}
        />
      )}

      {showWorkLogGenerator && (
        <WorkLogGenerator
          onClose={handleCloseWorkLogGenerator}
        />
      )}

    </div>
  );
}

Dashboard.propTypes = {
  // No specific props for Dashboard, but can be defined if needed.
};

