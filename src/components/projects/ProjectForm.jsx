import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';
import { Button } from './../ui/button.jsx';
import { Input } from './../ui/input.jsx';
import { Label } from './../ui/label.jsx';
import { Textarea } from './../ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../ui/select.jsx';
import { Badge } from './../ui/badge.jsx';
import { Switch } from './../ui/switch.jsx';
import { toast } from 'sonner';
import { Loader2, Plus, X, Calendar } from 'lucide-react';

export function ProjectForm({ projectId, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tech_stack: [],
    github_url: '',
    live_demo_url: '',
    project_type: 'web',
    difficulty_level: 'beginner',
    completion_date: '',
    time_spent_hours: null,
    key_learnings: '',
    challenges_faced: '',
    image_url: '',
    tags: [],
    is_public: true,
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTechStack = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      updateFormData('tech_stack', [...formData.tech_stack, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechStack = (tech) => {
    updateFormData('tech_stack', formData.tech_stack.filter(t => t !== tech));
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
    if (!user) return;

    setLoading(true);
    try {
      const projectData = {
        user_id: user.id,
        ...formData,
        completion_date: formData.completion_date || null,
      };

      const { error } = projectId
        ? await supabase.from('projects').update(projectData).eq('id', projectId)
        : await supabase.from('projects').insert([projectData]);

      if (error) throw error;

      toast.success(projectId ? 'Project updated successfully!' : 'Project added successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{projectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
        <CardDescription>
          Document your coding journey and share your achievements with the ALX community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="project_type">Project Type</Label>
              <Select value={formData.project_type} onValueChange={(value) => updateFormData('project_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Application</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="backend">Backend/API</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Select value={formData.difficulty_level} onValueChange={(value) => updateFormData('difficulty_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="live_demo_url">Live Demo URL</Label>
              <Input
                id="live_demo_url"
                placeholder="https://myproject.vercel.app"
                value={formData.live_demo_url}
                onChange={(e) => updateFormData('live_demo_url', e.target.value)}
              />
            </div>

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

          <div>
            <Label>Tech Stack</Label>
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
              {formData.tech_stack.map((tech, index) => (
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

          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => updateFormData('is_public', checked)}
            />
            <Label htmlFor="is_public">Make this project public</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {projectId ? 'Update Project' : 'Add Project'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
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
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};
