import { useState } from 'react';
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
import { toast } from 'sonner';
import { Copy, Share2, Twitter, Linkedin, Facebook, MessageSquare } from 'lucide-react'; // Added social icons

export function ShareProjectModal({ project, onClose }) {
  const projectUrl = project.live_url || project.github_url || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    console.log('Copy button clicked!');
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast.success('Project URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy URL to clipboard.');
    }
  };

  const handleNativeShare = () => {
    console.log('Native Share button clicked!');
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

  const shareToSocial = (platform) => {
    const encodedTitle = encodeURIComponent(project.title);
    const encodedDescription = encodeURIComponent(project.description);
    const encodedUrl = encodeURIComponent(projectUrl);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedTitle}%0A${encodedDescription}%0A${encodedUrl}`;
        break;
      case 'linkedin':
        // LinkedIn share-offsite requires a URL and summary/title
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%0A${encodedDescription}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedTitle}%0A${encodedDescription}%0A${encodedUrl}`;
        break;
      default:
        toast.error('Unsupported social platform.');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[480px] p-6"> {/* Adjusted max-width and padding */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="h-6 w-6 text-blue-600" />
            Share Project: {project.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4"> {/* Increased gap */}
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
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
                <span className="sr-only">{copied ? 'Copied!' : 'Copy URL'}</span>
              </Button>
            </div>
          </div>

          {/* Direct Share Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Share Directly</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"> {/* Responsive grid for buttons */}
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
                <Button onClick={handleNativeShare} className="flex items-center justify-center gap-2 col-span-2 sm:col-span-1"> {/* Span full width on mobile if needed */}
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
