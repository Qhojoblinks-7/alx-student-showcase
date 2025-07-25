// src/components/github/GitHubImportWizard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, CornerDownRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import ProjectConfigurationStep from './GitHubImportWizard/ProjectConfigurationStep';
import OutputGenerationStep from './GitHubImportWizard/OutputGenerationStep';

import {
    fetchRepos,
    selectRepo,
    analyzeRepository,
    setCurrentStep,
    closeWizard,
    setError,
    setProjectFormFields,
    fetchCommitsAndGenerateWorkLog,
    selectALXProject,
    selectGithubState,
    setWorkLogContent,
    setRawCommits,
    setStatus,
    setSocialPosts,
} from '@/store/slices/githubSlice';
import { addProject } from '@/store/slices/projectsSlice';
import { generateUniqueId } from '@/lib/utils';

const GITHUB_REPO_REGEX = /^(?:https?:\/\/github\.com\/)?([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(?:\.git)?$/;

export const GitHubImportWizard = ({ isOpen, onClose }) => {
    // Log prop directly when the component re-renders
    console.log('GitHubImportWizard rendered. isOpen prop:', isOpen);
    const dispatch = useDispatch();
    const {
        currentStep,
        repos,
        selectedRepo,
        projectFormFields,
        workLogContent,
        socialPosts,
        status,
        error,
        alxProjectsDetected,
        selectedALXProject,
    } = useSelector(selectGithubState);
    const { user } = useSelector((state) => state.auth);

    // Log selected Redux state variables on re-render
    console.log('GitHubImportWizard Redux state:', { currentStep, status, selectedRepo, projectFormFields, isWizardOpen: useSelector(selectGithubState).isWizardOpen });

    const [repoUrlInput, setRepoUrlInput] = useState('');
    const [useAIForSummary, setUseAIForSummary] = useState(true);
    const [useAIForWorkLog, setUseAIForWorkLog] = useState(true);
    const [useAIForSocial, setUseAIForSocial] = useState(true);
    const [selectedAIWorkLogFormat, setSelectedAIWorkLogFormat] = useState('bullets');
    const [tempManualWorkLog, setTempManualWorkLog] = useState('');

    const isLoadingRepos = status === 'loading_repos';
    const isAnalyzing = status === 'analyzing_repo';
    const isGeneratingWorkLog = status === 'generating_worklog';
    const isGeneratingSocial = status === 'generating_social_posts';
    const isImporting = status === 'importing';

    // Effect to reset local state when the wizard opens or currentStep changes to 1
    useEffect(() => {
        console.log('GitHubImportWizard useEffect: isOpen changed to', isOpen, 'currentStep:', currentStep);
        if (isOpen && currentStep === 1) {
            console.log('GitHubImportWizard: Resetting local state for new wizard session.');
            setRepoUrlInput('');
            setUseAIForSummary(true);
            setUseAIForWorkLog(true);
            setUseAIForSocial(true);
            setSelectedAIWorkLogFormat('bullets');
            setTempManualWorkLog('');
            dispatch(setRawCommits([])); // Clear raw commits on wizard open/reset
            dispatch(setWorkLogContent('')); // Clear work log content
            dispatch(setSocialPosts(null)); // Clear social posts
            dispatch(setError(null)); // Clear any previous errors
            dispatch(setStatus('idle')); // Reset status to idle
        }
    }, [isOpen, currentStep, dispatch]); // Added dispatch to dependency array

    const handleClose = useCallback(() => {
        console.log('GitHubImportWizard: handleClose called, dispatching closeWizard() and calling parent onClose().');
        dispatch(closeWizard()); // Dispatch the Redux action to close the wizard
        onClose(); // Call the prop function to update parent's local state (if any)
    }, [dispatch, onClose]);

    const handleFetchRepos = useCallback(async () => {
        console.log('GitHubImportWizard: handleFetchRepos called.');
        if (!user?.user_metadata?.github_access_token) {
            toast.error('GitHub token not found. Please connect your GitHub account in your profile settings.');
            console.warn('GitHubImportWizard: GitHub token missing.');
            return;
        }
        dispatch(fetchRepos());
    }, [dispatch, user?.user_metadata?.github_access_token]);

    const handleSelectRepo = useCallback(async (repo) => {
        console.log('GitHubImportWizard: handleSelectRepo called for:', repo.name);
        dispatch(selectRepo(repo));
        dispatch(setCurrentStep(2));
        try {
            console.log('GitHubImportWizard: Initiating repository analysis for selected repo.');
            await dispatch(analyzeRepository({
                owner: repo.owner.login,
                repoName: repo.name,
                useAI: useAIForSummary,
            })).unwrap();
            console.log('GitHubImportWizard: Repository analysis completed successfully.');
        } catch (err) {
            console.error('GitHubImportWizard: Failed to analyze repository:', err);
            toast.error(`Failed to analyze repository: ${err.message || 'Unknown error'}`);
            dispatch(setCurrentStep(1)); // Go back to step 1 on error
            dispatch(selectRepo(null)); // Clear selected repo
        }
    }, [dispatch, useAIForSummary]);

    const handleManualRepoInput = useCallback(async () => {
        console.log('GitHubImportWizard: handleManualRepoInput called with URL:', repoUrlInput);
        const match = repoUrlInput.match(GITHUB_REPO_REGEX);
        if (!match) {
            console.warn('GitHubImportWizard: Invalid GitHub repository URL format.');
            dispatch(setError('Invalid GitHub repository URL format. Please use "owner/repo" or a full GitHub URL.'));
            return;
        }
        dispatch(setError(null));
        const [, owner, repoName] = match;

        const tempRepo = {
            id: generateUniqueId(), // Use generateUniqueId for a temporary ID
            name: repoName,
            full_name: `${owner}/${repoName}`,
            html_url: `https://github.com/${owner}/${repoName}`,
            owner: { login: owner, avatar_url: `https://github.com/${owner}.png` }, // Basic avatar URL
            description: null,
            default_branch: 'main', // Assume 'main' for manual entry
        };
        dispatch(selectRepo(tempRepo));
        dispatch(setCurrentStep(2));
        try {
            console.log('GitHubImportWizard: Initiating repository analysis for manual input.');
            await dispatch(analyzeRepository({
                owner: owner,
                repoName: repoName,
                useAI: useAIForSummary,
            })).unwrap();
            console.log('GitHubImportWizard: Manual repository analysis completed successfully.');
        } catch (err) {
            console.error('GitHubImportWizard: Failed to analyze manual repository:', err);
            toast.error(`Failed to analyze repository: ${err.message || 'Unknown error'}`);
            dispatch(setCurrentStep(1));
            dispatch(selectRepo(null));
        }
    }, [dispatch, repoUrlInput, useAIForSummary]);

    const handleSetProjectFormFields = useCallback((fields) => {
        console.log('GitHubImportWizard: setProjectFormFields called with:', fields);
        dispatch(setProjectFormFields(fields));
    }, [dispatch]);

    const handleSetUseAIForSummary = useCallback((checked) => {
        console.log('GitHubImportWizard: setUseAIForSummary called with:', checked);
        setUseAIForSummary(checked);
        // If enabling AI summary and a repo is selected and not currently analyzing, re-analyze
        if (checked && selectedRepo && !isAnalyzing) {
            console.log('GitHubImportWizard: Re-analyzing repo for AI summary due to toggle.');
            dispatch(analyzeRepository({
                owner: selectedRepo.owner.login,
                repoName: selectedRepo.name,
                useAI: true,
            }));
        }
    }, [dispatch, selectedRepo, isAnalyzing]);

    const handleSelectALXProjectInChild = useCallback((value) => {
        console.log('GitHubImportWizard: handleSelectALXProjectInChild called with value:', value);
        const alxProject = alxProjectsDetected.find(p => p.id === value);
        dispatch(selectALXProject(alxProject));
    }, [dispatch, alxProjectsDetected]);

    const handleApplyALXProjectDetailsInChild = useCallback(() => {
        console.log('GitHubImportWizard: handleApplyALXProjectDetailsInChild called.');
        if (selectedALXProject) {
            console.log('GitHubImportWizard: Applying ALX project details:', selectedALXProject);
            dispatch(setProjectFormFields({
                title: selectedALXProject.title,
                description: selectedALXProject.description || projectFormFields.description,
                technologies: [...new Set([...projectFormFields.technologies, ...selectedALXProject.technologies])], // Merge technologies
                is_alx_project: true,
                category: selectedALXProject.suggested_category,
                difficulty: selectedALXProject.suggested_difficulty,
                ai_summary: selectedALXProject.ai_summary, // Keep AI summary from analysis if available
            }));
            toast.success(`Applied details for ALX project: ${selectedALXProject.title}`);
        } else {
            console.warn('GitHubImportWizard: Attempted to apply ALX details without a selected project.');
            toast.error('Please select an ALX project first.');
        }
    }, [dispatch, selectedALXProject, projectFormFields.description, projectFormFields.technologies]);

    const handleGenerateSocialPosts = useCallback(async () => {
        console.log('GitHubImportWizard: handleGenerateSocialPosts called.');
        if (useAIForSocial && projectFormFields.title) {
            dispatch(setStatus('generating_social_posts'));
            try {
                console.log('GitHubImportWizard: Simulating AI social media post generation...');
                // Simulate API call for social posts
                const generatedPosts = await new Promise(resolve => setTimeout(() => ({
                    twitter: `Just imported "${projectFormFields.title}"! Built with ${projectFormFields.technologies.join(', ')}. Check it out! #ALXProjects #Coding`,
                    linkedin: `Excited to share my recent project, "${projectFormFields.title}"! This ${projectFormFields.category || 'software development'} project leverages ${projectFormFields.technologies.join(', ')}. Key learnings include... [workLog summary here] #SoftwareDevelopment #GitHub #ALX`,
                }), 1500));

                dispatch(setSocialPosts(generatedPosts));
                dispatch(setStatus('succeeded'));
                console.log('GitHubImportWizard: Social media posts generated.');
            } catch (err) {
                console.error('GitHubImportWizard: Failed to generate social media posts:', err);
                toast.error(`Failed to generate social media posts: ${err.message || 'Unknown error'}`);
                dispatch(setError(err.message || 'Failed to generate social media posts.'));
                dispatch(setStatus('failed'));
                setUseAIForSocial(false); // Disable AI if generation fails
            }
        } else {
            console.log("GitHubImportWizard: AI Social Media generation is not enabled or project title is missing. Skipping generation.");
            toast.info("AI Social Media generation is not enabled or project title is missing.");
        }
    }, [dispatch, useAIForSocial, projectFormFields.title, projectFormFields.technologies, projectFormFields.category]);

    const handleGenerateWorkLog = useCallback(async () => {
        console.log('GitHubImportWizard: handleGenerateWorkLog called.');
        if (useAIForWorkLog && selectedRepo) {
            try {
                console.log('GitHubImportWizard: Initiating AI work log generation.');
                await dispatch(fetchCommitsAndGenerateWorkLog({
                    owner: selectedRepo.owner.login,
                    repoName: selectedRepo.name,
                    branch: selectedRepo.default_branch || 'main',
                    timeframe: 'all', // Or dynamically selected timeframe
                    format: selectedAIWorkLogFormat,
                })).unwrap();
                console.log('GitHubImportWizard: Work log generated successfully.');
            } catch (err) {
                console.error('GitHubImportWizard: Failed to generate work log:', err);
                toast.error(`Failed to generate work log: ${err.message || 'Unknown error'}`);
                dispatch(setError(err.message || 'Failed to generate work log.'));
                setUseAIForWorkLog(false); // Disable AI if generation fails
            }
        } else {
            console.log("GitHubImportWizard: AI Work Log generation is not enabled or no repository selected. Skipping generation.");
            toast.info("AI Work Log generation is not enabled or no repository selected.");
        }
    }, [dispatch, useAIForWorkLog, selectedRepo, selectedAIWorkLogFormat]);

    const handleConfirmProjectDetails = useCallback(async () => {
        console.log('GitHubImportWizard: handleConfirmProjectDetails called.');
        if (!projectFormFields.title || !projectFormFields.description || !projectFormFields.technologies?.length) {
            console.warn('GitHubImportWizard: Project details missing for confirmation.');
            toast.error('Project Name, Description, and Technologies are required.');
            dispatch(setError('Project Name, Description, and Technologies are required.'));
            return;
        }
        dispatch(setError(null));
        dispatch(setCurrentStep(3)); // Move to work log step

        // If AI work log is enabled, trigger its generation immediately
        if (useAIForWorkLog && selectedRepo) {
            console.log('GitHubImportWizard: Triggering AI work log generation after project details confirmed.');
            try {
                await dispatch(fetchCommitsAndGenerateWorkLog({
                    owner: selectedRepo.owner.login,
                    repoName: selectedRepo.name,
                    branch: selectedRepo.default_branch || 'main',
                    timeframe: 'all',
                    format: selectedAIWorkLogFormat, // Use the selected format
                })).unwrap();
            } catch (err) {
                console.error('GitHubImportWizard: Failed to generate work log during project details confirmation:', err);
                toast.error(`Failed to generate work log: ${err.message || 'Unknown error'}`);
                setUseAIForWorkLog(false); // Fallback to manual if AI fails
                dispatch(setError(err.message || 'Failed to generate work log.'));
            }
        }
    }, [dispatch, projectFormFields.title, projectFormFields.description, projectFormFields.technologies, useAIForWorkLog, selectedRepo, selectedAIWorkLogFormat]);


    const handleConfirmWorkLog = useCallback(async () => {
        console.log('GitHubImportWizard: handleConfirmWorkLog called.');
        dispatch(setCurrentStep(4)); // Move to social posts step
        // If AI social media generation is enabled and posts haven't been generated yet, trigger it
        if (useAIForSocial && !socialPosts && projectFormFields.title) {
            console.log('GitHubImportWizard: Triggering AI social media post generation after work log confirmed.');
            handleGenerateSocialPosts();
        }
    }, [dispatch, useAIForSocial, socialPosts, projectFormFields.title, handleGenerateSocialPosts]);

    const handleConfirmSocialMedia = useCallback(() => {
        console.log('GitHubImportWizard: handleConfirmSocialMedia called. Moving to final review step.');
        dispatch(setCurrentStep(5));
    }, [dispatch]);

    const handleImportProjects = useCallback(async () => {
        console.log('GitHubImportWizard: handleImportProjects called. Finalizing import.');
        if (!user?.id) {
            console.warn('GitHubImportWizard: User not authenticated for project import.');
            toast.error('User not authenticated. Cannot import project.');
            return;
        }
        dispatch(setStatus('importing'));
        try {
            const projectToImport = {
                ...projectFormFields,
                user_id: user.id,
                github_repo_id: selectedRepo?.id?.toString(), // Ensure it's a string if needed for DB
                github_url: selectedRepo?.html_url,
                // If AI was used, take the content from Redux state; otherwise, from local manual input
                ai_work_log: useAIForWorkLog ? workLogContent : tempManualWorkLog,
                ai_social_posts: useAIForSocial ? socialPosts : null,
            };

            console.log('GitHubImportWizard: Dispatching addProject with:', projectToImport);
            await dispatch(addProject(projectToImport)).unwrap();
            toast.success('Project imported and added successfully!');
            console.log('GitHubImportWizard: Project imported successfully.');

            if (useAIForSocial && socialPosts && Object.keys(socialPosts).length > 0) {
                toast.info('Social media posts generated. You can now copy and share them.');
            }
            dispatch(setStatus('succeeded'));
            handleClose(); // Close the wizard after successful import
        } catch (err) {
            console.error('GitHubImportWizard: Failed to import project:', err);
            toast.error('Failed to import project: ' + (err.message || 'Unknown error'));
            dispatch(setStatus('failed'));
        }
    }, [dispatch, user?.id, projectFormFields, selectedRepo, useAIForWorkLog, workLogContent, tempManualWorkLog, useAIForSocial, socialPosts, handleClose]);

    const handleNextStep = useCallback(() => {
        console.log('GitHubImportWizard: handleNextStep called for currentStep:', currentStep);
        switch (currentStep) {
            case 1:
                console.warn("GitHubImportWizard: Attempted to call handleNextStep for Step 1. This should not happen as Step 1 transitions are handled by explicit repo selection/manual input.");
                break;
            case 2: // Project Details -> Work Log
                handleConfirmProjectDetails();
                break;
            case 3: // Work Log -> Social Posts
                handleConfirmWorkLog();
                break;
            case 4: // Social Posts -> Review & Import
                handleConfirmSocialMedia();
                break;
            case 5: // Review & Import -> Finalize (Import)
                handleImportProjects();
                break;
            default:
                // Fallback for unexpected steps, though ideally, transitions are explicit
                console.log(`GitHubImportWizard: Moving to next step from ${currentStep} to ${currentStep + 1}`);
                dispatch(setCurrentStep(currentStep + 1));
                break;
        }
    }, [currentStep, handleConfirmProjectDetails, handleConfirmWorkLog, handleConfirmSocialMedia, handleImportProjects, dispatch]);

    const renderStepContent = () => {
        console.log('GitHubImportWizard: Rendering content for currentStep:', currentStep);
        switch (currentStep) {
            case 1:
            case 2:
                return (
                    <ProjectConfigurationStep
                        user={user}
                        repos={repos}
                        repoUrlInput={repoUrlInput}
                        setRepoUrlInput={setRepoUrlInput}
                        handleFetchRepos={handleFetchRepos}
                        handleSelectRepo={handleSelectRepo}
                        handleManualRepoInput={handleManualRepoInput}
                        isLoadingRepos={isLoadingRepos}
                        isAnalyzing={isAnalyzing}
                        error={error}
                        currentSubStep={currentStep} // Pass current step to determine which part of config to show
                        selectedRepo={selectedRepo}
                        projectFormFields={projectFormFields}
                        setProjectFormFields={handleSetProjectFormFields}
                        useAIForSummary={useAIForSummary}
                        setUseAIForSummary={handleSetUseAIForSummary}
                        alxProjectsDetected={alxProjectsDetected}
                        selectedALXProject={selectedALXProject}
                        handleSelectALXProject={handleSelectALXProjectInChild}
                        handleApplyALXProjectDetails={handleApplyALXProjectDetailsInChild}
                    />
                );
            case 3:
            case 4:
            case 5:
                return (
                    <OutputGenerationStep
                        currentSubStep={currentStep} // Pass current step to determine which part of output to show
                        error={error}
                        workLogContent={workLogContent}
                        socialPosts={socialPosts}
                        tempManualWorkLog={tempManualWorkLog}
                        setTempManualWorkLog={setTempManualWorkLog}
                        useAIForWorkLog={useAIForWorkLog}
                        setUseAIForWorkLog={setUseAIForWorkLog}
                        selectedAIWorkLogFormat={selectedAIWorkLogFormat}
                        setSelectedAIWorkLogFormat={setSelectedAIWorkLogFormat}
                        useAIForSocial={useAIForSocial}
                        setUseAIForSocial={setUseAIForSocial}
                        isGeneratingWorkLog={isGeneratingWorkLog}
                        isGeneratingSocial={isGeneratingSocial}
                        projectFormFields={projectFormFields}
                        selectedRepo={selectedRepo} // Pass selectedRepo for work log generation details
                        onGenerateWorkLog={handleGenerateWorkLog}
                        onGenerateSocialPosts={handleGenerateSocialPosts}
                        onImportProject={handleImportProjects} // For the final import button in Step 5
                    />
                );
            default:
                console.warn('GitHubImportWizard: Unknown step requested for rendering:', currentStep);
                return <div className="text-center text-muted-foreground">Unknown step.</div>;
        }
    };

    const getStepButtonText = () => {
        switch (currentStep) {
            case 1: return 'Next (Not used for Step 1)'; // Step 1 buttons are handled internally by ProjectConfigurationStep
            case 2: return isAnalyzing ? 'Analyzing...' : 'Confirm Project Details';
            case 3: return isGeneratingWorkLog ? 'Generating Work Log...' : 'Confirm Work Log';
            case 4: return isGeneratingSocial ? 'Generating Social Posts...' : 'Confirm Social Posts';
            case 5: return isImporting ? 'Importing...' : 'Finalize & Import Project';
            default: return 'Next';
        }
    };

    const isNextButtonDisabled = () => {
        const isProcessing = isLoadingRepos || isAnalyzing || isGeneratingWorkLog || isGeneratingSocial || isImporting;

        if (isProcessing) return true;

        switch (currentStep) {
            case 1:
                return true; // Next button is not directly used for step 1
            case 2: // Project Details step
                return !projectFormFields.title || !projectFormFields.description || projectFormFields.technologies?.length === 0;
            case 3: // Work Log step
                return (useAIForWorkLog && !workLogContent) || (!useAIForWorkLog && !tempManualWorkLog.trim());
            case 4: // Social Posts step
                return false; // Social posts step can always proceed, even if AI is off or posts are empty
            case 5: // Review & Import step
                return false; // Final step should allow import unless another operation is ongoing
            default: return false;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            console.log('GitHubImportWizard Dialog onOpenChange called with:', open);
            // Prevent closing if an operation is in progress, otherwise call handleClose
            if (!isAnalyzing && !isLoadingRepos && !isImporting && !isGeneratingWorkLog && !isGeneratingSocial) {
                if (!open) handleClose();
            } else {
                toast.info("Cannot close wizard while an operation is in progress.");
                console.log('GitHubImportWizard: Dialog close prevented due to ongoing operation.');
            }
        }}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg sm:max-w-[800px] flex flex-col max-h-[95vh] h-full">
                <DialogHeader>
                    <DialogTitle>GitHub Project Import Wizard</DialogTitle>
                    <DialogDescription>
                        Import your GitHub project and enhance its details with AI.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Tracker */}
                <div className="flex justify-between items-center py-4 text-xs sm:text-sm">
                    {['Select Repo', 'Project Details', 'Work Log', 'Social Posts', 'Review & Import'].map((label, index) => (
                        <React.Fragment key={label}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${currentStep === index + 1 ? 'bg-primary text-primary-foreground' :
                                    currentStep > index + 1 ? 'bg-green-500 text-white' :
                                    'bg-muted text-muted-foreground'}`}>
                                    {currentStep > index + 1 ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                </div>
                                <span className="text-xs sm:text-sm text-center mt-1">{label}</span>
                            </div>
                            {index < 4 && <div className={`flex-1 h-0.5 ${currentStep > index + 1 ? 'bg-green-500' : 'bg-muted-foreground'}`} />}
                        </React.Fragment>
                    ))}
                </div>
                <Separator className="my-2" />

                {/* Main Content Area for Steps */}
                <div className="flex-1 overflow-auto">
                    {renderStepContent()}
                </div>

                {/* Dialog Footer with Navigation Buttons */}
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2 pt-4 border-t gap-2 sm:gap-0">
                    {currentStep > 1 && currentStep < 5 && ( // Show "Previous" button for steps 2, 3, 4
                        <Button
                            variant="outline"
                            onClick={() => {
                                console.log('GitHubImportWizard: Previous button clicked, setting step to', currentStep - 1);
                                dispatch(setCurrentStep(currentStep - 1));
                            }}
                            disabled={isAnalyzing || isGeneratingWorkLog || isGeneratingSocial || isImporting}
                            className="w-full sm:w-auto"
                        >
                            Previous
                        </Button>
                    )}

                    {currentStep === 5 && ( // Show "Edit Details" button only on Step 5
                        <Button
                            variant="outline"
                            onClick={() => {
                                console.log('GitHubImportWizard: Edit Details button clicked, setting step to 2.');
                                dispatch(setCurrentStep(2));
                            }}
                            className="w-full sm:w-auto"
                        >
                            <CornerDownRight className="mr-2 h-4 w-4 rotate-180" /> Edit Details
                        </Button>
                    )}

                    <div className="flex-grow hidden sm:block" /> {/* Spacer for desktop layout */}

                    {currentStep !== 1 && currentStep !== 5 && ( // Show "Next" button for steps 2, 3, 4
                        <Button
                            onClick={handleNextStep}
                            disabled={isNextButtonDisabled()}
                            className="w-full sm:w-auto"
                        >
                            {(isAnalyzing || isGeneratingWorkLog || isGeneratingSocial) ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {getStepButtonText()}
                        </Button>
                    )}

                    {currentStep === 5 && ( // Show "Finalize & Import" button only on Step 5
                        <Button
                            onClick={handleNextStep} // This calls handleImportProjects
                            disabled={isNextButtonDisabled()}
                            className="w-full sm:w-auto"
                        >
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            {getStepButtonText()}
                        </Button>
                    )}

                    {/* Cancel/Close Button */}
                    {currentStep === 5 ? ( // "Close Wizard" on final step
                        <Button onClick={handleClose} variant="secondary" className="w-full sm:w-auto">Close Wizard</Button>
                    ) : ( // "Cancel" on other steps
                        <Button onClick={handleClose} variant="ghost" disabled={isAnalyzing || isGeneratingWorkLog || isGeneratingSocial || isImporting} className="w-full sm:w-auto">Cancel</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GitHubImportWizard;