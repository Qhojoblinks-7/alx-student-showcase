// src/components/projects/ProjectForm.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '@/lib/validations/project';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils'; // Utility for conditional classnames
import { CalendarIcon, X, Loader2, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addProject, updateProject } from '@/store/slices/projectsSlice';
import { clearProfileStatus } from '../../store/slices/profileSlice';
import { toast } from 'sonner';

import {aiService} from '../service/ai-service'

const categories = ["Web Development", "Mobile App", "Data Science", "Machine Learning", "Game Development", "DevOps", "Cybersecurity", "UI/UX Design", "Other"];
const statuses = ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"];
const difficulties = ["Easy", "Medium", "Hard"];
const commonTechnologies = ["React", "Node.js", "Python", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS", "SQL", "PostgreSQL", "MongoDB", "Express", "Django", "Flask", "Next.js", "Docker", "AWS", "Azure", "GCP", "Figma", "Git", "C", "C++", "Java", "PHP", "Ruby", "Go", "Swift", "Kotlin"];
const timeUnits = ["hours", "days", "weeks"];

const ProjectForm = ({ open, onOpenChange, project = null }) => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.projects);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      image_url: project?.image_url || '',
      difficulty: project?.difficulty || 'Medium',
      category: project?.category || '',
      technologies: project?.technologies || [],
      tags: project?.tags || [],
      status: project?.status || 'Planning',
      completion_date: project?.completion_date ? format(new Date(project.completion_date), 'yyyy-MM-dd') : '',
      time_spent_hours: project?.time_spent_hours || undefined,
      time_spent_unit: project?.time_spent_unit || 'hours',
      github_url: project?.github_url || '',
      live_url: project?.live_url || '',
      key_learnings: project?.key_learnings || '',
      challenges_faced: project?.challenges_faced || '',
      is_public: project?.is_public || false,
      ai_summary: project?.ai_summary || '',
      ai_work_log: project?.ai_work_log || '',
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = form;
  const watchedTechnologies = watch('technologies');
  const watchedTags = watch('tags');
  const watchedCompletionDate = watch('completion_date');
  const watchedDescription = watch('description');
  const watchedKeyLearnings = watch('key_learnings');
  const watchedChallengesFaced = watch('challenges_faced');
  const watchedGithubUrl = watch('github_url');

  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState(false);
  const [isGeneratingAIWorkLog, setIsGeneratingAIWorkLog] = useState(false);

  // Reset form when project prop changes (for editing)
  useEffect(() => {
    if (project) {
      reset({
        title: project.title || '',
        description: project.description || '',
        image_url: project.image_url || '',
        difficulty: project.difficulty || 'Medium',
        category: project.category || '',
        technologies: project.technologies || [],
        tags: project.tags || [],
        status: project.status || 'Planning',
        completion_date: project.completion_date ? format(new Date(project.completion_date), 'yyyy-MM-dd') : '',
        time_spent_hours: project.time_spent_hours || undefined,
        time_spent_unit: project.time_spent_unit || 'hours',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        key_learnings: project.key_learnings || '',
        challenges_faced: project.challenges_faced || '',
        is_public: project.is_public || false,
        ai_summary: project.ai_summary || '',
        ai_work_log: project.ai_work_log || '',
      });
    } else {
      reset({ // Reset to default for new project
        title: '', description: '', image_url: '', difficulty: 'Medium', category: '',
        technologies: [], tags: [], status: 'Planning', completion_date: '',
        time_spent_hours: undefined, time_spent_unit: 'hours', github_url: '', live_url: '',
        key_learnings: '', challenges_faced: '', is_public: false, ai_summary: '', ai_work_log: '',
      });
    }
  }, [project, reset]);

  // Handle Redux action status for toasts
  useEffect(() => {
    if (status === 'succeeded') {
      toast.success(project ? "Project updated successfully!" : "Project added successfully!");
      onOpenChange(false); // Close modal
      dispatch(clearProjectStatus());
    } else if (status === 'failed' && error) {
      toast.error(`Operation failed: ${error}`);
      dispatch(clearProjectStatus());
    }
  }, [status, error, onOpenChange, dispatch, project]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      // Ensure completion_date is null if empty string, or a valid ISO string
      completion_date: data.completion_date ? new Date(data.completion_date).toISOString() : null,
      // Ensure time_spent_hours is null if undefined
      time_spent_hours: data.time_spent_hours === undefined ? null : data.time_spent_hours,
      // Ensure empty strings for URLs/textareas become null if desired by DB schema
      image_url: data.image_url || null,
      github_url: data.github_url || null,
      live_url: data.live_url || null,
      key_learnings: data.key_learnings || null,
      challenges_faced: data.challenges_faced || null,
      tags: data.tags?.length > 0 ? data.tags : null, // Store null if empty array
      technologies: data.technologies?.length > 0 ? data.technologies : null, // Store null if empty array
    };

    if (project) {
      dispatch(updateProject({ id: project.id, ...payload }));
    } else {
      dispatch(addProject(payload));
    }
  };

  const handleTechnologyToggle = (tech) => {
    const currentTechnologies = watchedTechnologies || [];
    if (currentTechnologies.includes(tech)) {
      setValue('technologies', currentTechnologies.filter((t) => t !== tech), { shouldValidate: true });
    } else {
      setValue('technologies', [...currentTechnologies, tech], { shouldValidate: true });
    }
  };

  const handleTagToggle = (tag) => {
    const currentTags = watchedTags || [];
    if (currentTags.includes(tag)) {
      setValue('tags', currentTags.filter((t) => t !== tag), { shouldValidate: true });
    } else {
      setValue('tags', [...currentTags, tag], { shouldValidate: true });
    }
  };

  const handleAddCustomTech = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      const newTech = e.target.value.trim();
      if (!watchedTechnologies.includes(newTech)) {
        setValue('technologies', [...watchedTechnologies, newTech], { shouldValidate: true });
      }
      e.target.value = ''; // Clear input
    }
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!watchedTags.includes(newTag)) {
        setValue('tags', [...watchedTags, newTag], { shouldValidate: true });
      }
      e.target.value = ''; // Clear input
    }
  };

  const handleGenerateAISummary = async () => {
    setIsGeneratingAISummary(true);
    try {
      const prompt = `Generate a concise, professional, and engaging summary (max 150 words) suitable for a portfolio. Focus on the project's purpose, key features, and technologies used.
      Project Description: ${watchedDescription}
      Key Learnings: ${watchedKeyLearnings}
      Challenges Faced: ${watchedChallengesFaced}
      GitHub URL: ${watchedGithubUrl || 'N/A'}`;

      const summary = await aiService.generateText(prompt); // Corrected this line
      setValue('ai_summary', summary);
      toast.success("AI summary generated!");
    } catch (err) {
      toast.error("Failed to generate AI summary. " + (err.message || "Please try again."));
      console.error("AI Summary Generation Error:", err);
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  const handleGenerateAIWorkLog = async () => {
    setIsGeneratingAIWorkLog(true);
    try {
      if (!watchedGithubUrl) {
        toast.warning("GitHub URL is required to generate a work log from commit history.");
        setIsGeneratingAIWorkLog(false);
        return;
      }
      const prompt = `Analyze the commit messages and activities from the GitHub repository at ${watchedGithubUrl}. Generate a structured work log summary (max 200 words) highlighting key development phases, challenges overcome, and major features implemented, as if documenting the project's progress.`;
      // In a real scenario, aiService.generateWorkLog might take the GitHub URL and fetch commits itself
      const workLog = await aiService.generateText(prompt);
      setValue('ai_work_log', workLog);
      toast.success("AI work log generated!");
    } catch (err) {
      toast.error("Failed to generate AI work log. " + (err.message || "Please try again."));
      console.error("AI Work Log Generation Error:", err);
    } finally {
      setIsGeneratingAIWorkLog(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Make changes to your project here.' : 'Create a new project to start managing your showcase.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea id="description" {...register('description')} className="min-h-[120px]" />
                <p className="text-xs text-muted-foreground mt-1">
                  {watchedDescription.length}/2000 characters
                </p>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="image_url">Image URL (Optional)</Label>
                <Input id="image_url" {...register('image_url')} placeholder="e.g., https://example.com/screenshot.png" />
                {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setValue('category', value, { shouldValidate: true })} value={watch('category')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              {/* Difficulty */}
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select onValueChange={(value) => setValue('difficulty', value, { shouldValidate: true })} value={watch('difficulty')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficulty && <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue('status', value, { shouldValidate: true })} value={watch('status')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
              </div>

              {/* Public Project Switch */}
              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  id="is_public"
                  checked={watch('is_public')}
                  onCheckedChange={(checked) => setValue('is_public', checked)}
                />
                <Label htmlFor="is_public">Make Project Public (Visible on Showcase)</Label>
                {errors.is_public && <p className="text-red-500 text-sm mt-1">{errors.is_public.message}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Technologies */}
              <div>
                <Label htmlFor="technologies">Technologies Used</Label>
                <div className="flex flex-wrap gap-2 py-2 border rounded-md min-h-[40px] p-2">
                  {watchedTechnologies.map((tech) => (
                    <Badge key={tech} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {tech}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleTechnologyToggle(tech)} />
                    </Badge>
                  ))}
                  <Input
                    id="technologies"
                    placeholder="Add technology (e.g., React, Python)"
                    onKeyDown={handleAddCustomTech}
                    className="flex-grow border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                {errors.technologies && <p className="text-red-500 text-sm mt-1">{errors.technologies.message}</p>}
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Keywords/Tags (Optional)</Label>
                <div className="flex flex-wrap gap-2 py-2 border rounded-md min-h-[40px] p-2">
                  {watchedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
                    </Badge>
                  ))}
                  <Input
                    id="tags"
                    placeholder="Add tags (e.g., AI, blockchain)"
                    onKeyDown={handleAddCustomTag}
                    className="flex-grow border-none focus-visible:ring-0 shadow-none"
                  />
                </div>
                {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>}
              </div>

              {/* Completion Date */}
              <div>
                <Label htmlFor="completion_date">Completion Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedCompletionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedCompletionDate ? format(new Date(watchedCompletionDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedCompletionDate ? new Date(watchedCompletionDate) : undefined}
                      onSelect={(date) => setValue('completion_date', date ? format(date, 'yyyy-MM-dd') : '', { shouldValidate: true })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.completion_date && <p className="text-red-500 text-sm mt-1">{errors.completion_date.message}</p>}
              </div>

              {/* Time Spent */}
              <div>
                <Label htmlFor="time_spent_hours">Time Spent (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="time_spent_hours"
                    type="number"
                    {...register('time_spent_hours', { valueAsNumber: true })}
                    placeholder="e.g., 40"
                    min="0"
                  />
                  <Select onValueChange={(value) => setValue('time_spent_unit', value, { shouldValidate: true })} value={watch('time_spent_unit')}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.time_spent_hours && <p className="text-red-500 text-sm mt-1">{errors.time_spent_hours.message}</p>}
              </div>

              {/* GitHub URL */}
              <div>
                <Label htmlFor="github_url">GitHub Repository URL</Label>
                <Input id="github_url" {...register('github_url')} placeholder="e.g., https://github.com/user/repo" />
                {errors.github_url && <p className="text-red-500 text-sm mt-1">{errors.github_url.message}</p>}
              </div>

              {/* Live URL */}
              <div>
                <Label htmlFor="live_url">Live Demo URL (Optional)</Label>
                <Input id="live_url" {...register('live_url')} placeholder="e.g., https://my-app.netlify.app" />
                {errors.live_url && <p className="text-red-500 text-sm mt-1">{errors.live_url.message}</p>}
              </div>

              {/* Key Learnings */}
              <div>
                <Label htmlFor="key_learnings">Key Learnings & Takeaways (Optional)</Label>
                <Textarea id="key_learnings" {...register('key_learnings')} className="min-h-[100px]" />
                <p className="text-xs text-muted-foreground mt-1">
                  {watchedKeyLearnings.length}/2000 characters
                </p>
                {errors.key_learnings && <p className="text-red-500 text-sm mt-1">{errors.key_learnings.message}</p>}
              </div>

              {/* Challenges Faced */}
              <div>
                <Label htmlFor="challenges_faced">Challenges Faced & Solutions (Optional)</Label>
                <Textarea id="challenges_faced" {...register('challenges_faced')} className="min-h-[100px]" />
                <p className="text-xs text-muted-foreground mt-1">
                  {watchedChallengesFaced.length}/2000 characters
                </p>
                {errors.challenges_faced && <p className="text-red-500 text-sm mt-1">{errors.challenges_faced.message}</p>}
              </div>

              {/* AI Content Display & Regeneration */}
              <div className="space-y-4 pt-4 border-t mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" /> AI-Generated Content
                </h3>
                <div>
                  <Label htmlFor="ai_summary">AI-Generated Summary</Label>
                  <Textarea id="ai_summary" {...register('ai_summary')} readOnly className="min-h-[100px] bg-gray-50 dark:bg-gray-700" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingAISummary || isSubmitting}
                    className="mt-2"
                  >
                    {isGeneratingAISummary ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Regenerate AI Summary
                  </Button>
                </div>
                <div>
                  <Label htmlFor="ai_work_log">AI-Generated Work Log</Label>
                  <Textarea id="ai_work_log" {...register('ai_work_log')} readOnly className="min-h-[100px] bg-gray-50 dark:bg-gray-700" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleGenerateAIWorkLog}
                    disabled={isGeneratingAIWorkLog || isSubmitting || !watchedGithubUrl}
                    className="mt-2"
                  >
                    {isGeneratingAIWorkLog ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate AI Work Log
                  </Button>
                  {!watchedGithubUrl && (
                    <p className="text-xs text-orange-500 mt-1">
                      *A GitHub URL is required to generate a work log.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (project ? 'Saving...' : 'Adding...') : (project ? 'Save Changes' : 'Add Project')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;