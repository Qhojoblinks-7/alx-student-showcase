import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@/hooks/use-auth.js'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'

import { 
  Plus, 
  Github, 
  Zap 
} from 'lucide-react'

import { ProjectForm } from '@/components/projects/ProjectForm.jsx'
import { ProjectList } from '@/components/projects/ProjectList.jsx'
import { UserProfile } from '@/components/profile/UserProfile.jsx'
import { GitHubImportWizard } from '@/components/github/GitHubImportWizard.jsx'

// Redux actions
import { setActiveTab, openModal, closeModal } from '@/store/slices/uiSlice.js'
import { fetchProjectStats } from '@/store/slices/projectsSlice.js'

export function Dashboard() {
  const dispatch = useDispatch()
  const { user, signOut } = useAuth()
  
  // Redux state
  const activeTab = useSelector(state => state.ui.activeTab)
  const modals = useSelector(state => state.ui.modals)
  const projectStats = useSelector(state => state.projects.stats)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleProjectAdded = () => {
    dispatch(closeModal('projectForm'))
    if (user) {
      dispatch(fetchProjectStats(user.id))
    }
  }

  const handleGitHubImportComplete = (importedProjects) => {
    dispatch(closeModal('gitHubImport'))
    if (user) {
      dispatch(fetchProjectStats(user.id))
    }
    toast.success(`Successfully imported ${importedProjects.length} projects from GitHub!`)
  }

  const handleTabChange = (newTab) => {
    dispatch(setActiveTab(newTab))
  }

  const openProjectForm = () => {
    dispatch(openModal({ modalName: 'projectForm' }))
  }

  const openGitHubImport = () => {
    dispatch(openModal({ modalName: 'gitHubImport' }))
  }

  const closeProjectForm = () => {
    dispatch(closeModal('projectForm'))
  }

  const closeGitHubImport = () => {
    dispatch(closeModal('gitHubImport'))
  }

  useEffect(() => {
    if (user) {
      dispatch(fetchProjectStats(user.id))
    }
  }, [user, dispatch])

  return (
    <main className="p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Your Projects</h3>
              <p className="text-muted-foreground">
                Manage and share your coding projects with the ALX community
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-dashed"
                onClick={openGitHubImport}
              >
                <Github className="h-4 w-4 mr-2" />
                <Zap className="h-4 w-4 mr-1" />
                Import from GitHub
              </Button>
              <Button onClick={openProjectForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{projectStats.total}</CardTitle>
                <CardDescription>Total Projects</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{projectStats.public}</CardTitle>
                <CardDescription>Public Projects</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{projectStats.technologies}</CardTitle>
                <CardDescription>Tech Stack Items</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {modals.projectForm ? (
            <ProjectForm
              onProjectAdded={handleProjectAdded}
              onEditComplete={closeProjectForm}
            />
          ) : (
            <ProjectList />
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold">Profile Settings</h3>
            <p className="text-muted-foreground">
              Update your profile information to showcase your ALX journey
            </p>
            <UserProfile />
          </div>
        </TabsContent>
      </Tabs>

      {modals.gitHubImport && (
        <GitHubImportWizard
          onClose={closeGitHubImport}
          onImportComplete={handleGitHubImportComplete}
        />
      )}
    </main>
  )
}