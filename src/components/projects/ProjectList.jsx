import { forwardRef, createContext, useContext } from 'react'; // Added createContext, useContext, forwardRef
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth.js';
import { toast } from 'sonner';
import { cn } from '../../lib/utils'; // Assuming cn utility is here or accessible

// Import Redux thunks and selectors
import { 
  deleteProject, 
  updateProject // For toggleVisibility
} from '../../store/slices/projectsSlice.js'; // Removed fetchProjects from import as it's handled by Dashboard

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
  Trash2,
  AlertTriangle // Added AlertTriangle for error display
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

// --- Tabs Component Refactor (from tabs.jsx) ---
const TabsContext = createContext(null);

const Tabs = forwardRef(({ className, value, onValueChange, children, ...props }, ref) => ( // Destructure children explicitly
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div ref={ref} className={cn('w-full', className)} {...props}>
      {children} {/* Render children inside the div */}
    </div>
  </TabsContext.Provider>
));
Tabs.displayName = 'Tabs';

const TabsList = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    role="tablist" // Added for accessibility
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = forwardRef(({ className, value, ...props }, ref) => {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow-sm' : 'data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground', // Dynamically apply active/inactive styles
        className
      )}
      data-state={isActive ? 'active' : 'inactive'} // Set data-state attribute
      onClick={() => context.onValueChange?.(value)} // Call onValueChange from context
      role="tab" // Added for accessibility
      aria-selected={isActive} // Added for accessibility
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = forwardRef(({ className, value, ...props }, ref) => {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  if (!isActive) return null; // Only render content if it's the active tab

  return (
    <div
      ref={ref}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      role="tabpanel" // Added for accessibility
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

// PropTypes for the refactored Tabs components
Tabs.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired, // Ensure children are passed
};

TabsList.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

TabsTrigger.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired, // Value is now required for trigger
  children: PropTypes.node.isRequired,
};

TabsContent.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired, // Value is now required for content
  children: PropTypes.node.isRequired,
};
// --- End Tabs Component Refactor ---


export function ProjectList({ onEdit, onShare, filters }) {
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get user from your auth hook

  // Get projects, loading, and error states from Redux store using direct useSelector
  const projects = useSelector(state => state.projects.projects);
  const loading = useSelector(state => state.projects.isLoading);
  const error = useSelector(state => state.projects.error); // Get error state

  const [filteredProjects, setFilteredProjects] = useState([]);

  // Removed useEffect for fetching projects as Dashboard now controls rendering based on these.
  // The Dashboard component dispatches fetchProjects, so ProjectList only needs to consume it.
  // useEffect(() => {
  //   if (user && !loading) {
  //     dispatch(fetchProjects(user.id));
  //   }
  // }, [user, dispatch, loading]);

  useEffect(() => {
    let result = projects.slice(); // Clone the array to avoid modifying the original

    if (filters.query) {
      result = result.filter((project) =>
        project.title.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    if (filters.tags) {
      result = result.filter((project) =>
        project.tags.some((tag) => tag.toLowerCase().includes(filters.tags.toLowerCase()))
      );
    }

    if (filters.technologies) {
      result = result.filter((project) =>
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(filters.technologies.toLowerCase())
        )
      );
    }

    if (filters.sortBy === 'popularity') {
      result = result.sort((a, b) => b.popularity - a.popularity);
    } else if (filters.sortBy === 'recency') {
      result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProjects(result);
  }, [filters, projects]);

  const handleDeleteProject = async (projectId) => {
    toast('Are you sure you want to delete this project?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          try {
            await dispatch(deleteProject(projectId)).unwrap();
            toast.success('Project deleted successfully!');
          } catch (err) {
            toast.error('Failed to delete project: ' + (err.message || 'Unknown error'));
            console.error('Error deleting project:', err);
          }
        },
      },
      duration: 5000, 
    });
  };

  const handleToggleVisibility = async (projectId, isPublic) => {
    try {
      // Use the updateProject thunk to change the is_public status
      await dispatch(updateProject({ id: projectId, projectData: { is_public: !isPublic } })).unwrap();
      toast.success(`Project visibility set to ${!isPublic ? 'public' : 'private'}`);
    } catch (err) {
      toast.error('Failed to update visibility: ' + (err.message || 'Unknown error'));
      console.error('Error updating project visibility:', err);
    }
  };

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
      case 'mobile': return 'bg-purple-100 text-purple-80';
      case 'backend': return 'bg-orange-100 text-orange-800';
      case 'data-science': return 'bg-pink-100 text-pink-800';
      case 'ai': return 'bg-teal-100 text-teal-800'; // Added AI category
      case 'devops': return 'bg-indigo-100 text-indigo-800'; // Added DevOps category
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <Card className="text-center py-12 bg-red-50 border border-red-200 text-red-800">
        <CardContent>
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-sm">{error}</p>
          <Button onClick={() => user && dispatch(fetchProjects(user.id))} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
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

  const displayedProjects = filteredProjects.length > 0 ? filteredProjects : projects;

  return (
    <div className="space-y-6">
      {displayedProjects.map((project) => {
        // --- DEBUG LOG FOR EACH PROJECT ---
        console.log('ProjectList - Mapping project:', project);
        // --- END DEBUG LOG ---
        return (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {/* Flex container for title/description and action buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
                <div className="flex-1 min-w-0"> {/* flex-1 and min-w-0 to allow shrinking */}
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold break-words"> {/* Added break-words */}
                    {project.title}
                    {project.is_public ? (
                      <Eye className="h-4 w-4 text-green-600 flex-shrink-0" /> /* flex-shrink-0 for icons */
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" /> /* flex-shrink-0 for icons */
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-muted-foreground break-words"> {/* Added break-words */}
                    {project.description}
                  </CardDescription>
                </div>
                {/* Button group: flex-shrink-0 to prevent shrinking, flex-wrap for mobile */}
                <div className="flex flex-wrap gap-2 flex-shrink-0 mt-2 sm:mt-0"> 
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVisibility(project.id, project.is_public)}
                  >
                    {project.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  >
                    <Trash2 className="h-4 w-4" />
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
                <Badge className={getDifficultyColor(project.difficulty_level)}>
                  {project.difficulty_level}
                </Badge>
                {/* Corrected from project_type to category */}
                <Badge className={getProjectTypeColor(project.category)}> 
                  {project.category}
                </Badge>
                {project.technologies?.map((tech, index) => ( // Use technologies instead of tech_stack
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>

              {project.tags?.length > 0 && ( // Check if tags exist and have length
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"> {/* Added flex-wrap */}
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

              <div className="flex flex-wrap gap-2"> {/* Added flex-wrap */}
                {project.github_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </a>
                  </Button>
                )}
                {project.live_url && ( // Use live_url instead of live_demo_url
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
                      <p className="text-sm text-muted-foreground break-words">{project.key_learnings}</p> {/* Added break-words */}
                    </div>
                  )}
                  {project.challenges_faced && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Challenges Faced</h4>
                      <p className="text-sm text-muted-foreground break-words">{project.challenges_faced}</p> {/* Added break-words */}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

ProjectList.propTypes = {
  onEdit: PropTypes.func,
  onShare: PropTypes.func,
};
