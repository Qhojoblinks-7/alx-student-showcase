import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
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
import { GitHubCommitsService } from '@/lib/github-commits-service.js'; // Corrected import path for GitHubCommitsService
import { SocialContentOptimizer } from '@/lib/social-optimizer.js'; // Corrected import path for SocialContentOptimizer
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
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set(['twitter', 'linkedin']));
  const [activeTab, setActiveTab] = useState('auto'); // State to control active tab

  // New state to prevent re-fetching if config hasn't changed
  const [hasFetchedForCurrentConfig, setHasFetchedForCurrentConfig] = useState(false);

  // Memoize the optimized content based on project, workLog, and customMessage
  const memoizedOptimizedContent = useMemo(() => {
    console.log('[AutoWorkLogShare Debug] useMemo: Recalculating optimized content...');
    // Generate if workLog exists OR if there's a custom message
    if (project && (workLog || customMessage)) {
      const content = SocialContentOptimizer.generatePlatformContent(
        project,
        workLog,
        [], // rawCommits are not directly used here for AI summary, but can be passed if SocialContentOptimizer needs them
        customMessage
      );
      console.log('[AutoWorkLogShare Debug] Optimized Content (from useMemo):', content);
      return content;
    }
    console.log('[AutoWorkLogShare Debug] No work log or custom message, returning empty optimized content.');
    return {}; // Return empty object if conditions not met
  }, [project, workLog, customMessage]);


  // Memoized fetch function to prevent unnecessary re-creations
  const fetchWorkLog = useCallback(async () => {
    console.log('[AutoWorkLogShare Debug] fetchWorkLog called.');
    if (!project.github_url) {
      toast.error('No GitHub URL found for this project');
      console.log('[AutoWorkLogShare Debug] No GitHub URL, returning.');
      return;
    }

    setLoadingWorkLog(true);
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(project.github_url);
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL');
      }
      console.log('[AutoWorkLogShare Debug] Parsed GitHub Info:', githubInfo);

      const log = await GitHubCommitsService.generateWorkLog(
        githubInfo.owner,
        githubInfo.repo,
        parseInt(timeframe)
      );

      if (log) {
        setWorkLog(log);
        setHasFetchedForCurrentConfig(true); // Mark as fetched for this config
        toast.success(`Fetched ${log.commitCount} commits from the last ${timeframe} days`);
        console.log('[AutoWorkLogShare Debug] Work log fetched successfully:', log);
      } else {
        toast.warning(`No commits found in the last ${timeframe} days`);
        setWorkLog(null);
        setHasFetchedForCurrentConfig(false); // Reset if no commits found
        console.log('[AutoWorkLogShare Debug] No commits found for work log.');
      }
    } catch (error) {
      console.error('[AutoWorkLogShare Debug] Error fetching work log:', error.message ? String(error.message) : String(error));
      toast.error('Failed to fetch work log: ' + (error.message || 'Unknown error'));
      setWorkLog(null);
      setHasFetchedForCurrentConfig(false); // Reset on error
    } finally {
      setLoadingWorkLog(false);
      console.log('[AutoWorkLogShare Debug] setLoadingWorkLog(false)');
    }
  }, [project.github_url, timeframe]); // Dependencies for useCallback

  // Effect to reset hasFetchedForCurrentConfig when relevant dependencies change
  useEffect(() => {
    console.log('[AutoWorkLogShare Debug] Resetting hasFetchedForCurrentConfig due to dependency change.');
    setHasFetchedForCurrentConfig(false);
  }, [project.github_url, timeframe]);

  // Effect to trigger fetching based on autoMode and fetch status
  useEffect(() => {
    console.log('[AutoWorkLogShare Debug] Main useEffect: autoMode:', autoMode, 'github_url:', project.github_url, 'hasFetchedForCurrentConfig:', hasFetchedForCurrentConfig);
    if (autoMode && project.github_url && !hasFetchedForCurrentConfig) {
      fetchWorkLog();
    } else if (!autoMode) {
      console.log('[AutoWorkLogShare Debug] Auto mode is off. Clearing work log.');
      setWorkLog(null);
      setHasFetchedForCurrentConfig(false); // Clear and reset if auto mode is off
    } else if (!project.github_url) {
      console.log('[AutoWorkLogShare Debug] No GitHub URL provided. Cannot fetch work log.');
      setWorkLog(null);
      setHasFetchedForCurrentConfig(false); // Clear and reset if no GitHub URL
    }
  }, [autoMode, project.github_url, fetchWorkLog, hasFetchedForCurrentConfig]);


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      // Explicitly convert error to string for robust logging
      console.error('Failed to copy:', err.message ? String(err.message) : String(err));
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareToSocial = (platform, content) => {
    console.log(`[AutoWorkLogShare Debug] Attempting to share to ${platform} with content:`, content);
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
    console.log(`[AutoWorkLogShare Debug] Toggling platform selection for: ${platform}`);
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
    } else {
      newSelected.add(platform);
    }
    setSelectedPlatforms(newSelected);
  };

  const shareToAllSelected = () => {
    console.log('[AutoWorkLogShare Debug] Sharing to all selected platforms.');
    selectedPlatforms.forEach(platform => {
      if (memoizedOptimizedContent[platform] && platform !== 'discord') { // Use memoized content
        setTimeout(() => {
          shareToSocial(platform, memoizedOptimizedContent[platform].content); // Use memoized content
        }, 300); // Small delay between opens
      }
    });
    toast.success(`Opened ${selectedPlatforms.size} sharing windows`);
  };

  // This is the component that renders each social media card.
  // It receives the content from the 'memoizedOptimizedContent'
  const PlatformCard = ({ platform, icon: Icon, title, content, isOptimized, length, limit }) => {
    const isSelected = selectedPlatforms.has(platform);
    const warningThreshold = limit ? limit * 0.9 : 1000;
    const isNearLimit = length > warningThreshold;

    console.log(`[AutoWorkLogShare Debug] Rendering PlatformCard for ${platform}. Content length: ${length}, Is selected: ${isSelected}`);

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
              <p className="text-sm text-gray-700 break-words">{latestCommit.message}</p>
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
          <Card className="bg-gradient-to-r from-green-100 to-blue-100">
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
            <h3 className="font-semibold text-lg mb-2 break-words">{project.title}</h3>
            <p className="text-gray-700 mb-2 break-words">{project.description}</p>
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

          {/* This is the Tabs component where the social media cards should appear */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auto">Auto-Generated Content</TabsTrigger>
              <TabsTrigger value="custom">Custom Message</TabsTrigger>
            </TabsList>

            {/* Content for Auto-Generated Tab */}
            <TabsContent value="auto" className="space-y-4 rounded-md min-h-[200px]">
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
                  Share ({selectedPlatforms.size})
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <PlatformCard
                  platform="twitter"
                  icon={Twitter}
                  title="Twitter/X"
                  content={memoizedOptimizedContent.twitter?.content || ''}
                  isOptimized={memoizedOptimizedContent.twitter?.optimized}
                  length={memoizedOptimizedContent.twitter?.length || 0}
                  limit={280}
                />
                <PlatformCard
                  platform="linkedin"
                  icon={Linkedin}
                  title="LinkedIn"
                  content={memoizedOptimizedContent.linkedin?.content || ''}
                  isOptimized={memoizedOptimizedContent.linkedin?.optimized}
                  length={memoizedOptimizedContent.linkedin?.length || 0}
                  limit={1300}
                />
                <PlatformCard
                  platform="facebook"
                  icon={Facebook}
                  title="Facebook"
                  content={memoizedOptimizedContent.facebook?.content || ''}
                  isOptimized={memoizedOptimizedContent.facebook?.optimized}
                  length={memoizedOptimizedContent.facebook?.length || 0}
                  limit={400}
                />
                <PlatformCard
                  platform="discord"
                  icon={MessageSquare}
                  title="Discord"
                  content={memoizedOptimizedContent.discord?.content || ''}
                  isOptimized={memoizedOptimizedContent.discord?.optimized}
                  length={memoizedOptimizedContent.discord?.length || 0}
                  limit={2000}
                />
              </div>
            </TabsContent>

            {/* Content for Custom Message Tab */}
            <TabsContent value="custom" className="space-y-4 rounded-md min-h-[200px]">
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

              {/* These PlatformCards will only show if a customMessage is present */}
              {customMessage && (
                <div className="grid gap-4 md:grid-cols-2">
                  <PlatformCard
                    platform="twitter"
                    icon={Twitter}
                    title="Twitter/X"
                    content={memoizedOptimizedContent.twitter?.content || ''}
                    isOptimized={memoizedOptimizedContent.twitter?.optimized}
                    length={memoizedOptimizedContent.twitter?.length || 0}
                    limit={280}
                  />
                  <PlatformCard
                    platform="linkedin"
                    icon={Linkedin}
                    title="LinkedIn"
                    content={memoizedOptimizedContent.linkedin?.content || ''}
                    isOptimized={memoizedOptimizedContent.linkedin?.optimized}
                    length={memoizedOptimizedContent.linkedin?.length || 0}
                    limit={1300}
                  />
                  <PlatformCard
                    platform="facebook"
                    icon={Facebook}
                    title="Facebook"
                    content={memoizedOptimizedContent.facebook?.content || ''}
                    isOptimized={memoizedOptimizedContent.facebook?.optimized}
                    length={memoizedOptimizedContent.facebook?.length || 0}
                    limit={400}
                  />
                  <PlatformCard
                    platform="discord"
                    icon={MessageSquare}
                    title="Discord"
                    content={memoizedOptimizedContent.discord?.content || ''}
                    isOptimized={memoizedOptimizedContent.discord?.optimized}
                    length={memoizedOptimizedContent.discord?.length || 0}
                    limit={2000}
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
