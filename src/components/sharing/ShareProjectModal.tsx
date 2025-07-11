import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  X, 
  Linkedin, 
  Facebook, 
  MessageCircle, 
  Copy, 
  ExternalLink,
  Sparkles
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  tech_stack: string[]
  github_url: string | null
  live_demo_url: string | null
  project_type: string
  difficulty_level: string
  completion_date: string | null
  time_spent_hours: number | null
  key_learnings: string | null
  challenges_faced: string | null
  image_url: string | null
  tags: string[]
}

interface ShareProjectModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareProjectModal({ project, open, onOpenChange }: ShareProjectModalProps) {
  const [customContent, setCustomContent] = useState('')

  if (!project) return null

  const generateTwitterContent = () => {
    const hashtags = ['#ALX', '#CodeNewbie', '#WebDev', '#Programming']
    const techHashtags = project.tech_stack.slice(0, 2).map(tech => `#${tech.replace(/[^a-zA-Z0-9]/g, '')}`)
    
    return `🚀 Just finished my latest project: "${project.title}"

${project.description.slice(0, 100)}${project.description.length > 100 ? '...' : ''}

💻 Built with: ${project.tech_stack.slice(0, 3).join(', ')}${project.tech_stack.length > 3 ? '...' : ''}

${project.github_url ? `🔗 Code: ${project.github_url}` : ''}
${project.live_demo_url ? `🌐 Live: ${project.live_demo_url}` : ''}

${[...hashtags, ...techHashtags].join(' ')}`
  }

  const generateLinkedInContent = () => {
    return `🎉 Excited to share my latest project: "${project.title}"

${project.description}

🛠️ Technical Stack:
${project.tech_stack.map(tech => `• ${tech}`).join('\n')}

${project.key_learnings ? `💡 Key Learnings:\n${project.key_learnings}\n\n` : ''}${project.challenges_faced ? `🧗‍♂️ Challenges Overcome:\n${project.challenges_faced}\n\n` : ''}${project.time_spent_hours ? `⏱️ Development Time: ${project.time_spent_hours} hours\n\n` : ''}🔗 Links:
${project.github_url ? `📂 Source Code: ${project.github_url}` : ''}
${project.live_demo_url ? `🌐 Live Demo: ${project.live_demo_url}` : ''}

This project represents another step in my journey as a software developer at ALX. Always eager to learn, build, and grow! 🚀

#ALX #SoftwareDevelopment #WebDevelopment #Programming #TechJourney ${project.tech_stack.slice(0, 3).map(tech => `#${tech.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')}`
  }

  const generateFacebookContent = () => {
    return `🎯 Project Showcase: "${project.title}"

Hey friends! I just completed another exciting coding project and wanted to share it with you all!

📝 What it does:
${project.description}

🔧 Technologies I used:
${project.tech_stack.join(' • ')}

${project.key_learnings ? `💭 What I learned:\n${project.key_learnings}\n\n` : ''}${project.time_spent_hours ? `⏰ Time invested: ${project.time_spent_hours} hours of coding, learning, and problem-solving!\n\n` : ''}${project.github_url ? `Want to see the code? Check it out: ${project.github_url}\n` : ''}${project.live_demo_url ? `Try it yourself: ${project.live_demo_url}\n` : ''}
Grateful for the incredible journey at ALX where I'm constantly learning and building cool stuff! 🚀

#ALXCommunity #Programming #WebDevelopment #CodingJourney`
  }

  const generateDiscordContent = () => {
    return `🎉 **New Project Alert!** 🎉

**${project.title}**

${project.description}

**Tech Stack:** \`${project.tech_stack.join('` `')}\`
${project.difficulty_level && `**Difficulty:** ${project.difficulty_level.charAt(0).toUpperCase() + project.difficulty_level.slice(1)}`}
${project.time_spent_hours ? `**Time Spent:** ${project.time_spent_hours} hours` : ''}

${project.github_url ? `📂 **Code:** ${project.github_url}` : ''}
${project.live_demo_url ? `🌐 **Live Demo:** ${project.live_demo_url}` : ''}

${project.key_learnings ? `💡 **Key Learnings:**\n${project.key_learnings}` : ''}

Another one in the books! 🚀 #ALX #coding`
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const openSocialMedia = (platform: string, content: string) => {
    let url = ''
    const encodedContent = encodeURIComponent(content)
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedContent}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedContent}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedContent}`
        break
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  const platforms = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: X,
      color: 'text-black',
      content: generateTwitterContent(),
      limit: 280
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-600',
      content: generateLinkedInContent(),
      limit: 3000
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-700',
      content: generateFacebookContent(),
      limit: 63206
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: MessageCircle,
      color: 'text-indigo-600',
      content: generateDiscordContent(),
      limit: 2000
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Share Your Project
          </DialogTitle>
          <DialogDescription>
            Choose a platform and customize your post to share "{project.title}" with the world!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="twitter" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {platforms.map(platform => {
              const Icon = platform.icon
              return (
                <TabsTrigger key={platform.id} value={platform.id}>
                  <Icon className={`h-4 w-4 mr-2 ${platform.color}`} />
                  {platform.name}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {platforms.map(platform => (
            <TabsContent key={platform.id} value={platform.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                    {platform.name} Post
                  </CardTitle>
                  <CardDescription>
                    Character limit: {platform.content.length} / {platform.limit}
                    {platform.content.length > platform.limit && (
                      <Badge variant="destructive" className="ml-2">
                        Over limit
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`content-${platform.id}`}>Generated Content</Label>
                    <Textarea
                      id={`content-${platform.id}`}
                      value={platform.content}
                      readOnly
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(platform.content)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    
                    {platform.id !== 'discord' && (
                      <Button
                        onClick={() => openSocialMedia(platform.id, platform.content)}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Share on {platform.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Custom Message</CardTitle>
            <CardDescription>
              Create your own custom message for sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your custom message here..."
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              rows={4}
            />
            <Button
              onClick={() => copyToClipboard(customContent)}
              disabled={!customContent.trim()}
              variant="outline"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Custom Message
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}