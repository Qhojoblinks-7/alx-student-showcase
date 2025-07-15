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
import { Copy, Share2 } from 'lucide-react';

export function ShareProjectModal({ project, onClose }) {
  const projectUrl = project.live_url || project.github_url || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    console.log('Copy button clicked!'); // Added for debugging
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast.success('Project URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy URL to clipboard.');
    }
  };

  const handleShare = () => {
    console.log('Share button clicked!'); // Added for debugging
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: projectUrl,
      })
      .then(() => toast.success('Project shared successfully!'))
      .catch((error) => {
        if (error.name !== 'AbortError') { // Ignore user cancelling share
          console.error('Error sharing:', error);
          toast.error('Failed to share project.');
        }
      });
    } else {
      toast.info('Web Share API not supported in this browser. Please copy the URL manually.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[425px]"> {/* Added w-full for mobile */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Project: {project.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Adjusted grid for mobile responsiveness */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"> 
            <Label htmlFor="project-url" className="text-left sm:text-right"> {/* Adjusted text alignment */}
              URL
            </Label>
            <Input
              id="project-url"
              value={projectUrl}
              readOnly
              className="col-span-1 sm:col-span-3" /* Adjusted col-span for mobile */
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCopy} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy URL'}
          </Button>
          <Button onClick={handleShare}>
            Share
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
