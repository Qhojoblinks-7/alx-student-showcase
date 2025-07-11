import { useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card.jsx';
import { useAuth } from '@/hooks/use-auth.js';
import { toast } from 'sonner';
import { Copy, Twitter, Linkedin, Facebook, MessageSquare } from 'lucide-react';

export function ShareProjectModal({ project, onClose }) {
  const { user } = useAuth();
  const [customMessage, setCustomMessage] = useState('');

  const generateContent = (platform, customText = '') => {
    const baseMessage = customText || `Just completed an amazing project: ${project.title}! 🚀`;
    const hashtags = project.technologies ? 
      project.technologies.slice(0, 3).map(tech => `#${tech.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ') : 
      '#coding #webdev #ALX';
    const projectUrl = project.live_url || project.github_url || '';
    
    const templates = {
      twitter: `${baseMessage}\n\n${project.description.slice(0, 100)}...\n\n${hashtags}\n\n${projectUrl}`,
      linkedin: `${baseMessage}\n\n${project.description}\n\nTech Stack: ${project.technologies?.join(', ') || 'Various technologies'}\n\n${projectUrl}\n\n${hashtags} #ALXStudents #SoftwareEngineering`,
      facebook: `${baseMessage}\n\n${project.description}\n\nI used: ${project.technologies?.join(', ') || 'Various technologies'}\n\n${projectUrl ? `Check it out: ${projectUrl}` : ''}`,
      discord: `🎉 **${project.title}** is live!\n\n${project.description}\n\n**Tech Stack:** ${project.technologies?.join(', ') || 'Various technologies'}\n\n${projectUrl ? `🔗 ${projectUrl}` : ''}`
    };
    
    return templates[platform];
  };

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

  const PlatformCard = ({ platform, icon: Icon, title, content }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm">
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{project.title}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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

          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Platform Templates</TabsTrigger>
              <TabsTrigger value="custom">Custom Message</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <PlatformCard
                  platform="twitter"
                  icon={Twitter}
                  title="Twitter/X"
                  content={generateContent('twitter')}
                />
                <PlatformCard
                  platform="linkedin"
                  icon={Linkedin}
                  title="LinkedIn"
                  content={generateContent('linkedin')}
                />
                <PlatformCard
                  platform="facebook"
                  icon={Facebook}
                  title="Facebook"
                  content={generateContent('facebook')}
                />
                <PlatformCard
                  platform="discord"
                  icon={MessageSquare}
                  title="Discord"
                  content={generateContent('discord')}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom Message
                </label>
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
                    content={generateContent('twitter', customMessage)}
                  />
                  <PlatformCard
                    platform="linkedin"
                    icon={Linkedin}
                    title="LinkedIn"
                    content={generateContent('linkedin', customMessage)}
                  />
                  <PlatformCard
                    platform="facebook"
                    icon={Facebook}
                    title="Facebook"
                    content={generateContent('facebook', customMessage)}
                  />
                  <PlatformCard
                    platform="discord"
                    icon={MessageSquare}
                    title="Discord"
                    content={generateContent('discord', customMessage)}
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
  onClose: PropTypes.func.isRequired
};