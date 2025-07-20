import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { toast } from 'sonner';
import {
  Copy,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  MessageSquare,
  GitCommit,
  TrendingUp,
  Loader2,
  Calendar,
  BarChart3,
  Zap,
  RefreshCw,
  Search
} from 'lucide-react';
// Corrected import path for GitHubCommitsService
import { GitHubCommitsService } from '@/lib/github-commits-service.js';
import { SocialContentOptimizer } from '@/lib/social-optimizer.js'; // Import SocialContentOptimizer

export function ShareProjectModal({ project, onClose }) {
  const projectUrl = project.live_url || project.github_url || '';
  const [copied, setCopied] = useState(false);

  // States for Work Log & Smart Share features
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'smart'
  const [customMessage, setCustomMessage] = useState('');
  const [workLog, setWorkLog] = useState(null);
  const [loadingWorkLog, setLoadingWorkLog] = useState(false);
  const [timeframe, setTimeframe] = useState('7');
  const [repoInfo, setRepoInfo] = useState(null);
  const [autoMode, setAutoMode] = useState(true); // For AutoWorkLogShare logic

  // Memoize the optimized content based on project, workLog, and customMessage
  const optimizedContent = useMemo(() => {
    // Only generate if we are in 'smart' tab and have a project/repoInfo
    if (activeTab === 'smart' && (workLog || customMessage) && (project || repoInfo)) {
      // Create a mock project object if using WorkLogGenerator's repoInfo
      const mockProject = project.github_url ? project : {
        title: repoInfo?.name || 'Project',
        description: repoInfo?.description || 'A project',
        technologies: repoInfo?.language ? [repoInfo.language] : [],
        github_url: project.github_url,
        live_url: repoInfo?.homepage || '',
        category: 'other' // Default category
      };
      // Pass aiWorkLogSummaryText (which is workLog if it's the AI summary string)
      // and rawCommits (empty array as SocialContentOptimizer's analyzeCommits expects raw commit objects)
      return SocialContentOptimizer.generatePlatformContent(
        mockProject,
        workLog?.aiSummaryText || null, // Assuming workLog contains an aiSummaryText property if AI-generated
        workLog?.rawCommits || [], // Pass rawCommits if available for internal analysis
        customMessage
      );
    }
    return {};
  }, [activeTab, project, workLog, customMessage, repoInfo]);

  // Auto-fetch work log when in smart tab and GitHub URL is available
  const fetchWorkLog = useCallback(async () => {
    if (!project.github_url) {
      toast.error('No GitHub URL found for this project');
      return;
    }

    setLoadingWorkLog(true);
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(project.github_url);
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      // Fetch repository info and commits in parallel
      const [repoResponse, workLogData] = await Promise.all([
        fetch(`https://api.github.com/repos/${githubInfo.username}/${githubInfo.repoName}`),
        GitHubCommitsService.generateWorkLog(
          githubInfo.username,
          githubInfo.repoName,
          parseInt(timeframe)
        )
      ]);

      if (repoResponse.ok) {
        const repoData = await repoResponse.json();
        setRepoInfo({
          name: repoData.name,
          description: repoData.description,
          language: repoData.language,
          homepage: repoData.homepage,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count
        });
      } else {
        console.error('Failed to fetch repo info:', repoResponse.statusText);
      }

      if (workLogData) {
        setWorkLog(workLogData);
        toast.success(`Generated work log with ${workLogData.commitCount} commits from the last ${timeframe} days`);
      } else {
        toast.warning(`No commits found in the last ${timeframe} days`);
        setWorkLog(null);
      }
    } catch (error) {
      console.error('Error fetching work log:', error.message ? String(error.message) : String(error));
      toast.error('Failed to fetch work log: ' + (error.message || 'Unknown error'));
      setWorkLog(null);
      setRepoInfo(null);
    } finally {
      setLoadingWorkLog(false);
    }
  }, [project.github_url, timeframe]);

  useEffect(() => {
    if (activeTab === 'smart' && autoMode && project.github_url) {
      fetchWorkLog();
    } else if (activeTab === 'smart' && !autoMode) {
      setWorkLog(null); // Clear work log if auto mode is off
    } else if (!project.github_url) {
      setWorkLog(null);
    }
  }, [activeTab, autoMode, project.github_url, fetchWorkLog]);


  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: projectUrl,
      })
      .then(() => toast.success('Project shared successfully!'))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share project.');
        }
      });
    } else {
      toast.info('Web Share API not supported in this browser. Please use direct social buttons or copy the URL.');
    }
  };

  const shareToSocial = (platform, contentToShare = projectUrl) => {
    const encodedContent = encodeURIComponent(contentToShare);
    const encodedTitle = encodeURIComponent(project.title);
    const encodedDescription = encodeURIComponent(project.description);
    const encodedUrl = encodeURIComponent(projectUrl);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedContent}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedContent}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedContent}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedContent}`;
        break;
      default:
        toast.error('Unsupported social platform.');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const generateTemplateMessages = useCallback(() => {
    if (!workLog) return [];

    const { commitCount, timeframe, summary } = workLog;
    const { mostActiveArea, categories } = summary;

    return [
      `🚀 Been busy coding! ${commitCount} commits in the last ${timeframe} days on ${repoInfo?.name || project.title}`,
      `💻 Development update: ${commitCount} commits focused on ${mostActiveArea} over ${timeframe} days`,
      `📈 Progress report: ${categories.features} features, ${categories.fixes} fixes, ${categories.refactor} refactors in ${timeframe} days`,
      `🔥 ${commitCount} commits and counting! Working hard on ${repoInfo?.name || project.title}`,
      `✨ Weekly dev summary: ${commitCount} commits with a focus on ${mostActiveArea}`
    ];
  }, [workLog, repoInfo, project.title]);

  const PlatformCard = ({ platform, icon: Icon, title, content, length, limit, isOptimized }) => {
    const warningThreshold = limit ? limit * 0.9 : 1000;
    const isNearLimit = length > warningThreshold;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
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
              onClick={() => handleCopy(content)}
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
    if (!workLog || !repoInfo) return null;

    const { commitCount, timeframe, summary, latestCommit } = workLog;

    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 break-words">{repoInfo.name} - Work Log</h3>
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

          {repoInfo && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              {repoInfo.language && <span>{repoInfo.language}</span>}
              {repoInfo.stars !== undefined && <span>⭐ {repoInfo.stars}</span>}
              {repoInfo.forks !== undefined && <span>🍴 {repoInfo.forks}</span>}
            </div>
          )}

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
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="h-6 w-6 text-blue-600" />
            Share Project: {project.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-4">
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <Button
                variant={activeTab === 'basic' ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab('basic')}
                className="px-4 py-2 rounded-md"
              >
                Basic Share
              </Button>
              <Button
                variant={activeTab === 'smart' ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab('smart')}
                className="px-4 py-2 rounded-md"
              >
                Smart Share
              </Button>
            </div>
          </div>

          {/* Basic Share Tab Content */}
          <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
            <div className="grid gap-6 py-4">
              {/* Project URL Section */}
              <div className="space-y-2">
                <Label htmlFor="project-url" className="text-sm font-medium">
                  Project URL
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="project-url"
                    value={projectUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={() => handleCopy(projectUrl)} variant="outline" size="icon">
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">{copied ? 'Copied!' : 'Copy URL'}</span>
                  </Button>
                </div>
              </div>

              {/* Direct Share Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Share Directly</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Button onClick={() => shareToSocial('twitter')} variant="outline" className="flex items-center justify-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    Twitter
                  </Button>
                  <Button onClick={() => shareToSocial('linkedin')} variant="outline" className="flex items-center justify-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    LinkedIn
                  </Button>
                  <Button onClick={() => shareToSocial('facebook')} variant="outline" className="flex items-center justify-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    Facebook
                  </Button>
                  <Button onClick={() => shareToSocial('whatsapp')} variant="outline" className="flex items-center justify-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    WhatsApp
                  </Button>
                  {navigator.share && (
                    <Button onClick={handleNativeShare} className="flex items-center justify-center gap-2 col-span-2 sm:col-span-1">
                      <Share2 className="h-5 w-5" />
                      Native Share
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>

          {/* Smart Share Tab Content */}
          <div className={activeTab === 'smart' ? 'block' : 'hidden'}>
            {!project.github_url ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitCommit className="h-12 w-12 mx-auto mb-4" />
                <p>No GitHub URL provided for this project.</p>
                <p>Please add a GitHub URL to the project to use Smart Share features.</p>
              </div>
            ) : (
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

                {/* Project Overview (simplified for Smart Share context) */}
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

                {/* Custom Message */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Custom Message</h3>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write your custom work log message here, or select a template below..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>

                {/* Template Messages (only if workLog exists) */}
                {workLog && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Quick Templates
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {generateTemplateMessages().map((template, index) => (
                          <button
                            key={index}
                            onClick={() => setCustomMessage(template)}
                            className="text-left p-2 rounded border hover:bg-gray-50 text-sm break-words"
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generated Content */}
                {(workLog || customMessage) && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Optimized Content for Social Platforms
                    </h3>

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
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-6">
                  <Button onClick={onClose} variant="secondary">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      // Logic to share all selected optimized content
                      const platformsToShare = Object.keys(optimizedContent).filter(
                        (p) => optimizedContent[p]?.content && p !== 'discord' // Exclude discord from direct share
                      );
                      if (platformsToShare.length === 0) {
                        toast.warning('No content to share or no platforms selected.');
                        return;
                      }
                      platformsToShare.forEach((p) => {
                        shareToSocial(p, optimizedContent[p].content);
                      });
                      toast.success(`Opened ${platformsToShare.length} sharing windows.`);
                    }}
                    disabled={!workLog && !customMessage} // Disable if no content to share
                  >
                    Share All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

ShareProjectModal.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    technologies: PropTypes.arrayOf(PropTypes.string),
    github_url: PropTypes.string,
    live_url: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
