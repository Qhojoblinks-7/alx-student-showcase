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
  User, // For username section
  GitFork,
  Star,
  Code,
  Zap, // For detect ALX projects
  ListChecks, // For select repositories
  ClipboardCheck, // For review & import
} from 'lucide-react'; // Added more icons
import {
  fetchUserRepositories,
  detectALXProjects,
  importSelectedProjects,
  setWizardStep,
  setWizardData,
  toggleProjectSelection,
  resetWizard,
  clearGitHubErrors,
  clearSelection,
} from '@/store/slices/githubSlice.js';
import { useAuth } from '@/hooks/use-auth.js';
import { GitHubService, ALXProjectDetector } from '@/lib/github-service.js'; // Import ALXProjectDetector
import { GitLabService, BitbucketService } from '@/lib/platform-services.js'; // Import services for GitLab and Bitbucket
import { Select } from '@/components/ui/select.jsx'; // Import Select component

export function GitHubImportWizard({ onClose, onImportComplete }) {
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get user from useAuth hook

  const {
    repositories,
    alxProjects, // This already contains the processed project data
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
  const [platform, setPlatform] = useState('GitHub'); // Add platform state

  // Effect to reset state when modal opens/closes
  useEffect(() => {
    if (wizardStep === 'username' && !usernameInput) {
      dispatch(resetWizard());
      dispatch(clearSelection()); // Clear any previous selections when starting over
    }
  }, [wizardStep, dispatch, usernameInput]);

  // Helper function to get a readable error message
  const getErrorMessage = (err) => {
    if (err instanceof Error) {
      return err.message;
    }
    // Check if it's a Redux Toolkit unwrap error with a payload
    if (err && typeof err === 'object' && err.payload) {
      return String(err.payload);
    }
    // Fallback for other non-Error objects
    return String(err) || 'Unknown error';
  };

  // Handle fetching repositories
  const handleFetchRepositories = useCallback(async () => {
    if (!usernameInput.trim()) {
      toast.error('Please enter a username.');
      return;
    }

    dispatch(clearGitHubErrors());
    dispatch(setWizardData({ username: usernameInput.trim() }));

    try {
      let repositories;
      if (platform === 'GitHub') {
        repositories = await GitHubService.fetchUserRepositories(usernameInput.trim());
      } else if (platform === 'GitLab') {
        repositories = await GitLabService.fetchUserRepositories(usernameInput.trim());
      } else if (platform === 'Bitbucket') {
        repositories = await BitbucketService.fetchUserRepositories(usernameInput.trim());
      }

      dispatch(setRepositories(repositories));
      dispatch(setWizardStep('select_repos'));
    } catch (err) {
      console.error('Error fetching repositories:', err);
      toast.error('Failed to fetch repositories: ' + err.message);
    }
  }, [platform, usernameInput, dispatch]);

  // Handle detecting ALX projects (for manual trigger from select_repos step)
  const handleDetectALXProjects = useCallback(async () => {
    dispatch(clearGitHubErrors()); // Clear previous errors
    try {
      // This will use the current `repositories` and `selectedProjects` from Redux state
      // Pass repositories and username explicitly as required by the thunk
      await dispatch(detectALXProjects({ repositories: repositories, username: wizardData.username })).unwrap();
      dispatch(setWizardStep('review_import'));
    } catch (err) {
      // Log the full error object for debugging
      console.error('Error in handleDetectALXProjects:', err);
      toast.error('Failed to detect ALX projects: ' + getErrorMessage(err));
    }
  }, [dispatch, repositories, wizardData.username]);

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
    
    // Filter directly from 'alxProjects' which already contain the processed data.
    const projectsToInsert = alxProjects.filter((alxProject) =>
      selectedProjects.includes(alxProject.id) // alxProject.id is the GitHub repo ID
    ).map(alxProject => ({
      user_id: user.id,
      // Removed 'id: alxProject.id' to allow Supabase to auto-generate UUID
      title: alxProject.title,
      description: alxProject.description,
      technologies: alxProject.technologies,
      github_url: alxProject.github_url,
      live_url: alxProject.live_url,
      category: alxProject.category,
      original_repo_name: alxProject.original_repo_name,
      alx_confidence: alxProject.alx_confidence || 0.0,
      last_updated: alxProject.last_updated,
      is_public: alxProject.is_public,
      completion_date: null,
      time_spent_hours: null,
      key_learnings: '',
      challenges_faced: '',
      image_url: '',
      tags: [],
    }));

    try {
      if (projectsToInsert.length === 0) {
        toast.warning('No valid ALX projects could be prepared for import. This might be due to API access issues or missing READMEs for the selected projects, or an internal state mismatch. Check console for details.');
        onClose();
        return;
      }

      // FIX: Pass projectsToInsert and userId as an object to the thunk
      const result = await dispatch(importSelectedProjects({ projectsToImport: projectsToInsert, userId: user.id })).unwrap();
      toast.success(`Successfully imported ${result.length} projects!`);
      onImportComplete(result);
      onClose();
    } catch (err) {
      toast.error('Failed to import projects: ' + getErrorMessage(err));
    }
  }, [selectedProjects, alxProjects, user, dispatch, onImportComplete, onClose]);

  const handleToggleProject = useCallback(
    (projectId) => {
      dispatch(toggleProjectSelection(projectId));
    },
    [dispatch]
  );

  const handlePlatformChange = (event) => {
    setPlatform(event.target.value);
  };

  const renderStepContent = () => {
    switch (wizardStep) {
      case 'username':
        return (
          <div className="space-y-6"> {/* Increased space-y */}
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-blue-500" /> Enter GitHub Username
            </h3>
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
          <div className="space-y-6"> {/* Increased space-y */}
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <ListChecks className="h-5 w-5 text-purple-500" /> Select Repositories
            </h3>
            <DialogDescription>
              Select repositories to detect ALX projects from.
            </DialogDescription>
            <ScrollArea className="h-80 w-full rounded-md border p-4 shadow-inner"> {/* Added shadow-inner */}
              {repositories.map((repo) => (
                <div key={repo.id} className="flex items-start space-x-3 py-2 border-b last:border-b-0"> {/* Adjusted alignment and added border */}
                  <Checkbox
                    id={`repo-${repo.id}`}
                    checked={selectedProjects.includes(repo.id)}
                    onCheckedChange={() => handleToggleProject(repo.id)}
                    className="mt-1" /* Align checkbox better */
                  />
                  <Label htmlFor={`repo-${repo.id}`} className="flex-1 cursor-pointer space-y-0.5">
                    <span className="font-medium text-base text-gray-800 dark:text-gray-200">{repo.name}</span> {/* Larger font */}
                    <p className="text-sm text-muted-foreground">{repo.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                      {repo.language && (
                        <Badge variant="outline" className="px-2 py-0.5 bg-blue-50 text-blue-700"> {/* Styled badge */}
                          <Code className="h-3 w-3 mr-1" />
                          {repo.language}
                        </Badge>
                      )}
                      <Badge variant="outline" className="px-2 py-0.5">
                        <Star className="h-3 w-3 mr-0.5" />
                        {repo.stargazers_count}
                      </Badge>
                      <Badge variant="outline" className="px-2 py-0.5">
                        <GitFork className="h-3 w-3 mr-0.5" />
                        {repo.forks_count}
                      </Badge>
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
            <div className="flex flex-col sm:flex-row justify-between gap-2"> {/* Responsive button layout */}
              <Button variant="outline" onClick={() => dispatch(setWizardStep('username'))} className="w-full sm:w-auto">
                Back
              </Button>
              <Button
                onClick={handleDetectALXProjects}
                disabled={isDetectingALX || selectedProjects.length === 0}
                className="w-full sm:w-auto"
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
          <div className="space-y-6"> {/* Increased space-y */}
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <ClipboardCheck className="h-5 w-5 text-green-500" /> Review & Import
            </h3>
            <DialogDescription>
              Review the detected ALX projects. These will be imported into your showcase.
            </DialogDescription>
            <ScrollArea className="h-80 w-full rounded-md border p-4 shadow-inner"> {/* Added shadow-inner */}
              {alxProjects.map((project) => (
                <div key={project.id} className="flex items-start space-x-3 py-2 border-b last:border-b-0"> {/* Adjusted alignment and added border */}
                  <Checkbox
                    id={`alx-project-${project.id}`}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleToggleProject(project.id)}
                    className="mt-1" /* Align checkbox better */
                  />
                  <Label htmlFor={`alx-project-${project.id}`} className="flex-1 cursor-pointer space-y-0.5">
                    <span className="font-medium text-base text-gray-800 dark:text-gray-200">{project.name}</span> {/* Larger font */}
                    <p className="text-sm text-muted-foreground">{project.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                      <Badge variant="secondary" className="px-2 py-0.5 bg-blue-50 text-blue-700"> {/* Styled badge */}
                        ALX Score: {project.alx_score?.toFixed(1)}
                      </Badge>
                      <Badge variant="outline" className="px-2 py-0.5">
                        Confidence: {(project.alx_confidence * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline" className="px-2 py-0.5">
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
            <div className="flex flex-col sm:flex-row justify-between gap-2"> {/* Responsive button layout */}
              <Button variant="outline" onClick={() => dispatch(setWizardStep('select_repos'))} className="w-full sm:w-auto">
                Back
              </Button>
              <Button
                onClick={handleImportSelectedProjects}
                disabled={isImporting || selectedProjects.length === 0}
                className="w-full sm:w-auto"
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
      <DialogContent className="max-w-md sm:max-w-2xl p-4 sm:p-6"> {/* Adjusted responsive max-width and padding */}
        <DialogHeader className="mb-4"> {/* Adjusted margin-bottom */}
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold"> {/* Adjusted font size */}
            <Github className="h-6 w-6 sm:h-7 sm:w-7 text-gray-800 dark:text-gray-200" /> {/* Larger icon */}
            Import Projects from GitHub
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            This wizard helps you find and import your ALX projects from GitHub.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" /> {/* Added margin to separator */}

        {/* Progress Indicator */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-2 sm:px-0 mb-6"> {/* Adjusted font size and padding */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className={`font-semibold ${wizardStep === 'username' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              1. Username
            </span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> {/* Smaller icon */}
            <span className={`font-semibold ${wizardStep === 'select_repos' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              2. Select Repos
            </span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> {/* Smaller icon */}
            <span className={`font-semibold ${wizardStep === 'review_import' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              3. Review & Import
            </span>
          </div>
        </div>

        <div className="py-2">{renderStepContent()}</div> {/* Adjusted padding */}
      </DialogContent>
    </Dialog>
  );
}

GitHubImportWizard.propTypes = {
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func.isRequired,
};