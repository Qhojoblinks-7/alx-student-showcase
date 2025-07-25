// src/components/projects/ProjectList.jsx
import React, { memo } from 'react'; // Import memo
import { useSelector, useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    MoreHorizontal,
    Pencil,
    Share2,
    Eye,
    EyeOff,
    Trash2,
    PlusCircle,
    Github,
    Loader2,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';

import DashboardSummary from '@/components/DashboardSummary';
import { deleteProject, updateProject } from '@/store/slices/projectsSlice';
import { selectAllProjects, selectAuthStatus } from '@/store/selectors'; // Import memoized selectors
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

// IMPORT THE REDUX ACTION FOR OPENING THE WIZARD
import { openWizard } from '@/store/slices/githubSlice';


const ProjectCard = memo(({ project, onEdit, onDelete, isOwner }) => { // Memoize ProjectCard too
    const dispatch = useDispatch();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [isTogglingPublic, setIsTogglingPublic] = React.useState(false);

    const handleTogglePublic = async () => {
        setIsTogglingPublic(true);
        try {
            await dispatch(updateProject({ id: project.id, is_public: !project.is_public })).unwrap();
            toast.success(`Project is now ${project.is_public ? 'Private' : 'Public'}.`);
        } catch (err) {
            toast.error(`Failed to change visibility: ${err.message || 'Unknown error'}`);
        } finally {
            setIsTogglingPublic(false);
        }
    };

    const handleCopyShareLink = () => {
        const publicBaseUrl = window.location.origin.replace('/dashboard', '/showcase');
        const identifier = project.user_github_username || project.user_id;
        if (!identifier) {
            toast.error('Could not generate share link: User identifier missing.');
            return;
        }
        const shareLink = `${publicBaseUrl}/${identifier}/${project.id}`;

        navigator.clipboard.writeText(shareLink)
            .then(() => {
                toast.success('Share link copied to clipboard!');
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
                toast.error('Failed to copy link. Please try again.');
            });
    };

    const hasTruncatedDescription = project.description && project.description.length > 100;

    return (
        <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            {project.image_url && (
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://placehold.co/600x400/e0e0e0/000000?text=No+Image"; }}
                    />
                </div>
            )}
            <CardHeader className="pb-2 flex-grow">
                <CardTitle className="text-xl font-semibold leading-tight text-gray-900 dark:text-gray-50">
                    {project.title}
                </CardTitle>
                <CardDescription className={`text-sm text-muted-foreground ${hasTruncatedDescription ? 'line-clamp-3' : ''}`}>
                    {project.description}
                    {hasTruncatedDescription && (
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"> ...read more</span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50">
                                {project.description}
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col justify-end">
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                            {tech}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    {project.category && (
                        <span className="flex items-center">
                            <Info className="h-3 w-3 mr-1" />
                            {project.category}
                        </span>
                    )}
                    {project.difficulty && (
                        <span className="ml-auto">Difficulty: {project.difficulty}</span>
                    )}
                </div>

                <div className="flex justify-between items-center mt-auto">
                    {project.github_url && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => window.open(project.github_url, '_blank')}
                        >
                            <Github className="h-4 w-4 mr-1" /> GitHub
                        </Button>
                    )}

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 ml-auto">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => onEdit(project)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleTogglePublic} disabled={isTogglingPublic}>
                                    {isTogglingPublic ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : project.is_public ? (
                                        <EyeOff className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Eye className="mr-2 h-4 w-4" />
                                    )}
                                    {project.is_public ? 'Make Private' : 'Make Public'}
                                </DropdownMenuItem>
                                {project.is_public && (
                                    <DropdownMenuItem onClick={handleCopyShareLink}>
                                        <Share2 className="mr-2 h-4 w-4" /> Copy Share Link
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent dropdown from closing immediately
                                            setShowDeleteDialog(true);
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your project
                                                and remove its data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDelete(project.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}); // End memo for ProjectCard


const ProjectList = memo(() => { // Memoize ProjectList
    const dispatch = useDispatch();
    // Use memoized selectors where appropriate
    const projects = useSelector(selectAllProjects); // Get projects from memoized selector
    const projectsStatus = useSelector((state) => state.projects.status); // Get status directly
    const { user, isLoading: authLoading } = useSelector(selectAuthStatus); // Use memoized auth status

    const { handleOpenProjectForm } = useOutletContext() || {};

    // Log to observe renders of ProjectList
    console.log('ProjectList render: Status =', projectsStatus, 'Projects count =', projects.length);

    const isLoading = projectsStatus === 'loading' || authLoading;

    const handleEditProject = (project) => {
        if (handleOpenProjectForm) {
            handleOpenProjectForm(project);
        }
    };

    const handleDeleteProject = (projectId) => {
        dispatch(deleteProject(projectId));
        toast.success('Project deleted successfully!');
    };

    const handleOpenGitHubWizard = () => {
        // Log to confirm this function is called when the button is clicked
        console.log('ProjectList: "Import from GitHub" button clicked. Dispatching openWizard() action.');
        dispatch(openWizard());
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col h-full animate-pulse">
                        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                        <CardHeader className="pb-2 flex-grow">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (projects.length === 0 && projectsStatus !== 'loading') { // Use projectsStatus here
        return (
            <div className="p-6 text-center text-muted-foreground">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">No Projects Found</h3>
                <p className="mb-6">It looks like you haven't added any projects yet. Let's get started!</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={handleOpenGitHubWizard} className="px-6 py-3 text-lg">
                        <Github className="mr-2 h-5 w-5" /> Import from GitHub
                    </Button>
                    <Button onClick={() => handleOpenProjectForm()} variant="outline" className="px-6 py-3 text-lg">
                        <PlusCircle className="mr-2 h-5 w-5" /> Add Project Manually
                    </Button>
                </div>
                <DashboardSummary />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <DashboardSummary />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Your Projects</h2>
                <div className="flex gap-2">
                    <Button onClick={handleOpenGitHubWizard} variant="outline" className="hidden sm:inline-flex">
                        <Github className="mr-2 h-4 w-4" /> Import from GitHub
                    </Button>
                    <Button onClick={() => handleOpenProjectForm()} className="hidden sm:inline-flex">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                    {/* Mobile buttons */}
                    <Button onClick={handleOpenGitHubWizard} size="icon" variant="outline" className="sm:hidden">
                        <Github className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleOpenProjectForm()} size="icon" className="sm:hidden">
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        isOwner={user?.id === project.user_id}
                    />
                ))}
            </div>
        </div>
    );
}); // End memo for ProjectList

export default ProjectList;