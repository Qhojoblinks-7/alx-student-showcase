import { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks'
import { fetchProjects, deleteProject, toggleProjectVisibility} from '../../store/slices/projectsSlice.js'; // Import thunks and selectors
import { supabase } from '../../lib/supabase'; // Still needed for direct DB operations like delete/toggle
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Skeleton } from '../ui/skeleton.jsx';
import { 
  Github, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Eye, 
  EyeOff,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { selectProjects, useProjectsLoading } from '../../lib/redux-selectors.js'; // Import selectors from redux-selectors



export function ProjectList({ onEdit, onShare }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth); // Get user from auth slice
  const projects = useAppSelector(selectProjects); // Get projects from Redux store
  const { isLoading, isDeleting, isUpdating } = useAppSelector(useProjectsLoading); // Get loading states

  // Fetch projects when user is available or when component mounts
  // The actual dispatch of fetchProjects for initial load should ideally happen in Dashboard.jsx
  // This useEffect here ensures that if projects are not in store, they are fetched.
  useEffect(() => {
    if (user?.id && projects.length === 0 && !isLoading) {
      dispatch(fetchProjects(user.id));
    }
  }, [user, projects.length, isLoading, dispatch]);

  const handleDeleteProject = useCallback(async (projectId) => {
    // In a real app, use a custom modal for confirmation.
    // For this example, we'll use a simple window.confirm for immediate functionality.
    const confirmDelete = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await dispatch(deleteProject(projectId)).unwrap();
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error.message ? String(error.message) : String(error));
      toast.error('Failed to delete project: ' + (error.message || 'Unknown error'));
    }
  }, [dispatch]);

  const handleToggleVisibility = useCallback(async (projectId, isPublic) => {
    try {
      await dispatch(toggleProjectVisibility({ id: projectId, is_public: !isPublic })).unwrap();
      toast.success(`Project visibility set to ${!isPublic ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error updating project visibility:', error.message ? String(error.message) : String(error));
      toast.error('Failed to update visibility: ' + (error.message || 'Unknown error'));
    }
  }, [dispatch]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'web': return 'bg-blue-100 text-blue-800';
      case 'mobile': return 'bg-purple-100 text-purple-800';
      case 'backend': return 'bg-orange-100 text-orange-800';
      case 'data-science': return 'bg-pink-100 text-pink-800';
      case 'ai': return 'bg-teal-100 text-teal-800'; // Added AI category
      case 'devops': return 'bg-indigo-100 text-indigo-800'; // Added DevOps category
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Share2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Start documenting your coding journey by adding your first project!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {project.title}
                  {project.is_public ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </CardTitle>
                <CardDescription className="mt-2">
                  {project.description}
                </CardDescription>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleVisibility(project.id, project.is_public)}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : (project.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onShare?.(project)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit?.(project)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteProject(project.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.image_url && (
              <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {/* Ensure project_type and difficulty_level exist before rendering badges */}
              {project.difficulty_level && (
                <Badge className={getDifficultyColor(project.difficulty_level)}>
                  {project.difficulty_level}
                </Badge>
              )}
              {project.category && ( // Changed from project_type to category
                <Badge className={getProjectTypeColor(project.category)}>
                  {project.category}
                </Badge>
              )}
              {project.technologies?.map((tech, index) => ( // Changed from tech_stack to technologies
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>

            {project.tags?.length > 0 && ( // Added optional chaining for tags
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {project.completion_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(project.completion_date), 'MMM dd, yyyy')}
                </div>
              )}
              {project.time_spent_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {project.time_spent_hours}h
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {project.github_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Code
                  </a>
                </Button>
              )}
              {project.live_url && ( // Changed from live_demo_url to live_url
                <Button size="sm" variant="outline" asChild>
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>

            {(project.key_learnings || project.challenges_faced) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {project.key_learnings && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Learnings</h4>
                    <p className="text-sm text-muted-foreground">{project.key_learnings}</p>
                  </div>
                )}
                {project.challenges_faced && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Challenges Faced</h4>
                    <p className="text-sm text-muted-foreground">{project.challenges_faced}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

ProjectList.propTypes = {
  onEdit: PropTypes.func,
  onShare: PropTypes.func,
};
