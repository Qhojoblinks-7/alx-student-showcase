

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  PlusCircle,
  Github,
  MoreVertical,
  Edit,
  Share2,
  Eye,
  EyeOff,
  Trash2,
  Lightbulb,
} from 'lucide-react';

import ProjectForm from './ProjectForm'; // Assuming this component exists
import GitHubImportWizard from '../github/GitHubImportWizard'; // Assuming this component exists

// Import Redux actions/thunks
import {
  fetchProjects,
  updateProject,
  deleteProject,
  setCurrentProject,
  clearCurrentProject,
} from '@/store/slices/projectsSlice';
import { toggleAddProjectModal } from '@/store/slices/uiSlice'; // For controlling ProjectForm modal
import { resetGitHubState } from '@/store/slices/githubSlice'; // To reset wizard state on close

// Helper function to truncate text
const truncateText = (text, limit) => {
  if (!text) return '';
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

const ProjectList = () => {
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.projects);
  const { isAddProjectModalOpen } = useSelector((state) => state.ui);
  const authUserId = useSelector((state) => state.auth.user?.id); // Get authenticated user ID

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isGitHubImportModalOpen, setIsGitHubImportModalOpen] = useState(false);

  // Fetch projects when component mounts or user ID changes
  useEffect(() => {
    if (authUserId) {
      dispatch(fetchProjects(authUserId));
    }
  }, [dispatch, authUserId]);

  const handleAddProjectClick = () => {
    dispatch(setCurrentProject(null)); // Clear any previous project data for add mode
    dispatch(toggleAddProjectModal(true));
  };

  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleCloseProjectForm = () => {
    setIsEditModalOpen(false);
    dispatch(toggleAddProjectModal(false));
    dispatch(clearCurrentProject()); // Clear current project in Redux
    setProjectToEdit(null);
  };

  const handleToggleVisibility = async (projectId, currentStatus, projectTitle) => {
    try {
      await dispatch(updateProject({ id: projectId, projectData: { is_public: !currentStatus } })).unwrap();
      toast.success(`Project '${projectTitle}' is now ${!currentStatus ? 'Public' : 'Private'}.`);
    } catch (err) {
      toast.error(`Failed to update visibility for '${projectTitle}': ${err.message || 'An error occurred.'}`);
    }
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    try {
      await dispatch(deleteProject(projectId)).unwrap();
      toast.success(`Project '${projectTitle}' deleted successfully.`);
    } catch (err) {
      toast.error(`Failed to delete project '${projectTitle}': ${err.message || 'An error occurred.'}`);
    }
  };

  const handleShareProject = (projectId, projectTitle) => {
    // Construct a shareable URL (this should ideally point to a public profile page)
    const shareableUrl = `${window.location.origin}/showcase/${authUserId}/${projectTitle.toLowerCase().replace(/\s/g, '-')}`;
    navigator.clipboard.writeText(shareableUrl);
    toast.info(`Share link for '${projectTitle}' copied to clipboard!`);
    // In a real application, you'd open a dedicated share modal here
  };

  const handleImportGitHub = () => {
    setIsGitHubImportModalOpen(true);
  };

  const handleCloseGitHubImportWizard = () => {
    setIsGitHubImportModalOpen(false);
    dispatch(resetGitHubState()); // Reset GitHub import wizard state
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">My Projects</h2>
        <div className="flex gap-3">
          <Button onClick={handleAddProjectClick} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add New Project
          </Button>
          <Button onClick={handleImportGitHub} variant="outline" className="flex items-center gap-2">
            <Github className="w-4 h-4" /> Import from GitHub
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No projects added yet!</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by showcasing your amazing work or importing from your GitHub profile.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={handleAddProjectClick} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add Your First Project
            </Button>
            <Button onClick={handleImportGitHub} variant="outline" className="flex items-center gap-2">
              <Github className="w-4 h-4" /> Import from GitHub
            </Button>
          </div>
        </div>
      ) : (
        /* Project Grid/List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between overflow-hidden">
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-project.png'; }} // Fallback image
                />
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditProject(project)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareProject(project.id, project.title)}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleVisibility(project.id, project.is_public, project.title)}>
                        {project.is_public ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" /> Make Private
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" /> Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              project &quot;{project.title}&quot; from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProject(project.id, project.title)} className="bg-red-600 hover:bg-red-700 text-white">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {truncateText(project.description, 100)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 flex-grow">
                <div className="flex flex-wrap gap-2">
                  {project.technologies && project.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="secondary">{tech}</Badge>
                  ))}
                  {project.difficulty && (
                    <Badge variant="outline" className={`
                      ${project.difficulty === 'Easy' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                      ${project.difficulty === 'Medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                      ${project.difficulty === 'Hard' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                    `}>
                      {project.difficulty}
                    </Badge>
                  )}
                  {project.is_public ? (
                    <Badge className="bg-blue-500 text-white dark:bg-blue-700">
                      <Eye className="w-3 h-3 mr-1" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <EyeOff className="w-3 h-3 mr-1" /> Private
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {project.github_url && (
                  <Button variant="link" size="sm" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-1" /> GitHub
                    </a>
                  </Button>
                )}
                {project.live_url && (
                  <Button variant="link" size="sm" asChild>
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <Share2 className="w-4 h-4 mr-1" /> Live Demo
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Project Add/Edit Form Modal */}
      {(isAddProjectModalOpen || isEditModalOpen) && (
        <Dialog open={isAddProjectModalOpen || isEditModalOpen} onOpenChange={handleCloseProjectForm}>
          <DialogContent className="sm:max-w-[700px] h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{projectToEdit ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            </DialogHeader>
            <ProjectForm
              projectData={projectToEdit}
              onSave={handleCloseProjectForm}
              onClose={handleCloseProjectForm}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* GitHub Import Wizard Modal */}
      {isGitHubImportModalOpen && (
        <Dialog open={isGitHubImportModalOpen} onOpenChange={handleCloseGitHubImportWizard}>
          <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Projects from GitHub</DialogTitle>
            </DialogHeader>
            <GitHubImportWizard onClose={handleCloseGitHubImportWizard} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectList;