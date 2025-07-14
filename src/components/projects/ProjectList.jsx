import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase'
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

export function ProjectList({ onEdit, onShare }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  

=======
>>>>>>> 6ec6261e759395dd9f49a69591a7d1f20bf29527
  const fetchProjects = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  },[user]);
=======
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);
>>>>>>> 6ec6261e759395dd9f49a69591a7d1f20bf29527

  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const toggleVisibility = async (projectId, isPublic) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_public: !isPublic })
        .eq('id', projectId);

      if (error) throw error;
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, is_public: !isPublic } : p
      ));
    } catch (error) {
      console.error('Error updating project visibility:', error);
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
      case 'mobile': return 'bg-purple-100 text-purple-800';
      case 'backend': return 'bg-orange-100 text-orange-800';
      case 'data-science': return 'bg-pink-100 text-pink-800';
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
                  onClick={() => toggleVisibility(project.id, project.is_public)}
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
                  onClick={() => deleteProject(project.id)}
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
              <Badge className={getProjectTypeColor(project.project_type)}>
                {project.project_type}
              </Badge>
              {project.tech_stack.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>

            {project.tags.length > 0 && (
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
              {project.live_demo_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer">
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