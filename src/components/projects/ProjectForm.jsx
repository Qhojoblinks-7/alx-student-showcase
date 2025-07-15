import { useState, useEffect } from 'react'; // Added useEffect
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth.js';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { addProject, updateProject as updateProjectThunk } from '../../store/slices/projectsSlice.js'; // Import Redux thunks
import { Button } from './../ui/button.jsx';
import { Input } from './../ui/input.jsx';
import { Label } from './../ui/label.jsx';
import { Textarea } from './../ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../ui/select.jsx';
import { Badge } from './../ui/badge.jsx';
import { Switch } from './../ui/switch.jsx';
import { toast } from 'sonner';
import { Loader2, Plus, X, Calendar, Link, Image, Lightbulb, TrendingUp, GitFork, BookOpen, Layers, Eye } from 'lucide-react'; // Added more icons

export function ProjectForm({ projectId, initialData, onSuccess, onCancel }) { // Added initialData prop
  const { user } = useAuth();
  const dispatch = useDispatch(); // Initialize useDispatch
  const [loading, setLoading] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [], // Changed from tech_stack to technologies
    github_url: '',
    live_url: '', // Changed from live_demo_url to live_url
    category: 'web', // Changed from project_type to category
    difficulty_level: 'beginner',
    completion_date: '',
    time_spent_hours: null,
    key_learnings: '',
    challenges_faced: '',
    image_url: '',
    tags: [],
    is_public: true,
  });

  // Populate form data if initialData is provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        technologies: initialData.technologies || [],
        github_url: initialData.github_url || '',
        live_url: initialData.live_url || '',
        category: initialData.category || 'web',
        difficulty_level: initialData.difficulty_level || 'beginner',
        completion_date: initialData.completion_date ? initialData.completion_date.split('T')[0] : '', // Format date for input
        time_spent_hours: initialData.time_spent_hours || null,
        key_learnings: initialData.key_learnings || '',
        challenges_faced: initialData.challenges_faced || '',
        image_url: initialData.image_url || '',
        tags: initialData.tags || [],
        is_public: initialData.is_public ?? true, // Use nullish coalescing for boolean
      });
    }
  }, [initialData]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTechStack = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) { // Changed to technologies
      updateFormData('technologies', [...formData.technologies, newTech.trim()]); // Changed to technologies
      setNewTech('');
    }
  };

  const removeTechStack = (tech) => {
    updateFormData('technologies', formData.technologies.filter(t => t !== tech)); // Changed to technologies
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to save a project.');
      return;
    }

    setLoading(true);
    try {
      const projectDataToSave = {
        user_id: user.id,
        ...formData,
        // Ensure arrays are not empty, default to empty array if null/undefined
        technologies: formData.technologies || [],
        tags: formData.tags || [],
        // Convert empty string dates to null for Supabase
        completion_date: formData.completion_date || null,
        time_spent_hours: formData.time_spent_hours || null,
      };

      let result;
      if (projectId) {
        result = await dispatch(updateProjectThunk({ id: projectId, projectData: projectDataToSave })).unwrap();
      } else {
        result = await dispatch(addProject(projectDataToSave)).unwrap();
      }

      toast.success(projectId ? 'Project updated successfully!' : 'Project added successfully!');
      onSuccess?.(result); // Pass the result back to the parent
    } catch (error) {
      console.error('Error saving project:', error.message);
      toast.error('Failed to save project: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-4 sm:p-6"> {/* Added responsive padding */}
      <CardHeader className="mb-6"> {/* Added margin-bottom */}
        <CardTitle className="text-2xl font-bold">{projectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Document your coding journey and share your achievements with the ALX community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased overall spacing */}
          {/* Section: Basic Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-500" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Project"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your project does and what problem it solves..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Project Category</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Application</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="backend">Backend/API</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="ai">AI/Machine Learning</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select value={formData.difficulty_level} onValueChange={(value) => updateFormData('difficulty_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Project Links & Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Link className="h-5 w-5 text-green-500" /> Links & Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  placeholder="https://github.com/username/project"
                  value={formData.github_url}
                  onChange={(e) => updateFormData('github_url', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="live_url">Live Demo URL</Label>
                <Input
                  id="live_url"
                  placeholder="https://myproject.vercel.app"
                  value={formData.live_url}
                  onChange={(e) => updateFormData('live_url', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="image_url">Project Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://example.com/project-screenshot.png"
                  value={formData.image_url}
                  onChange={(e) => updateFormData('image_url', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Project Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-purple-500" /> Project Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="completion_date">Completion Date</Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => updateFormData('completion_date', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="time_spent_hours">Time Spent (Hours)</Label>
                <Input
                  id="time_spent_hours"
                  type="number"
                  placeholder="40"
                  value={formData.time_spent_hours || ''}
                  onChange={(e) => updateFormData('time_spent_hours', e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
            </div>
          </div>

          {/* Section: Technical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Layers className="h-5 w-5 text-orange-500" /> Technical Details
            </h3>
            <div>
              <Label>Technologies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add technology (e.g., React, Python)"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                />
                <Button type="button" onClick={addTechStack} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechStack(tech)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag (e.g., full-stack, API, responsive)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Reflections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" /> Reflections
            </h3>
            <div>
              <Label htmlFor="key_learnings">Key Learnings</Label>
              <Textarea
                id="key_learnings"
                placeholder="What did you learn from this project? What skills did you develop?"
                rows={3}
                value={formData.key_learnings}
                onChange={(e) => updateFormData('key_learnings', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="challenges_faced">Challenges Faced</Label>
              <Textarea
                id="challenges_faced"
                placeholder="What difficulties did you encounter and how did you overcome them?"
                rows={3}
                value={formData.challenges_faced}
                onChange={(e) => updateFormData('challenges_faced', e.target.value)}
              />
            </div>
          </div>

          {/* Section: Visibility Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-gray-500" /> Visibility
            </h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => updateFormData('is_public', checked)}
              />
              <Label htmlFor="is_public">Make this project public</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"> {/* Added border-top for separation */}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {projectId ? 'Update Project' : 'Add Project'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

ProjectForm.propTypes = {
  projectId: PropTypes.string,
  initialData: PropTypes.object, // Added initialData propType
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};
