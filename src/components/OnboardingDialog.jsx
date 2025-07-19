// src/components/OnboardingDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Dialog from '@radix-ui/react-dialog';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
  ArrowRight,
  CheckCircle,
  FolderPlus,
  Github,
  User,
  BarChart2,
  Lightbulb, // For tips
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils.js'; // Assuming cn utility is here

/**
 * OnboardingDialog Component
 * A multi-step dialog to guide new users through the application's core features.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback function when the dialog is closed.
 * @param {function} props.onAction - Callback for specific actions (e.g., 'addProject', 'importGithub').
 */
export function OnboardingDialog({ isOpen, onClose, onAction }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      title: 'Welcome to ALX Showcase! 🎉',
      description: 'Your personal portfolio to document and share your amazing ALX projects. Let\'s get you started!',
      icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
      actionLabel: 'Next',
      action: () => setCurrentStep(currentStep + 1),
    },
    {
      title: '1. Add Your First Project',
      description: 'Start by manually adding a project to showcase your skills and achievements.',
      icon: <FolderPlus className="h-10 w-10 text-blue-500" />,
      actionLabel: 'Add Project Now',
      action: () => {
        onAction('addProject');
        onClose();
      },
    },
    {
      title: '2. Import from GitHub',
      description: 'Easily import your ALX projects directly from your GitHub repositories.',
      icon: <Github className="h-10 w-10 text-gray-700" />,
      actionLabel: 'Import from GitHub',
      action: () => {
        onAction('importGithub');
        onClose();
      },
    },
    {
      title: '3. Complete Your Profile',
      description: 'Make your showcase stand out by adding your full name, ALX ID, and social links.',
      icon: <User className="h-10 w-10 text-purple-500" />,
      actionLabel: 'Go to Profile',
      action: () => {
        onAction('viewProfile');
        onClose();
      },
    },
    {
      title: '4. View Your Stats',
      description: 'Track your progress with insightful statistics about your projects and technologies.',
      icon: <BarChart2 className="h-10 w-10 text-green-500" />,
      actionLabel: 'View Dashboard Stats',
      action: () => {
        onAction('viewStats');
        onClose();
      },
    },
    {
      title: 'You\'re All Set! ✨',
      description: 'You\'re now ready to fully explore and utilize ALX Showcase. Happy showcasing!',
      icon: <CheckCircle className="h-10 w-10 text-teal-500" />,
      actionLabel: 'Finish Onboarding',
      action: onClose,
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Add state for theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
    console.log('Dark mode toggled:', !isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content className="max-w-md sm:max-w-lg p-6 rounded-lg shadow-xl">
        <Dialog.Header className="text-center space-y-4">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={toggleTheme} className="text-muted-foreground">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <div className="mx-auto flex items-center justify-center mb-4">
            {currentStepData.icon}
          </div>
          <Dialog.Title className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentStepData.title}
          </Dialog.Title>
          <Dialog.Description className="text-base text-muted-foreground px-4">
            {currentStepData.description}
          </Dialog.Description>
        </Dialog.Header>

        <Separator className="my-6" />

        <div className="flex justify-between items-center mt-4">
          {!isLastStep && (
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
              Skip
            </Button>
          )}
          <Button
            onClick={currentStepData.action}
            className={cn("flex-1", { "mx-auto": isLastStep })}
          >
            {currentStepData.actionLabel}
            {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {!isLastStep && (
          <div className="flex justify-center mt-4 space-x-2">
            {steps.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full",
                  index === currentStep ? "bg-blue-600" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        )}

        {/* Temporary test case for DialogContent accessibility verification */}
        <DialogContent descriptionId="test-description">
          <p id="test-description">This is a test description for accessibility.</p>
        </DialogContent>
      </Dialog.Content>
    </Dialog.Root>
  );
}

OnboardingDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};
