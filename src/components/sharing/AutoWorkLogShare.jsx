import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Label } from '@/components/ui/label.jsx';
import { useAuth } from '@/hooks/use-auth.js';
import { GitHubCommitsService, SocialContentOptimizer } from '@/lib/social-optimizer.js';
import { toast } from 'sonner';
import { 
  Copy, 
  Twitter, 
  Linkedin, 
  Facebook, 
  MessageSquare, 
  GitCommit, 
  TrendingUp, 
  Loader2,
  Zap,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';

export function AutoWorkLogShare({ project, onClose }) {
  const { user } = useAuth();
  const [customMessage, setCustomMessage] = useState('');
  const [workLog, setWorkLog] = useState(null);
  const [loadingWorkLog, setLoadingWorkLog] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [timeframe, setTimeframe] = useState('7');
  const [optimizedContent, setOptimizedContent] = useState({});
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set(['twitter', 'linkedin']));

  // Auto-fetch work log on component mount
  useEffect(() => {
    if (autoMode && project.github_url) {
      fetchWorkLog();
    }
  }, [project.github_url, timeframe, autoMode]);

  // Generate optimized content when work log or custom message changes
  useEffect(() => {
    if (project) {
      const content = SocialContentOptimizer.generatePlatformContent(
        project, 
        workLog, 
        customMessage
      );
      setOptimizedContent(content);
    }
  }, [project, workLog, customMessage]);

  const fetchWorkLog = useCallback(async () => {
    if (!project.github_url) {
      toast.error('No GitHub URL found for this project');
      return;
    }

    setLoadingWorkLog(true);
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(project.github_url);
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL');
      }

      const log = await GitHubCommitsService.generateWorkLog(
        githubInfo.username, 
        githubInfo.repoName, 
        parseInt(timeframe)
      );

      if (log) {
        setWorkLog(log);
        toast.success(`Fetched ${log.commitCount} commits from the last ${timeframe} days`);
      } else {
        toast.warning(`No commits found in the last ${timeframe} days`);
        setWorkLog(null);
      }
    } catch (error) {
      console.error('Error fetching work log:', error);
      toast.error('Failed to fetch work log: ' + error.message);
      setWorkLog(null);
    } finally {
      setLoadingWorkLog(false);
    }
  }, [project.github_url, timeframe]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareToSocial = (platform, content) => {
    const encodedContent = encodeURIComponent(content);
    const projectUrl = project.live_url || project.github_url || '';
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedContent}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}&summary=${encodedContent}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}&quote=${encodedContent}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const togglePlatform = (platform) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
    } else {
      newSelected.add(platform);
    }
    setSelectedPlatforms(newSelected);
  };

  const shareToAllSelected = () => {
    selectedPlatforms.forEach(platform => {
      if (optimizedContent[platform] && platform !== 'discord') {
        setTimeout(() => {
          shareToSocial(platform, optimizedContent[platform].content);
        }, 300); // Small delay between opens
      }
    });
    toast.success(`Opened ${selectedPlatforms.size} sharing windows`);
  };

  const PlatformCard = ({ platform, icon: Icon, title, content, isOptimized, length, limit }) => {
    const isSelected = selectedPlatforms.has(platform);
    const warningThreshold = limit ? limit * 0.9 : 1000;
    const isNearLimit = length > warningThreshold;
    
    return (
      <Card className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={`p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => togglePlatform(platform)}
              >
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isOptimized && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  Optimized
                </Badge>
              )}
              <div className={`text-xs px-2 py-1 rounded ${
                isNearLimit ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {length}{limit ? `/${limit}` : ''} chars
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm max-h-40 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans">{content}</pre>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(content)}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            {platform !== 'discord' && (
              <Button
                size="sm"
                onClick={() => shareToSocial(platform, content)}
                className="flex-1"
                disabled={!isSelected}
              >
                Share
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const WorkLogSummary = () => {
    if (!workLog) return null;

    const { commitCount, timeframe, summary, latestCommit } = workLog;
    
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Work Log Summary</h3>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Last {timeframe} days
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{commitCount}</div>
              <div className="text-xs text-gray-600">Commits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.categories.features}</div>
              <div className="text-xs text-gray-600">Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.categories.fixes}</div>
              <div className="text-xs text-gray-600">Fixes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.categories.refactor}</div>
              <div className="text-xs text-gray-600">Refactors</div>
            </div>
          </div>

          {latestCommit && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-1">
                <GitCommit className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Latest commit:</span>
              </div>
              <p className="text-sm text-gray-700 truncate">{latestCommit.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(latestCommit.date).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Smart Share: "{project.title}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Auto Work Log Controls */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <Label htmlFor="auto-mode" className="font-semibold">Auto Work Log</Label>
                </div>
                <Switch
                  id="auto-mode"
                  checked={autoMode}
                  onCheckedChange={setAutoMode}
                />
              </div>

              {autoMode && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="timeframe">Timeframe:</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchWorkLog}
                    disabled={loadingWorkLog}
                  >
                    {loadingWorkLog ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Log Summary */}
          {workLog && <WorkLogSummary />}

          {/* Project Overview */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
            <p className="text-gray-700 mb-2">{project.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {project.technologies?.map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
            {(project.github_url || project.live_url) && (
              <div className="flex gap-2 text-sm">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    GitHub
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    Live Demo
                  </a>
                )}
              </div>
            )}
          </div>

          <Tabs defaultValue="auto" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auto">Auto-Generated Content</TabsTrigger>
              <TabsTrigger value="custom">Custom Message</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Content optimized for each platform
                  </span>
                </div>
                <Button
                  onClick={shareToAllSelected}
                  disabled={selectedPlatforms.size === 0}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Share to Selected ({selectedPlatforms.size})
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <PlatformCard
                  platform="twitter"
                  icon={Twitter}
                  title="Twitter/X"
                  content={optimizedContent.twitter?.content || ''}
                  isOptimized={optimizedContent.twitter?.optimized}
                  length={optimizedContent.twitter?.length || 0}
                  limit={280}
                />
                <PlatformCard
                  platform="linkedin"
                  icon={Linkedin}
                  title="LinkedIn"
                  content={optimizedContent.linkedin?.content || ''}
                  isOptimized={optimizedContent.linkedin?.optimized}
                  length={optimizedContent.linkedin?.length || 0}
                  limit={1300}
                />
                <PlatformCard
                  platform="facebook"
                  icon={Facebook}
                  title="Facebook"
                  content={optimizedContent.facebook?.content || ''}
                  isOptimized={optimizedContent.facebook?.optimized}
                  length={optimizedContent.facebook?.length || 0}
                  limit={400}
                />
                <PlatformCard
                  platform="discord"
                  icon={MessageSquare}
                  title="Discord"
                  content={optimizedContent.discord?.content || ''}
                  isOptimized={optimizedContent.discord?.optimized}
                  length={optimizedContent.discord?.length || 0}
                  limit={2000}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Custom Message
                </Label>
                <Textarea
                  placeholder="Write your custom message here..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              {customMessage && (
                <div className="grid gap-4 md:grid-cols-2">
                  <PlatformCard
                    platform="twitter"
                    icon={Twitter}
                    title="Twitter/X"
                    content={optimizedContent.twitter?.content || ''}
                    isOptimized={optimizedContent.twitter?.optimized}
                    length={optimizedContent.twitter?.length || 0}
                    limit={280}
                  />
                  <PlatformCard
                    platform="linkedin"
                    icon={Linkedin}
                    title="LinkedIn"
                    content={optimizedContent.linkedin?.content || ''}
                    isOptimized={optimizedContent.linkedin?.optimized}
                    length={optimizedContent.linkedin?.length || 0}
                  />
                  <PlatformCard
                    platform="facebook"
                    icon={Facebook}
                    title="Facebook"
                    content={optimizedContent.facebook?.content || ''}
                    isOptimized={optimizedContent.facebook?.optimized}
                    length={optimizedContent.facebook?.length || 0}
                  />
                  <PlatformCard
                    platform="discord"
                    icon={MessageSquare}
                    title="Discord"
                    content={optimizedContent.discord?.content || ''}
                    isOptimized={optimizedContent.discord?.optimized}
                    length={optimizedContent.discord?.length || 0}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

AutoWorkLogShare.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    technologies: PropTypes.arrayOf(PropTypes.string),
    github_url: PropTypes.string,
    live_url: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired
};