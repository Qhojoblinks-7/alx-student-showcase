// src/components/Dashboard.jsx
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, Suspense, lazy } from 'react' // Ensure Suspense and lazy are imported if used, though not directly in Dashboard
import { useAuth } from './../hooks/use-auth'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

// ... (other imports remain the same) ...

// IMPORTANT: Re-include or ensure this safeLog is globally available or defined in this file if not
function safeLog(label, value) {
  try {
    const serialized = JSON.stringify(value, null, 2);
    console.log(`${label}:`, serialized);
  } catch (err) {
    console.log(`${label}: [Unserializable Object - ${err.message}]`); // More descriptive error
  }
}

export function Dashboard() {
  const dispatch = useDispatch()
  const { user, signOut } = useAuth()

  // --- ADD THESE DEBUG LOGS ---
  safeLog("Dashboard: User data", user);
  safeLog("Dashboard: user.email", user?.email);
  // --- END DEBUG LOGS ---

  const activeTab = useSelector(state => state.ui.activeTab)
  const modals = useSelector(state => state.ui.modals)
  const projectStats = useSelector(state => state.projects.stats)

  // --- ADD THESE DEBUG LOGS ---
  safeLog("Dashboard: Project Stats from Redux", projectStats);
  safeLog("Dashboard: projectStats.total", projectStats?.total);
  safeLog("Dashboard: projectStats.public", projectStats?.public);
  safeLog("Dashboard: projectStats.technologies", projectStats?.technologies);
  // --- END DEBUG LOGS ---

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
    <main className="p-8">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                    onClick={openProjectForm}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Project
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 border-white/20"
                    onClick={openGitHubImport}
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

        {modals.gitHubImport && (
          <GitHubImportWizard
            onClose={closeGitHubImport}
            onImportComplete={handleGitHubImportComplete}
          />
        )}

      </Tabs>
    </main>
  )
}