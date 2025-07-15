import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { ShareProjectModal } from './ShareProjectModal.jsx';
import { AutoWorkLogShare } from './AutoWorkLogShare.jsx';
import { WorkLogGenerator } from './WorkLogGenerator.jsx';
import { 
  Share2, 
  TrendingUp, 
  Calendar,
  Zap,
  ChevronDown
} from 'lucide-react';

export function ShareButton({ project, variant = "outline", size = "sm" }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAutoShare, setShowAutoShare] = useState(false);
  const [showWorkLogGenerator, setShowWorkLogGenerator] = useState(false);

  const hasGitHubUrl = project?.github_url;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            Share
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-56"> {/* Adjusted for mobile responsiveness */}
          <DropdownMenuLabel>Share Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Basic Share
            <span className="ml-auto text-xs text-gray-500">Standard</span>
          </DropdownMenuItem>
          
          {hasGitHubUrl && (
            <DropdownMenuItem onClick={() => setShowAutoShare(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Smart Share
              <span className="ml-auto text-xs text-green-600">Auto</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowWorkLogGenerator(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Work Log Generator
            <span className="ml-auto text-xs text-blue-600">New</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      {showShareModal && (
        <ShareProjectModal
          project={project}
          onClose={() => setShowShareModal(false)}
        />
      )}
      
      {showAutoShare && hasGitHubUrl && (
        <AutoWorkLogShare
          project={project}
          onClose={() => setShowAutoShare(false)}
        />
      )}
      
      {showWorkLogGenerator && (
        <WorkLogGenerator
          defaultRepo={project?.github_url || ''}
          onClose={() => setShowWorkLogGenerator(false)}
        />
      )}
    </>
  );
}

ShareButton.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    technologies: PropTypes.arrayOf(PropTypes.string),
    github_url: PropTypes.string,
    live_url: PropTypes.string,
    category: PropTypes.string
  }),
  variant: PropTypes.string,
  size: PropTypes.string
};
