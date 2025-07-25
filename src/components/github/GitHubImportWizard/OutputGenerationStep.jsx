// src/components/github/GitHubImportWizard/OutputGenerationStep.jsx
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, FileText, Share2, CheckCircle2, Frown, Brain } from 'lucide-react';
import TechIcon from '@/assets/icons/TechIcon'; // Assuming this exists

const OutputGenerationStep = ({
  currentSubStep, // This will be 3 for work log, 4 for social, 5 for review
  error,
  workLogContent,
  socialPosts,
  tempManualWorkLog,
  setTempManualWorkLog,
  useAIForWorkLog,
  setUseAIForWorkLog,
  selectedAIWorkLogFormat,
  setSelectedAIWorkLogFormat,
  useAIForSocial,
  setUseAIForSocial,
  isGeneratingWorkLog,
  isGeneratingSocial,
  projectFormFields, // To display summary in review step
  selectedRepo, // To display repo URL in review step
  onGenerateWorkLog, // Callback to parent to trigger work log generation
  onGenerateSocialPosts, // Callback to parent to trigger social posts generation
  onImportProject, // Callback to parent to trigger final import
}) => {
  const workLogRef = useRef(null);
  const socialPostsRef = useRef(null);

  useEffect(() => {
    if (currentSubStep === 3 && !isGeneratingWorkLog && workLogContent && workLogRef.current) {
      workLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (currentSubStep === 4 && !isGeneratingSocial && socialPosts && Object.keys(socialPosts).length > 0 && socialPostsRef.current) {
      socialPostsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSubStep, isGeneratingWorkLog, isGeneratingSocial, workLogContent, socialPosts]);

  const renderWorkLogGeneration = () => (
    <ScrollArea className="h-[calc(80vh-150px)] p-2">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Generate Work Log
        {isGeneratingWorkLog && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
      </h3>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4" ref={workLogRef}>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useAIForWorkLog"
            checked={useAIForWorkLog}
            onCheckedChange={setUseAIForWorkLog}
            disabled={isGeneratingWorkLog}
          />
          <label htmlFor="useAIForWorkLog" className="text-sm font-medium leading-none">
            Use AI to generate work log from GitHub commits
          </label>
        </div>

        {useAIForWorkLog ? (
          <div className="space-y-2">
            <RadioGroup value={selectedAIWorkLogFormat} onValueChange={setSelectedAIWorkLogFormat} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bullets" id="format-bullets" disabled={isGeneratingWorkLog} />
                <Label htmlFor="format-bullets">Bullet Points</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paragraph" id="format-paragraph" disabled={isGeneratingWorkLog} />
                <Label htmlFor="format-paragraph">Paragraph</Label>
              </div>
            </RadioGroup>
            <Button
              onClick={onGenerateWorkLog}
              disabled={isGeneratingWorkLog || !selectedRepo}
            >
              {isGeneratingWorkLog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Generate Work Log
            </Button>
            {workLogContent && (
              <div className="mt-4 p-3 border rounded-md bg-secondary text-secondary-foreground whitespace-pre-wrap">
                <h4 className="font-semibold mb-2">Generated Work Log:</h4>
                {workLogContent}
              </div>
            )}
            {error && ( // Display error specific to work log generation if it fails
              <p className="text-red-500 text-sm">
                <Frown className="inline h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        ) : (
          <div>
            <Label htmlFor="manualWorkLog" className="mb-1 block">Manual Work Log Entry</Label>
            <Textarea
              id="manualWorkLog"
              value={tempManualWorkLog}
              onChange={(e) => setTempManualWorkLog(e.target.value)}
              placeholder="Enter your work log manually..."
              rows={8}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const renderSocialMediaGeneration = () => (
    <ScrollArea className="h-[calc(80vh-150px)] p-2">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        Generate Social Media Posts
        {isGeneratingSocial && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
      </h3>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4" ref={socialPostsRef}>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useAIForSocial"
            checked={useAIForSocial}
            onCheckedChange={setUseAIForSocial}
            disabled={isGeneratingSocial}
          />
          <label htmlFor="useAIForSocial" className="text-sm font-medium leading-none">
            Use AI to generate social media posts
          </label>
        </div>

        {useAIForSocial && (
          <div className="space-y-2">
            <Button
              onClick={onGenerateSocialPosts}
              disabled={isGeneratingSocial || !projectFormFields.title}
            >
              {isGeneratingSocial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Generate Posts
            </Button>
            {socialPosts && Object.keys(socialPosts).length > 0 ? (
              <div className="mt-4 space-y-4">
                {Object.entries(socialPosts).map(([platform, postContent]) => (
                  <div key={platform} className="p-3 border rounded-md bg-background">
                    <h4 className="font-semibold mb-2 capitalize">{platform} Post:</h4>
                    <Textarea value={postContent} readOnly rows={5} className="font-mono text-sm" />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(postContent);
                        toast.info(`${platform} post copied to clipboard!`);
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              isGeneratingSocial ? null : (
                <p className="text-muted-foreground mt-4">
                  No social media posts generated. Click "Generate Posts" to create them.
                </p>
              )
            )}
            {error && ( // Display error specific to social generation if it fails
              <p className="text-red-500 text-sm">
                <Frown className="inline h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const renderReviewAndImport = () => (
    <ScrollArea className="h-[calc(80vh-150px)] p-2">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        Ready to Import!
      </h3>
      <p className="text-muted-foreground mb-4">Review the project details before finalizing the import.</p>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Project Summary</h4>
        <div className="p-4 border rounded-md bg-secondary/30">
          <p className="text-sm">
            <span className="font-medium">Name:</span> {projectFormFields.title}
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">Description:</span> {projectFormFields.description}
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">Technologies:</span>{' '}
            {projectFormFields.technologies?.map((tech) => (
              <span key={tech} className="inline-flex items-center gap-1 bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full text-xs mr-1">
                <TechIcon techName={tech} className="h-3 w-3" />
                {tech}
              </span>
            ))}
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">GitHub URL:</span>{' '}
            <a href={selectedRepo?.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {selectedRepo?.full_name}
            </a>
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">Category:</span> {projectFormFields.category || 'N/A'}
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">Difficulty:</span> {projectFormFields.difficulty || 'N/A'}
          </p>
          {projectFormFields.ai_summary && (
            <p className="text-sm mt-2">
              <span className="font-medium">AI Summary:</span> {projectFormFields.ai_summary}
            </p>
          )}
        </div>

        {(workLogContent || tempManualWorkLog) && (
          <>
            <h4 className="font-semibold text-lg mt-6">Work Log</h4>
            <div className="p-4 border rounded-md bg-secondary/30 whitespace-pre-wrap">
              {useAIForWorkLog ? workLogContent : tempManualWorkLog}
            </div>
          </>
        )}

        {projectFormFields.ai_social_posts && Object.keys(projectFormFields.ai_social_posts).length > 0 && (
          <>
            <h4 className="font-semibold text-lg mt-6">Generated Social Media Posts</h4>
            <div className="space-y-3">
              {Object.entries(projectFormFields.ai_social_posts).map(([platform, postContent]) => (
                <div key={platform} className="p-3 border rounded-md bg-background">
                  <h5 className="font-semibold capitalize">{platform}:</h5>
                  <p className="text-sm font-mono whitespace-pre-wrap">{postContent}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );

  switch (currentSubStep) {
    case 3: return renderWorkLogGeneration();
    case 4: return renderSocialMediaGeneration();
    case 5: return renderReviewAndImport();
    default: return <div className="text-center text-muted-foreground">Unknown step.</div>;
  }
};

export default OutputGenerationStep;