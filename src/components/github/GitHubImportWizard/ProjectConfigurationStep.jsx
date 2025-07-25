import React, { useRef, useEffect, useState, useCallback } from 'react'; // Added useCallback
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, GitBranch, Github, Brain, Lightbulb, Frown } from 'lucide-react';
import TechIcon from '@/assets/icons/TechIcon';
import { setProjectFormFields } from '@/store/slices/githubSlice';

const GITHUB_REPO_REGEX = /^(?:https?:\/\/github\.com\/)?([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(?:\.git)?$/;

const ProjectConfigurationStep = ({
  user,
  repos,
  repoUrlInput,
  setRepoUrlInput,
  handleFetchRepos,
  handleSelectRepo,
  handleManualRepoInput,
  isLoadingRepos,
  isAnalyzing,
  error,
  currentSubStep,
  selectedRepo,
  // projectFormFields,         // <--- REMOVE THIS PROP
  // setProjectFormFields,     // <--- REMOVE THIS PROP
  onUpdateProjectFormFields, // <--- NEW PROP: Callback to update parent
  useAIForSummary,
  setUseAIForSummary,
  alxProjectsDetected,
  selectedALXProject,
  handleSelectALXProject,
  handleApplyALXProjectDetails,
  // onConfirmDetails,
}) => {
  const projectSummaryRef = useRef(null);

  // Local state for the form fields, initialized from props (if any)
  // Ensure default structure matches expected projectFormFields
  const [localProjectFormFields, setLocalProjectFormFields] = useState(
    setProjectFormFields || { // Fallback if initial prop is undefined
      id: null, user_id: null, github_id: null, title: '', description: '', technologies: []
    }
  );
  // Synchronize local state with prop when parent updates it (e.g., AI auto-fill)
  useEffect(() => {
    if (projectFormFields) {
      setLocalProjectFormFields(projectFormFields);
    }
  }, [projectFormFields]); // Re-sync if the *parent-provided* projectFormFields object changes

  const [isRepoInputValid, setIsRepoInputValid] = useState(false);

  // Handler for all project form field changes
  const handleProjectFormFieldChange = useCallback((field, value) => {
    setLocalProjectFormFields(prevFields => {
      const updatedFields = { ...prevFields, [field]: value };
      // OPTIONAL: Call parent callback if immediate update is needed,
      // but usually you'd call this when the step is "completed"
      // onUpdateProjectFormFields(updatedFields);
      return updatedFields;
    });
  }, []); // Dependencies are stable

  // Handler for technology array changes
  const handleTechnologiesChange = useCallback((newTechnologies) => {
    setLocalProjectFormFields(prevFields => {
      const updatedFields = { ...prevFields, technologies: newTechnologies };
      // OPTIONAL: Call parent callback
      // onUpdateProjectFormFields(updatedFields);
      return updatedFields;
    });
  }, []);

  // Use a useEffect to send the updated local form fields to the parent
  // only when localProjectFormFields changes significantly.
  // This helps avoid over-rendering the parent.
  useEffect(() => {
    // Only call parent update if the local state is different from the prop,
    // or if the wizard is about to move to the next step.
    // For now, let's update parent immediately on change.
    // You might want to debounce this or only update on step completion.
    // console.log("[ProjectConfigurationStep] Local project form fields changed, notifying parent.");
    onUpdateProjectFormFields(localProjectFormFields);
  }, [localProjectFormFields, onUpdateProjectFormFields]);


  // --- ADJUSTED LOGGING useEffect ---
  useEffect(() => {
    console.log('[ProjectConfigurationStep] Component mounted or re-rendered.');
    console.log('[ProjectConfigurationStep] Current Sub-Step:', currentSubStep);
    console.log('[ProjectConfigurationStep] Is Loading Repos:', isLoadingRepos);
    console.log('[ProjectConfigurationStep] Is Analyzing:', isAnalyzing);
    console.log('[ProjectConfigurationStep] Error:', error);
    console.log('[ProjectConfigurationStep] Selected Repo:', selectedRepo ? selectedRepo.full_name : 'None');
    console.log('[ProjectConfigurationStep] Local Project Form Fields:', localProjectFormFields); // Use local state here
  }, [currentSubStep, isLoadingRepos, isAnalyzing, error, selectedRepo, localProjectFormFields]); // Dependencies added

  // Log repo URL input changes and validity
  useEffect(() => {
    const isValid = GITHUB_REPO_REGEX.test(repoUrlInput);
    if (isValid !== isRepoInputValid) {
      console.log(`[ProjectConfigurationStep - Repo Input] URL: "${repoUrlInput}", Valid: ${isValid}`);
      setIsRepoInputValid(isValid);
    }
  }, [repoUrlInput, isRepoInputValid]);

  // Log scrolling behavior for project details
  useEffect(() => {
    if (currentSubStep === 2 && !isAnalyzing && localProjectFormFields.title && projectSummaryRef.current) { // Use local state
      console.log('[ProjectConfigurationStep - Scroll] Scrolling to project details.');
      projectSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSubStep, isAnalyzing, localProjectFormFields.title]); // Use local state

  const renderRepoSelection = () => (
    <ScrollArea className="flex-1 p-2">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        Choose a GitHub Repository
      </h3>
      <div className="mb-4 space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Or enter repo URL (e.g., owner/repo-name)"
            value={repoUrlInput}
            onChange={(e) => {
              console.log('[ProjectConfigurationStep - Input] Repo URL changed:', e.target.value);
              setRepoUrlInput(e.target.value);
            }}
            className="w-full sm:flex-grow"
            disabled={isLoadingRepos || isAnalyzing}
          />
          <Button
            onClick={() => {
              console.log('[ProjectConfigurationStep - Button] Add Manually clicked.');
              handleManualRepoInput();
            }}
            disabled={!isRepoInputValid || isLoadingRepos || isAnalyzing}
            className="w-full sm:w-auto"
          >
            Add Manually
          </Button>
        </div>
        <div className="flex justify-center sm:justify-start">
          <Button
            onClick={() => {
              console.log('[ProjectConfigurationStep - Button] Fetch My Repositories clicked.');
              handleFetchRepos();
            }}
            disabled={isLoadingRepos || !user?.user_metadata?.github_access_token}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            {isLoadingRepos ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
            Fetch My Repositories
          </Button>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>}

      {isLoadingRepos ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Fetching repositories...</p>
        </div>
      ) : repos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <Card
              key={repo.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                console.log('[ProjectConfigurationStep - Repo Card] Repo selected:', repo.full_name);
                handleSelectRepo(repo);
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-8 h-8 rounded-full" />
                <h4 className="font-semibold text-lg">{repo.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{repo.description || 'No description provided.'}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <GitBranch className="w-3 h-3" /> {repo.default_branch || 'main'}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          No repositories found or connected. Please click "Fetch My Repositories" or add one manually.
        </p>
      )}
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Connect your GitHub account in your profile settings to fetch your repositories automatically.
      </p>
    </ScrollArea>
  );

  const renderProjectDetails = () => (
    <ScrollArea className="flex-1 p-2">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        Project Details & AI Analysis
        {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
      </h3>
      {error && <p className="text-red-500 text-sm mb-4">Error: {error}</p>}

      {selectedRepo && (
        <div className="mb-4 p-3 bg-muted rounded-md flex items-center gap-3">
          <Github className="w-5 h-5" />
          <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
            {selectedRepo.full_name}
          </a>
        </div>
      )}

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Analyzing repository and generating insights...</p>
          <p className="text-sm text-muted-foreground">This may take a moment based on repository size.</p>
        </div>
      ) : (
        <div className="space-y-4" ref={projectSummaryRef}>
          <div>
            <Label htmlFor="projectName" className="mb-1 block">Project Name</Label>
            <Input
              id="projectName"
              value={localProjectFormFields.title || ''}
              onChange={(e) => {
                console.log('[ProjectConfigurationStep - Input] Project Name changed:', e.target.value);
                handleProjectFormFieldChange('title', e.target.value);
              }}
              placeholder="e.g., My Awesome Project"
            />
          </div>
          <div>
            <Label htmlFor="projectDescription" className="mb-1 block">Project Description</Label>
            <Textarea
              id="projectDescription"
              value={localProjectFormFields.description || ''}
              onChange={(e) => {
                console.log('[ProjectConfigurationStep - Input] Project Description changed:', e.target.value);
                handleProjectFormFieldChange('description', e.target.value);
              }}
              placeholder="A brief summary of your project..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="projectTechnologies" className="mb-1 block">Technologies Used</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-background">
              {localProjectFormFields.technologies?.map((tech) => (
                <span key={tech} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                  <TechIcon techName={tech} className="h-4 w-4" />
                  {tech}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => {
                      console.log('[ProjectConfigurationStep - Button] Removing technology:', tech);
                      handleTechnologiesChange(localProjectFormFields.technologies.filter(t => t !== tech));
                    }}
                  >
                    x
                  </Button>
                </span>
              ))}
              {localProjectFormFields.technologies?.length === 0 && <span className="text-muted-foreground text-sm">No technologies detected or added.</span>}
            </div>
            <Input
              className="mt-2"
              placeholder="Add technology (e.g., React, Python), press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                  const newTech = e.currentTarget.value.trim();
                  if (!localProjectFormFields.technologies.includes(newTech)) {
                    console.log('[ProjectConfigurationStep - Input] Adding new technology:', newTech);
                    handleTechnologiesChange([...localProjectFormFields.technologies, newTech]);
                  } else {
                    console.log('[ProjectConfigurationStep - Input] Technology already exists:', newTech);
                  }
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          {alxProjectsDetected.length > 0 && (
            <div className="mt-4 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-700">
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                ALX Project Detected!
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                This repository appears to be an ALX project. You can select the specific project to auto-fill details and assign relevant technologies.
              </p>
              <RadioGroup
                value={selectedALXProject?.id || ''}
                onValueChange={(value) => {
                  console.log('[ProjectConfigurationStep - Radio] ALX Project selected:', value);
                  handleSelectALXProject(value);
                }}
              >
                {alxProjectsDetected.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={project.id} id={`alx-project-${project.id}`} />
                    <Label htmlFor={`alx-project-${project.id}`} className="font-medium">
                      {project.title} <span className="text-muted-foreground text-xs">({project.technologies.join(', ')})</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => {
                  console.log('[ProjectConfigurationStep - Button] Apply ALX Project Details clicked.');
                  handleApplyALXProjectDetails();
                }}
                disabled={!selectedALXProject}
              >
                Apply ALX Project Details
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="useAIForSummary"
              checked={useAIForSummary}
              onCheckedChange={(checked) => {
                console.log('[ProjectConfigurationStep - Checkbox] Use AI For Summary toggled:', checked);
                setUseAIForSummary(checked);
              }}
            />
            <label
              htmlFor="useAIForSummary"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use AI to generate Project Name, Description, and Technologies
            </label>
          </div>
          {localProjectFormFields.ai_summary && useAIForSummary && ( // Use local state
            <div className="mt-4 p-3 border rounded-md bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-700">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                AI Summary <Brain className="h-4 w-4" />
              </h4>
              <p className="text-sm text-green-900 dark:text-green-100 whitespace-pre-wrap">{localProjectFormFields.ai_summary}</p>
            </div>
          )}
        </div>
      )}
    </ScrollArea>
  );

  return (
    <>
      {currentSubStep === 1 && renderRepoSelection()}
      {currentSubStep === 2 && renderProjectDetails()}
    </>
  );
};

export default ProjectConfigurationStep;