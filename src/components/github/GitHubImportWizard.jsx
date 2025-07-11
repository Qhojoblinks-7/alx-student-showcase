import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { GitHubService, ALXProjectDetector } from './GitHubImportWizard'
import { useAuth } from '../../hooks/use-auth'
import { supabase } from '../../lib/supabase.js';
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

export function GitHubImportWizard({ onClose, onImportComplete }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('username');
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [alxProjects, setAlxProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [importing, setImporting] = useState(false);

  // Step 1: Fetch GitHub repositories
  const handleFetchRepositories = async () => {
    if (!githubUsername.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    try {
      const repos = await GitHubService.fetchUserRepositories(githubUsername.trim());
      setRepositories(repos);
      
      // Detect ALX projects
      const detectedProjects = await ALXProjectDetector.detectALXProjects(repos, githubUsername.trim());
      setAlxProjects(detectedProjects);
      
      if (detectedProjects.length === 0) {
        toast.warning('No ALX projects detected. You can still browse all repositories.');
      } else {
        toast.success(`Found ${detectedProjects.length} ALX projects!`);
      }
      
      setCurrentStep('select');
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast.error(error.message || 'Failed to fetch GitHub repositories');
    } finally {
      setLoading(false);
    }
  };

  // Toggle project selection
  const toggleProjectSelection = (projectId) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  // Select all ALX projects
  const selectAllALXProjects = () => {
    const alxIds = new Set(alxProjects.map(p => p.id));
    setSelectedProjects(alxIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedProjects(new Set());
  };

  // Step 2: Import selected projects
  const handleImportProjects = async () => {
    if (selectedProjects.size === 0) {
      toast.error('Please select at least one project to import');
      return;
    }

    setImporting(true);
    try {
      const selectedRepos = [...repositories, ...alxProjects]
        .filter(repo => selectedProjects.has(repo.id));
      
      const projectsToCreate = [];
      
      // Generate project data for each selected repository
      for (const repo of selectedRepos) {
        const projectData = await ALXProjectDetector.generateProjectData(repo, githubUsername);
        projectsToCreate.push({
          ...projectData,
          user_id: user.id
        });
      }

      // Bulk insert projects
      const { data, error } = await supabase
        .from('projects')
        .insert(projectsToCreate)
        .select();

      if (error) throw error;

      toast.success(`Successfully imported ${data.length} projects!`);
      
      // Update user profile with GitHub username
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          github_username: githubUsername.trim(),
          updated_at: new Date().toISOString()
        });

      onImportComplete?.(data);
      onClose?.();
    } catch (error) {
      console.error('Error importing projects:', error);
      toast.error('Failed to import projects. Please try again.');
    } finally {
      setImporting(false);
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
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full bg-${project.language.toLowerCase()}-500`}></div>
                {project.language}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(project.updated_at).toLocaleDateString()}
            </div>
          </div>
          
          {project.alx_category && (
            <Badge variant="outline" className="text-xs">
              {project.alx_category}
            </Badge>
          )}
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
                    disabled={loading || !githubUsername.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
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
                      <Button variant="outline" onClick={selectAllALXProjects}>
                        <Zap className="mr-2 h-4 w-4" />
                        Select All ALX
                      </Button>
                    )}
                    <Button variant="outline" onClick={clearAllSelections}>
                      Clear All
                    </Button>
                    <Button 
                      onClick={handleImportProjects}
                      disabled={selectedProjects.size === 0 || importing}
                    >
                      {importing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Import {selectedProjects.size} Project{selectedProjects.size !== 1 ? 's' : ''}
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
                            isSelected={selectedProjects.has(project.id)}
                            onToggle={toggleProjectSelection}
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
                          isSelected={selectedProjects.has(project.id)}
                          onToggle={toggleProjectSelection}
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