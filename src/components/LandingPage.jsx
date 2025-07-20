import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import {
  Sparkle,
  Github,
  Share2,
  BarChart2,
  BookOpen,
  Users,
  ArrowRight,
  FolderDot,
  Lightbulb,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Badge } from './ui/badge.jsx';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-900 dark:text-gray-100 flex flex-col items-center">
      {/* Header/Navbar (Optional - can be integrated from a global layout) */}
      <header className="w-full max-w-7xl mx-auto p-4 flex justify-between items-center z-10">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ALX Showcase
        </div>
        <nav className="space-x-4">
          <Link to="/auth">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 text-center overflow-hidden">
        {/* Background gradient circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob top-10 left-10"></div>
          <div className="absolute w-96 h-96 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 bottom-10 right-10"></div>
          <div className="absolute w-96 h-96 bg-green-300 dark:bg-green-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 top-10 right-10"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Sparkle className="h-4 w-4 mr-2 text-yellow-500" />
            Empower Your ALX Journey
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Showcase Your ALX Projects, Effortlessly.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Build a stunning portfolio, track your progress, and share your achievements with the ALX community and beyond.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/features"> {/* Placeholder link */}
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-800">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
          Powerful Features for Your Portfolio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg bg-white dark:bg-gray-800">
            <FolderDot className="h-12 w-12 text-blue-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Effortless Project Management</CardTitle>
            <CardContent className="text-gray-600 dark:text-gray-300">
              Organize all your ALX projects with detailed descriptions, technologies, and links.
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg bg-white dark:bg-gray-800">
            <Github className="h-12 w-12 text-gray-700 dark:text-gray-300 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Seamless GitHub Import</CardTitle>
            <CardContent className="text-gray-600 dark:text-gray-300">
              Import your repositories directly from GitHub, saving you time and effort.
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg bg-white dark:bg-gray-800">
            <Zap className="h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">AI-Powered Smart Sharing</CardTitle>
            <CardContent className="text-gray-600 dark:text-gray-300">
              Generate optimized social media posts and work log summaries from your commit history.
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg bg-white dark:bg-gray-800">
            <BarChart2 className="h-12 w-12 text-purple-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Insightful Project Analytics</CardTitle>
            <CardContent className="text-gray-600 dark:text-gray-300">
              Track your progress with statistics on project categories, technologies, and more.
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg bg-white dark:bg-gray-800">
            <Users className="h-12 w-12 text-orange-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">Community & Collaboration</CardTitle>
            <CardContent className="text-gray-600 dark:text-gray-300">
              Share your public projects and connect with other ALX learners.
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center text-center p-6 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg bg-white dark:bg-gray-800">
            <Lightbulb className="h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle className="text-xl font-semibold mb-2">AI-Driven Recommendations</CardTitle>
            <CardContent className="text-gray-600 dark:text-gray-300">
              Get personalized project recommendations based on your skills and interests.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full bg-blue-600 dark:bg-blue-800 py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Showcase Your ALX Brilliance?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of ALX learners building their professional online presence.
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-10 py-4 text-xl rounded-full bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              Start Building Your Portfolio Today!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-800 dark:bg-gray-900 py-8 text-gray-300 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ALX Showcase. All rights reserved.</p>
          <p className="mt-2">Built with passion for the ALX Community.</p>
        </div>
      </footer>

      {/* Tailwind CSS Animation Keyframes (for hero section blobs) */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.3, 0.9);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
