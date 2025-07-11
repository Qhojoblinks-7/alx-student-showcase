import { useState, useEffect } from 'react'
import { useAuth } from './../hooks/use-auth'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

import { 
  Plus, 
  Github, 
  Zap 
} from 'lucide-react'

import { ProjectForm } from '../components/projects/ProjectForm'
import { ProjectList } from '../components/projects/ProjectList.jsx'
import { UserProfile } from '../components/profile/UserProfile.jsx'
import { GitHubImportWizard } from '../components/github/GitHubImportWizard.jsx'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('projects')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showGitHubImport, setShowGitHubImport] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [projectStats, setProjectStats] = useState({
    total: 0,
    public: 0,
    technologies: 0
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleProjectAdded = () => {
    setShowProjectForm(false)
    setRefreshTrigger(prev => prev + 1)
    fetchProjectStats()
  }

  const handleGitHubImportComplete = (importedProjects) => {
    setShowGitHubImport(false)
    setRefreshTrigger(prev => prev + 1)
    fetchProjectStats()
    toast.success(`Successfully imported ${importedProjects.length} projects from GitHub!`)
  }

  const fetchProjectStats = async () => {
    if (!user) return

    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('technologies')
        .eq('user_id', user.id)

      if (error) throw error

      const allTechnologies = new Set()
      projects.forEach(project => {
        project.technologies?.forEach(tech => allTechnologies.add(tech))
      })

      setProjectStats({
        total: projects.length,
        public: projects.length, // Assuming all are public for now
        technologies: allTechnologies.size
      })
    } catch (error) {
      console.error('Error fetching project stats:', error)
    }
  }

  useEffect(() => {
    fetchProjectStats()
  }, [user, refreshTrigger])

  return (
    <main className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                onClick={() => setShowGitHubImport(true)}
              >
                <Github className="h-4 w-4 mr-2" />
                <Zap className="h-4 w-4 mr-1" />
                Import from GitHub
              </Button>
              <Button onClick={() => setShowProjectForm(true)}>
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

          {showProjectForm ? (
            <ProjectForm
              onProjectAdded={handleProjectAdded}
              onEditComplete={() => setShowProjectForm(false)}
            />
          ) : (
            <ProjectList refreshTrigger={refreshTrigger} />
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

      {showGitHubImport && (
        <GitHubImportWizard
          onClose={() => setShowGitHubImport(false)}
          onImportComplete={handleGitHubImportComplete}
        />
      )}
    </main>
  )
}