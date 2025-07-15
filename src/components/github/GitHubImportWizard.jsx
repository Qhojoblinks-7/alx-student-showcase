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
  setWizardData, // Corrected import: changed from updateWizardData to setWizardData
  toggleProjectSelection,
  resetWizard,
  clearGitHubErrors,
  clearSelection,
} from '@/store/slices/githubSlice.js';
import { useAuth } from '@/hooks/use-auth.js';
import { GitHubService, ALXProjectDetector } from '@/lib/github-service.js'; // Import ALXProjectDetector

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
      toast.error('Please enter a GitHub username.');
      return;
    }
    dispatch(clearGitHubErrors()); // Clear previous errors
    dispatch(setWizardData({ username: usernameInput.trim() })); // Corrected dispatch call
    try {
      // 1. Fetch repositories
      await dispatch(fetchUserRepositories(usernameInput.trim())).unwrap();
      
      // 2. Automatically detect ALX projects from the now fetched repositories
      // Pass repositories and username explicitly as required by the thunk
      await dispatch(detectALXProjects({ repositories: repositories, username: usernameInput.trim() })).unwrap();
      
      // 3. Move to the review & import step
      dispatch(setWizardStep('review_import'));
    } catch (err) {
      // Log the full error object for debugging
      console.error('Error in handleFetchRepositories:', err);
      toast.error('Failed to fetch or detect projects: ' + getErrorMessage(err));
      // If fetching or detecting fails, go back to username step or stay on current step with error
      dispatch(setWizardStep('username'));
    }
  }, [usernameInput, dispatch, repositories]); // Added 'repositories' to dependencies

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
  }, [dispatch, repositories, wizardData.username]); // Added 'repositories', 'wizardData.username' to dependencies

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
    
    // *** CRITICAL CHANGE HERE ***
    // Instead of re-generating project data from 'repositories',
    // filter directly from 'alxProjects' which already contain the processed data.
    const projectsToInsert = alxProjects.filter((alxProject) =>
      selectedProjects.includes(alxProject.id) // alxProject.id is the GitHub repo ID
    ).map(alxProject => ({
      user_id: user.id,
      id: alxProject.id, // Ensure ID is passed for potential upsert or reference
      title: alxProject.title, // These fields are already processed by ALXProjectDetector.generateProjectData
      description: alxProject.description,
      technologies: alxProject.technologies,
      github_url: alxProject.github_url,
      live_url: alxProject.live_url,
      category: alxProject.category,
      original_repo_name: alxProject.original_repo_name,
      alx_confidence: alxProject.alx_confidence || 0.0,
      last_updated: alxProject.last_updated,
      is_public: alxProject.is_public, // This should be derived from the original repo's private status
      // Add other fields from the schema with default/derived values if not already in projectData
      completion_date: null, // Default to null, user can edit later
      time_spent_hours: null, // Default to null, user can edit later
      key_learnings: '',
      challenges_faced: '',
      image_url: '',
      tags: [],
    }));

    // --- Debugging logs ---
    console.log("handleImportSelectedProjects: alxProjects at time of dispatch:", alxProjects);
    console.log("handleImportSelectedProjects: selectedProjects at time of dispatch:", selectedProjects);
    console.log("handleImportSelectedProjects: projectsToInsert before dispatch:", projectsToInsert);
    // --- End Debugging logs ---

    try {
      // Check if any projects were successfully prepared for insertion
      if (projectsToInsert.length === 0) {
        toast.warning('No valid ALX projects could be prepared for import. This might be due to API access issues or missing READMEs for the selected projects, or an internal state mismatch. Check console for details.');
        onClose(); // Close the modal if nothing to import
        return; // Exit the function
      }

      // Pass the already generated and formatted projects directly to the thunk
      const result = await dispatch(importSelectedProjects({ projectsToImport: projectsToInsert, userId: user.id })).unwrap();
      toast.success(`Successfully imported ${result.length} projects!`);
      onImportComplete(result); // Callback to parent
      onClose();
    } catch (err) {
      // Ensure err.message is always a string
      toast.error('Failed to import projects: ' + getErrorMessage(err));
    }
  }, [selectedProjects, alxProjects, user, dispatch, onImportComplete, onClose]);

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
                onClick={handleDetectALXProjects} // This button still triggers manual detection
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
        // Log the IDs of the projects in alxProjects for debugging
        console.log('ALX Projects IDs for rendering:', alxProjects.map(p => p.id));

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
                <div key={project.id} className="flex items-center space-x-2 py-2"> {/* Changed key to project.id */}
                  <Checkbox
                    id={`alx-project-${project.id}`}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleToggleProject(project.id)}
                  />
                  <Label htmlFor={`alx-project-${project.id}`} className="flex-1 cursor-pointer">
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
