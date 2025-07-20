import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
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
  Calendar,
  BarChart3,
  Github,
  Search,
  Zap
} from 'lucide-react';

export function WorkLogGenerator({ onClose, defaultRepo = '' }) {
  const { user } = useAuth();
  const [githubUrl, setGithubUrl] = useState(defaultRepo);
  const [customMessage, setCustomMessage] = useState('');
  const [workLog, setWorkLog] = useState(null);
  const [loadingWorkLog, setLoadingWorkLog] = useState(false);
  const [timeframe, setTimeframe] = useState('7');
  const [optimizedContent, setOptimizedContent] = useState({});
  const [repoInfo, setRepoInfo] = useState(null);

  // Generate optimized content when work log or custom message changes
  useEffect(() => {
    if (workLog && repoInfo) {
      const mockProject = {
        title: repoInfo.name,
        description: repoInfo.description || `Work log for ${repoInfo.name}`,
        technologies: repoInfo.language ? [repoInfo.language] : [],
        github_url: githubUrl,
        live_url: repoInfo.homepage || '',
        category: 'other'
      };

      const content = SocialContentOptimizer.generatePlatformContent(
        mockProject,
        workLog,
        [], // rawCommits are not needed here if AI summary is primary
        customMessage
      );
      setOptimizedContent(content);
      // --- DEBUG LOG ---
      console.log('WorkLogGenerator - Optimized Content:', content);
      // --- END DEBUG LOG ---
    } else if (!workLog && !customMessage) {
      // Clear optimized content if no work log and no custom message
      setOptimizedContent({});
    }
  }, [workLog, customMessage, repoInfo, githubUrl]);

  const fetchWorkLog = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    setLoadingWorkLog(true);
    try {
      const githubInfo = GitHubCommitsService.parseGitHubUrl(githubUrl.trim());
      if (!githubInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      // Fetch repository info and commits in parallel
      const [repoResponse, log] = await Promise.all([
        fetch(`https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repo}`), // Use owner/repo from parsed info
        GitHubCommitsService.generateWorkLog(
          githubInfo.owner, // Use owner
          githubInfo.repo, // Use repo
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
        console.log('WorkLogGenerator - Fetched Repo Info:', repoData); // DEBUG LOG
      } else {
        console.error('WorkLogGenerator - Failed to fetch repo info:', repoResponse.statusText); // DEBUG LOG
      }

      if (log) {
        setWorkLog(log);
        toast.success(`Generated work log with ${log.commitCount} commits from the last ${timeframe} days`);
        console.log('WorkLogGenerator - Generated Work Log:', log); // DEBUG LOG
      } else {
        toast.warning(`No commits found in the last ${timeframe} days`);
        setWorkLog(null);
      }
    } catch (error) {
      // Explicitly convert error to string for robust logging
      console.error('Error fetching work log:', error.message ? String(error.message) : String(error));
      toast.error('Failed to fetch work log: ' + (error.message || 'Unknown error'));
      setWorkLog(null);
      setRepoInfo(null);
    } finally {
      setLoadingWorkLog(false);
    }
  };

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
    const encodedContent = encodeURIComponent(content);
    const projectUrl = repoInfo?.homepage || githubUrl || '';

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedContent}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}&summary=${encodedContent}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}&quote=${encodedContent}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const generateTemplateMessages = useCallback(() => {
    if (!workLog) return [];

    const { commitCount, timeframe, summary } = workLog;
    const { mostActiveArea, categories } = summary;

    return [
      `🚀 Been busy coding! ${commitCount} commits in the last ${timeframe} days on ${repoInfo?.name || 'my project'}`,
      `💻 Development update: ${commitCount} commits focused on ${mostActiveArea} over ${timeframe} days`,
      `📈 Progress report: ${categories.features} features, ${categories.fixes} fixes, ${categories.refactor} refactors in ${timeframe} days`,
      `🔥 ${commitCount} commits and counting! Working hard on ${repoInfo?.name || 'this project'}`,
      `✨ Weekly dev summary: ${commitCount} commits with a focus on ${mostActiveArea}`
    ];
  }, [workLog, repoInfo]);

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
            <div className="flex items-center gap-2"> {/* Added flex container for badge and length */}
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
            <h3 className="font-semibold text-blue-900 break-words">{repoInfo.name} - Work Log</h3> {/* Added break-words */}
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
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3"> {/* Added flex-wrap */}
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
              <p className="text-sm text-gray-700 break-words">{latestCommit.message}</p> {/* Changed truncate to break-words */}
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
      <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"> {/* Added w-full */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Work Log Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* GitHub Repository Input */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="github-url">GitHub Repository URL</Label>
                  {/* Changed to flex-col on mobile, then flex on sm and up */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <Input
                      id="github-url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchWorkLog()}
                      disabled={loadingWorkLog}
                    />
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-full sm:w-32"> {/* Adjusted width for mobile */}
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
                    <Button
                      onClick={fetchWorkLog}
                      disabled={loadingWorkLog || !githubUrl.trim()}
                      className="w-full sm:w-auto" /* Adjusted width for mobile */
                    >
                      {loadingWorkLog ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Log Summary */}
          {workLog && <WorkLogSummary />}

          {/* Template Messages */}
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
                      className="text-left p-2 rounded border hover:bg-gray-50 text-sm break-words" /* Added break-words */
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Message */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Custom Message</h3>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your custom work log message here, or select a template above..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}

WorkLogGenerator.propTypes = {
  onClose: PropTypes.func.isRequired,
  defaultRepo: PropTypes.string
};
