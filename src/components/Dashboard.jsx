import { useDispatch, useSelector } from 'react-redux'

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
  Zap, 
  Sparkle,
  LogOut,
  Target
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
    <>
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkle className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ALX Showcase
                </h1>
              </div>
              <Badge variant="secondary" className="hidden md:flex">
                Portfolio & Social Sharing Platform
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
    <main className="p-8">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome to your ALX Showcase! 🚀
                  </h2>
                  <p className="text-blue-100 mb-4">
                    Document your coding journey and share your achievements with the world
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-white text-blue-600 hover:bg-blue-50"
                      onClick={() => setShowProjectForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Project
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="bg-white/20 text-white hover:bg-white/30 border-white/20"
                      onClick={() => setShowGitHubImport(true)}
                    >
                      <Github className="h-4 w-4 mr-2" />
                      <Zap className="h-4 w-4 mr-1" />
                      Import from GitHub
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 mt-6">
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
    </>
  )
}

