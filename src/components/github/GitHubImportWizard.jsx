import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { useAuth } from '../../hooks/use-auth' // Still needed for user.id for profile update
import { supabase } from '../../lib/supabase.js'; // Still needed for direct user profile update
import { toast } from 'sonner';
import { 
  Github, 
  Search, 
  CheckCircle, 
  Circle, 
  Loader2, 
  Star, 
  GitBranch, 
  Clock,
  Download,
  AlertCircle,
  Zap
} from 'lucide-react';

// Import Redux hooks and actions/selectors
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchUserRepositories, 
  detectALXProjects, 
  importSelectedProjects, 
  toggleProjectSelection, 
  selectAllALXProjects, 
  clearSelection, 
  setWizardStep, 
  selectRepositories, 
  selectALXProjects, 
  selectSelectedProjects, 
  selectGitHubLoading, 
  selectGitHubErrors, 
  selectWizardStep 
} from '../../store/slices/githubSlice'
export function GitHubImportWizard({ onClose, onImportComplete }) {
  const dispatch = useDispatch();
  const { user } = useAuth(); // Get user from auth hook for profile update

  // Local state for username input
  const [githubUsername, setGithubUsername] = useState('');

  // Select state from Redux store
  const currentStep = useSelector(selectWizardStep);
  const repositories = useSelector(selectRepositories);
  const alxProjects = useSelector(selectALXProjects);
  const selectedProjectsRedux = useSelector(selectSelectedProjects); // Array from Redux
  const { 
    repositories: isLoadingRepositories, 
    detecting: isDetectingALX, 
    importing: isImporting 
  } = useSelector(selectGitHubLoading);
  const { repository: repositoryError, import: importError } = useSelector(selectGitHubErrors);

  // Convert selectedProjects array from Redux to a Set for efficient lookups
  const selectedProjectsSet = new Set(selectedProjectsRedux);

  // Step 1: Fetch GitHub repositories and detect ALX projects
  const handleFetchRepositories = async () => {
    if (!githubUsername.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }

    // Set wizard step to 'select' immediately, loading state handled by thunk
    dispatch(setWizardStep('select')); 

    try {
      // Dispatch thunk to fetch repositories
      const fetchReposResult = await dispatch(fetchUserRepositories(githubUsername.trim())).unwrap();
      
      // Dispatch thunk to detect ALX projects using the fetched repositories
      const detectedProjectsResult = await dispatch(detectALXProjects({ 
        repositories: fetchReposResult, 
        username: githubUsername.trim() 
      })).unwrap();
      
      if (detectedProjectsResult.length === 0) {
        toast.warning('No ALX projects detected. You can still browse all repositories.');
      } else {
        toast.success(`Found ${detectedProjectsResult.length} ALX projects!`);
      }
      
    } catch (error) {
      // Explicitly convert error to string for robust logging
      console.error('Error fetching repositories:', error.message ? String(error.message) : String(error));
      toast.error(repositoryError || error.message || 'Failed to fetch GitHub repositories');
    }
  };

  // Toggle project selection (dispatches Redux action)
  const handleToggleProjectSelection = (projectId) => {
    dispatch(toggleProjectSelection(projectId));
  };

  // Select all ALX projects (dispatches Redux action)
  const handleSelectAllALXProjects = () => {
    dispatch(selectAllALXProjects());
  };

  // Clear all selections (dispatches Redux action)
  const handleClearAllSelections = () => {
    dispatch(clearSelection());
  };

  // Step 2: Import selected projects
  const handleImportProjects = async () => {
    if (selectedProjectsSet.size === 0) {
      toast.error('Please select at least one project to import');
      return;
    }

    try {
      // Dispatch thunk to import selected projects (handles data generation and DB insertion)
      const importedData = await dispatch(importSelectedProjects({ 
        selectedProjects: Array.from(selectedProjectsSet), // Convert Set back to Array for dispatch
        repositories: repositories, // Pass current repos from Redux state
        username: githubUsername // Pass username
      })).unwrap();

      toast.success(`Successfully imported ${importedData.length} projects!`);
      
      // Update user profile with GitHub username (still direct Supabase call for profile)
      // IMPORTANT: Include user.email to satisfy NOT NULL constraint if a new user row is inserted
      await supabase
        .from('users')
        .upsert({
          id: user.id, // user from useAuth()
          email: user.email, // <-- ADDED THIS LINE
          github_username: githubUsername.trim(),
          updated_at: new Date().toISOString()
        });

      onImportComplete?.(importedData);
      onClose?.();
    } catch (error) {
      // Explicitly convert error to string for robust logging
      console.error('Error importing projects:', error.message ? String(error.message) : String(error));
      toast.error(importError || error.message || 'Failed to import projects. Please try again.');
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  // Render project card
  const ProjectCard = ({ project, isSelected, onToggle }) => (
    <Card 
      className={`cursor-pointer transition-all border-2 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onToggle(project.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isSelected ? (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
            <h3 className="font-semibold text-lg">{project.name}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {project.alx_confidence && (
              <Badge className={`text-xs ${getConfidenceColor(project.alx_confidence)}`}>
                <Zap className="h-3 w-3 mr-1" />
                {Math.round(project.alx_confidence * 100)}% ALX
              </Badge>
            )}
            {project.stargazers_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="h-4 w-4" />
                {project.stargazers_count}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-3 text-sm">
          {project.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {project.language && (
              // Corrected: Wrap sibling elements in a div
              <div className="flex items-center gap-1"> 
                <div className={`w-3 h-3 rounded-full bg-gray-500`}></div> {/* Placeholder color */}
                {project.language}
              </div>
            )}
            {project.fork ? (
              <Badge variant="outline" className="text-xs">
                <GitBranch className="h-3 w-3 mr-1" />
                Forked
              </Badge>
            ) : (
              <Badge variant="solid" className="text-xs bg-blue-100 text-blue-600">
                <GitBranch className="h-3 w-3 mr-1" />
                Original
              </Badge>
            )}
          </div>
          {/* Moved these two elements into a single div to correctly align them within the flex container */}
          <div className="flex items-center gap-4"> {/* Use gap-4 for spacing between these two elements */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(project.updated_at).toLocaleDateString()}
            </div>
            {project.alx_category && (
              <Badge variant="outline" className="text-xs">
                {project.alx_category}
              </Badge>
            )}
          </div>
        </div>

        {project.detected_features && project.detected_features.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-1">Detected ALX features:</p>
            <div className="flex flex-wrap gap-1">
              {project.detected_features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature.split(':')[0]}
                </Badge>
              ))}
              {project.detected_features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                   {project.detected_features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">GitHub Import Wizard</CardTitle>
                <p className="text-blue-100">Import your ALX projects automatically</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Step 1: Enter GitHub Username */}
          {currentStep === 'username' && (
            <div className="p-8">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div>
                  <Github className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Connect Your GitHub</h2>
                  <p className="text-gray-600">
                    Enter your GitHub username to automatically discover and import your ALX projects
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="github-username">GitHub Username</Label>
                    <Input
                      id="github-username"
                      placeholder="your-github-username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleFetchRepositories()}
                      className="text-center"
                    />
                  </div>

                  <Button 
                    onClick={handleFetchRepositories}
                    disabled={isLoadingRepositories || !githubUsername.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isLoadingRepositories ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Discovering Projects...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find My ALX Projects
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-gray-500 space-y-2">
                  <p>✨ We'll automatically detect ALX projects by analyzing:</p>
                  <ul className="text-left max-w-xs mx-auto space-y-1">
                    <li>• Repository names (0x00-, 0x01-, simple_shell, etc.)</li>
                    <li>• Project topics and descriptions</li>
                    <li>• File structures and languages</li>
                    <li>• ALX-specific patterns and keywords</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Projects */}
          {currentStep === 'select' && (
            <div className="h-[70vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      Found {repositories.length} repositories
                      {alxProjects.length > 0 && (
                        <span className="text-green-600"> ({alxProjects.length} ALX projects detected)</span>
                      )}
                    </h2>
                    <p className="text-gray-600">Select the projects you want to add to your showcase</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {alxProjects.length > 0 && (
                      <Button variant="outline" onClick={handleSelectAllALXProjects}>
                        <Zap className="mr-2 h-4 w-4" />
                        Select All ALX
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleClearAllSelections}>
                      Clear All
                    </Button>
                    <Button 
                      onClick={handleImportProjects}
                      disabled={selectedProjectsSet.size === 0 || isImporting}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Import {selectedProjectsSet.size} Project{selectedProjectsSet.size !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="alx" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="alx" className="relative">
                      ALX Projects ({alxProjects.length})
                      {alxProjects.length > 0 && (
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto-detected
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      All Repositories ({repositories.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="alx" className="space-y-4">
                    {alxProjects.length > 0 ? (
                      <div className="grid gap-4">
                        {alxProjects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            isSelected={selectedProjectsSet.has(project.id)}
                            onToggle={handleToggleProjectSelection}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No ALX Projects Detected</h3>
                        <p className="text-gray-600 mb-4">
                          We couldn't automatically detect ALX projects in this GitHub account.
                          You can still browse all repositories and manually select projects.
                        </p>
                        <Button variant="outline" onClick={() => document.querySelector('[value="all"]').click()}>
                          Browse All Repositories
                        </Button>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="space-y-4">
                    <div className="grid gap-4">
                      {repositories.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isSelected={selectedProjectsSet.has(project.id)}
                          onToggle={handleToggleProjectSelection}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

GitHubImportWizard.propTypes = {
  onClose: PropTypes.func.isRequired,
  onImportComplete: PropTypes.func
};
