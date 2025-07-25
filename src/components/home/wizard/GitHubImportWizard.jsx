// src/components/github/GitHubImportWizard.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Shadcn UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

// Redux Thunks and Actions
import {
  fetchUserRepositories,
  detectALXProjects,
  importSelectedProjects,
  setUsername,
  resetGithubState,
  setSelectedRepoIds // If you need to persist selections in Redux
} from '@/redux/slices/githubSlice';

// Assuming you have a project slice to add/update projects
// import { addProject, updateProject } from '@/redux/slices/projectsSlice';

export function GitHubImportWizard({ onClose }) {
  const dispatch = useDispatch();
  const {
    username: githubUsername, // Renamed to avoid conflict with local state
    repositories,
    detectedAlxProjects,
    status,
    error,
  } = useSelector((state) => state.github);

  const [currentStep, setCurrentStep] = useState(1);
  const [localUsername, setLocalUsername] = useState(githubUsername || '');
  const [selectedRepositories, setSelectedRepositories] = useState([]);
  const [overrideProjects, setOverrideProjects] = useState([]); // For Step 3 overrides

  // Reset state when component mounts or unmounts, or when dialog closes
  useEffect(() => {
    // Optionally reset Redux state on mount/unmount for a fresh wizard each time
    dispatch(resetGithubState());
    setCurrentStep(1);
    setLocalUsername('');
    setSelectedRepositories([]);
    setOverrideProjects([]);
    return () => {
      dispatch(resetGithubState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(`GitHub Import Error: ${error}`);
    }
  }, [status, error]);

  // Step 1: Username Input & Fetch Repositories
  const handleFetchRepos = async () => {
    if (!localUsername.trim()) {
      toast.error('Please enter a GitHub username.');
      return;
    }
    dispatch(setUsername(localUsername.trim()));
    const resultAction = await dispatch(fetchUserRepositories(localUsername.trim()));
    if (fetchUserRepositories.fulfilled.match(resultAction)) {
      setCurrentStep(2);
      toast.success('Repositories fetched successfully!');
    }
  };

  // Handle repository selection in Step 2
  const handleSelectRepository = (repoId) => {
    setSelectedRepositories((prevSelected) => {
      if (prevSelected.includes(repoId)) {
        return prevSelected.filter((id) => id !== repoId);
      } else {
        return [...prevSelected, repoId];
      }
    });
  };

  // Step 2: Detect ALX Projects
  const handleDetectALXProjects = async () => {
    if (selectedRepositories.length === 0) {
      toast.warning('Please select at least one repository.');
      return;
    }

    const reposToAnalyze = repositories.filter(repo => selectedRepositories.includes(repo.id));
    const resultAction = await dispatch(detectALXProjects(reposToAnalyze));

    if (detectALXProjects.fulfilled.match(resultAction)) {
      // Initialize overrideProjects with the detected projects
      setOverrideProjects(resultAction.payload.map(proj => ({ ...proj, selected: true })));
      setCurrentStep(3);
      toast.success('ALX projects detected and ready for review.');
    }
  };

  // Step 3: Handle Overrides
  const handleOverrideChange = (id, field, value) => {
    setOverrideProjects(prev =>
      prev.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    );
  };

  const handleToggleProjectSelection = (id) => {
    setOverrideProjects(prev =>
      prev.map(proj =>
        proj.id === id ? { ...proj, selected: !proj.selected } : proj
      )
    );
  };

  // Step 3: Import Selected Projects
  const handleImportProjects = async () => {
    const projectsToImport = overrideProjects.filter(p => p.selected);
    if (projectsToImport.length === 0) {
      toast.warning('No projects selected for import.');
      return;
    }

    // Transform detected projects into the format your projectsSlice expects
    // This is a crucial step to map the GitHub/AI detected data to your Project model
    const formattedProjects = projectsToImport.map(p => ({
      id: p.id, // Use GitHub ID as a unique identifier or generate a new one
      name: p.suggestedName || p.name,
      description: p.suggestedDescription || p.description,
      repositoryUrl: p.url,
      // Default values or map other fields if available in GitHub data
      startDate: new Date().toISOString(), // Or try to infer from repo creation date
      status: 'Planning', // Default status for newly imported projects
      technologies: [], // AI might suggest these, or leave empty for user to fill
      tags: ['imported-from-github', 'alx-project'],
      isFeatured: false,
      projectSummary: p.projectSummary || '', // If AI generated a summary during detection
      workLogSummary: p.workLogSummary || '', // If AI generated work log during detection
      githubData: { // Store original GitHub data for reference
        repoId: p.id,
        repoName: p.name,
        repoUrl: p.url,
        aiConfidence: p.aiConfidence,
      }
    }));

    const resultAction = await dispatch(importSelectedProjects(formattedProjects));
    if (importSelectedProjects.fulfilled.match(resultAction)) {
      toast.success(`${formattedProjects.length} project(s) imported successfully!`);
      // Optionally dispatch to your main projectsSlice to add these new projects to the global state
      // For example:
      // formattedProjects.forEach(project => dispatch(addProject(project)));
      onClose(); // Close the wizard
    }
  };

  const isSavingOrLoading = status === 'loading';

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">GitHub Project Import Wizard</h2>
      <Progress value={(currentStep / 3) * 100} className="w-full mb-6" />

      {/* Step 1: Input Username */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <Label htmlFor="github-username">GitHub Username</Label>
          <Input
            id="github-username"
            placeholder="e.g., your-github-username"
            value={localUsername}
            onChange={(e) => setLocalUsername(e.target.value)}
            disabled={isSavingOrLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFetchRepos();
              }
            }}
          />
          <p className="text-sm text-muted-foreground">
            Enter your GitHub username to fetch your public repositories.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSavingOrLoading}>
              Cancel
            </Button>
            <Button onClick={handleFetchRepos} disabled={isSavingOrLoading || !localUsername.trim()}>
              {isSavingOrLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...
                </>
              ) : (
                'Next: Select Repositories'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Repositories */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Select Repositories to Analyze</h3>
          {repositories.length === 0 && !isSavingOrLoading && (
            <p className="text-muted-foreground">No public repositories found for {githubUsername}.</p>
          )}
          {isSavingOrLoading && (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Loading repositories...</p>
            </div>
          )}
          {repositories.length > 0 && !isSavingOrLoading && (
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Repository Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repositories.map((repo) => (
                    <TableRow key={repo.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRepositories.includes(repo.id)}
                          onCheckedChange={() => handleSelectRepository(repo.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{repo.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-1">
                        {repo.description || 'No description'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={isSavingOrLoading}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSavingOrLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleDetectALXProjects}
                disabled={isSavingOrLoading || selectedRepositories.length === 0}
              >
                {isSavingOrLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting...
                  </>
                ) : (
                  'Next: Review ALX Projects'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Display Detected ALX Projects & Import */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Review Detected ALX Projects</h3>
          {isSavingOrLoading && (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Analyzing projects with AI...</p>
            </div>
          )}
          {detectedAlxProjects.length === 0 && !isSavingOrLoading && (
            <p className="text-muted-foreground">No potential ALX projects detected among your selections.</p>
          )}
          {detectedAlxProjects.length > 0 && !isSavingOrLoading && (
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {overrideProjects.map((project) => (
                <div key={project.id} className="mb-4 p-3 border rounded-md bg-card shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`select-${project.id}`}
                      checked={project.selected}
                      onCheckedChange={() => handleToggleProjectSelection(project.id)}
                    />
                    <Label htmlFor={`select-${project.id}`} className="font-semibold text-lg cursor-pointer flex-1">
                      {project.name}
                    </Label>
                    <span className={`text-sm ${project.aiConfidence > 0.8 ? 'text-green-600' : project.aiConfidence > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      AI Confidence: {(project.aiConfidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-2 ml-7">
                    <div>
                      <Label htmlFor={`name-${project.id}`}>Suggested Name</Label>
                      <Input
                        id={`name-${project.id}`}
                        value={project.suggestedName || ''}
                        onChange={(e) => handleOverrideChange(project.id, 'suggestedName', e.target.value)}
                        className="mt-1"
                        placeholder="Project Name"
                        disabled={!project.selected}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`description-${project.id}`}>Suggested Description</Label>
                      <Textarea
                        id={`description-${project.id}`}
                        value={project.suggestedDescription || ''}
                        onChange={(e) => handleOverrideChange(project.id, 'suggestedDescription', e.target.value)}
                        className="mt-1 resize-y min-h-[60px]"
                        placeholder="Project Description"
                        disabled={!project.selected}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                        View Repository
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
          <div className="flex justify-between gap-2 mt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)} disabled={isSavingOrLoading}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSavingOrLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleImportProjects}
                disabled={isSavingOrLoading || overrideProjects.filter(p => p.selected).length === 0}
              >
                {isSavingOrLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
                  </>
                ) : (
                  'Import Selected Projects'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}