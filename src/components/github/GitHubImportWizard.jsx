import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { toast } from 'sonner';
import {
  Loader2,
  Github,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  User,
  GitFork,
  Star,
  Code,
  Zap,
} from 'lucide-react';
import {
  fetchUserRepositories,
  detectALXProjects,
  importSelectedProjects,
  setWizardStep,
  updateWizardData, // Corrected import name: updateWizardData
  toggleProjectSelection,
  resetWizard,
  clearGitHubErrors,
  clearSelection,
} from '@/store/slices/githubSlice.js';
import { useAuth } from '@/hooks/use-auth.js';
import { GitHubService } from '@/lib/github-service.js'; // Assuming this path is correct

export function GitHubImportWizard({ onClose, onImportComplete }) {
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get user from useAuth hook

  const {
    repositories,
    alxProjects,
    selectedProjects,
    isLoadingRepositories,
    isDetectingALX,
    isImporting,
    error,
    repositoryError,
    importError,
    wizardStep,
    wizardData,
  } = useSelector((state) => state.github);

  const [usernameInput, setUsernameInput] = useState(wizardData.username || '');

  // Effect to reset state when modal opens/closes
  useEffect(() => {
    if (wizardStep === 'username' && !usernameInput) {
      dispatch(resetWizard());
      dispatch(clearSelection()); // Clear any previous selections when starting over
    }
  }, [wizardStep, dispatch, usernameInput]);

  // Handle fetching repositories
  const handleFetchRepositories = useCallback(async () => {
    if (!usernameInput.trim()) {
      toast.error('Please enter a GitHub username.');
      return;
    }
    dispatch(clearGitHubErrors()); // Clear previous errors
    dispatch(updateWizardData({ username: usernameInput.trim() })); // Corrected usage: updateWizardData
    try {
      await dispatch(fetchUserRepositories(usernameInput.trim())).unwrap();
      dispatch(setWizardStep('select_repos'));
    } catch (err) {
      toast.error('Failed to fetch repositories: ' + (err.message || 'Unknown error'));
    }
  }, [usernameInput, dispatch]);

  // Handle detecting ALX projects
  const handleDetectALXProjects = useCallback(async () => {
    dispatch(clearGitHubErrors()); // Clear previous errors
    try {
      await dispatch(detectALXProjects({ repositories, username: wizardData.username })).unwrap();
      dispatch(setWizardStep('review_import'));
    } catch (err) {
      toast.error('Failed to detect ALX projects: ' + (err.message || 'Unknown error'));
    }
  }, [repositories, wizardData.username, dispatch]);

  // Handle final import
  const handleImportSelectedProjects = useCallback(async () => {
    if (!user?.id) {
      toast.error('User not authenticated. Please sign in.');
      return;
    }
    if (selectedProjects.length === 0) {
      toast.error('Please select at least one project to import.');
      return;
    }

    dispatch(clearGitHubErrors()); // Clear previous errors
    const projectsToImport = alxProjects.filter((p) =>
      selectedProjects.includes(p.id || p.full_name)
    );

    try {
      // Generate full project data for each selected ALX project
      const generatedProjects = await Promise.all(
        projectsToImport.map(async (repo) => {
          return await GitHubService.generateProjectData(repo, wizardData.username);
        })
      );

      const result = await dispatch(
        importSelectedProjects({ projectsToImport: generatedProjects, userId: user.id })
      ).unwrap();
      toast.success(`Successfully imported ${result.length} projects!`);
      onImportComplete(result); // Callback to parent
      onClose();
    } catch (err) {
      toast.error('Failed to import projects: ' + (err.message || 'Unknown error'));
    }
  }, [selectedProjects, alxProjects, user, dispatch, onImportComplete, onClose, wizardData.username]);

  const handleToggleProject = useCallback(
    (projectId) => {
      dispatch(toggleProjectSelection(projectId));
    },
    [dispatch]
  );

  const renderStepContent = () => {
    switch (wizardStep) {
      case 'username':
        return (
          <div className="space-y-4">
            <Label htmlFor="github-username">GitHub Username</Label>
            <Input
              id="github-username"
              placeholder="e.g., alx-student"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFetchRepositories()}
              disabled={isLoadingRepositories}
            />
            {repositoryError && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {repositoryError}
              </div>
            )}
            <Button
              onClick={handleFetchRepositories}
              disabled={isLoadingRepositories || !usernameInput.trim()}
              className="w-full"
            >
              {isLoadingRepositories ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Fetch Repositories
            </Button>
          </div>
        );

      case 'select_repos':
        if (repositories.length === 0) {
          return (
            <div className="text-center p-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>No repositories found for "{wizardData.username}".</p>
              <Button onClick={() => dispatch(setWizardStep('username'))} className="mt-4">
                Go Back
              </Button>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <DialogDescription>
              Select repositories to detect ALX projects from.
            </DialogDescription>
            <ScrollArea className="h-80 w-full rounded-md border p-4">
              {repositories.map((repo) => (
                <div key={repo.id} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={`repo-${repo.id}`}
                    checked={selectedProjects.includes(repo.id)}
                    onCheckedChange={() => handleToggleProject(repo.id)}
                  />
                  <Label htmlFor={`repo-${repo.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{repo.name}</span>
                    <p className="text-sm text-muted-foreground">{repo.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      {repo.language && (
                        <Badge variant="outline" className="px-1 py-0.5">
                          <Code className="h-3 w-3 mr-1" />
                          {repo.language}
                        </Badge>
                      )}
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-0.5" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center">
                        <GitFork className="h-3 w-3 mr-0.5" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </ScrollArea>
            {error && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => dispatch(setWizardStep('username'))}>
                Back
              </Button>
              <Button
                onClick={handleDetectALXProjects}
                disabled={isDetectingALX || selectedProjects.length === 0}
              >
                {isDetectingALX ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Detect ALX Projects ({selectedProjects.length})
              </Button>
            </div>
          </div>
        );

      case 'review_import':
        if (alxProjects.length === 0) {
          return (
            <div className="text-center p-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>No ALX projects detected from selected repositories.</p>
              <Button onClick={() => dispatch(setWizardStep('select_repos'))} className="mt-4">
                Back to Selection
              </Button>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <DialogDescription>
              Review the detected ALX projects. These will be imported into your showcase.
            </DialogDescription>
            <ScrollArea className="h-80 w-full rounded-md border p-4">
              {alxProjects.map((project) => (
                <div key={project.id || project.full_name} className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id={`alx-project-${project.id || project.full_name}`}
                    checked={selectedProjects.includes(project.id || project.full_name)}
                    onCheckedChange={() => handleToggleProject(project.id || project.full_name)}
                  />
                  <Label htmlFor={`alx-project-${project.id || project.full_1name}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{project.name}</span>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <Badge variant="secondary" className="px-1 py-0.5">
                        ALX Score: {project.alx_score?.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="px-1 py-0.5">
                        Confidence: {(project.alx_confidence * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline" className="px-1 py-0.5">
                        Category: {project.alx_category}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </ScrollArea>
            {importError && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {importError}
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => dispatch(setWizardStep('select_repos'))}>
                Back
              </Button>
              <Button
                onClick={handleImportSelectedProjects}
                disabled={isImporting || selectedProjects.length === 0}
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Import ({selectedProjects.length}) Projects
              </Button>
            </div>
          </div>
        );

      default:
        return <div className="text-center p-8">Unknown wizard step.</div>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import Projects from GitHub
          </DialogTitle>
          <DialogDescription>
            This wizard helps you find and import your ALX projects from GitHub.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${wizardStep === 'username' ? 'text-blue-600' : ''}`}>
              1. Enter Username
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className={`font-semibold ${wizardStep === 'select_repos' ? 'text-blue-600' : ''}`}>
              2. Select Repositories
            </span>
            <ArrowRight className="h-4 w-4" />
            <span className={`font-semibold ${wizardStep === 'review_import' ? 'text-blue-600' : ''}`}>
              3. Review & Import
            </span>
          </div>
        </div>

        <div className="py-4">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  );
}

GitHubImportWizard.propTypes = {
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func.isRequired,
};
