# ALX Student Showcase 🚀

A modern web application built for ALX Software Engineering students to document their coding journey and share their projects across social media platforms.

## Features ✨

- **User Authentication**: Secure login/signup with Supabase Auth
- **Project Management**: Add, edit, and organize your coding projects
- **Social Media Integration**: Generate formatted posts for X (Twitter), LinkedIn, Facebook, and Discord
- **Profile Management**: Showcase your ALX journey with a comprehensive profile
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack 🛠️

- **Frontend**: React 19, JavaScript (JSX), Vite
- **Styling**: Tailwind CSS V4, shadcn/ui
- **Backend**: Supabase (Authentication & Database)
- **Package Manager**: npm (not yarn or bun)
- **Icons**: Lucide React

## Quick Start 🏃‍♂️

### Prerequisites

- Node.js (v18+)
- npm
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alx-student-showcase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   *Note: If you encounter ERESOLVE errors, use `npm install --legacy-peer-deps`*

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL schema from `supabase-schema.txt` in your Supabase SQL Editor

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Database Setup 📊

Run the SQL commands from `supabase-schema.txt` in your Supabase SQL Editor to create the necessary tables:

- **users**: Extended user profiles with ALX-specific fields
- **projects**: Student project documentation with rich metadata

The schema includes:
- Row Level Security (RLS) policies
- Automatic user profile creation on signup
- Optimized indexes for performance

## Usage Guide 📖

### Getting Started

1. **Sign Up/Login**: Create an account or login with Google/GitHub
2. **Complete Profile**: Add your ALX ID, GitHub username, and bio
3. **Add Projects**: Document your coding projects with:
   - Project details and description
   - Tech stack and difficulty level
   - GitHub and live demo links
   - Key learnings and challenges
   - Project images and tags

### Sharing Projects

1. **Navigate to Your Projects**: View all your documented projects
2. **Click Share Button**: Open the sharing modal for any project
3. **Choose Platform**: Select from X, LinkedIn, Facebook, or Discord
4. **Customize Content**: Edit the auto-generated posts as needed
5. **Copy or Share**: Use the direct sharing buttons or copy to clipboard

### Platform-Specific Features

- **X (Twitter)**: Optimized for 280-character limit with hashtags
- **LinkedIn**: Professional format with detailed project information
- **Facebook**: Engaging format for broader audience
- **Discord**: Developer-friendly format with markdown styling

## Project Structure 📁

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── projects/      # Project management components
│   ├── profile/       # User profile components
│   ├── sharing/       # Social media sharing components
│   └── ui/           # Reusable UI components (shadcn/ui)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
└── types/            # TypeScript type definitions
```

## Contributing 🤝

We welcome contributions from the ALX community! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Environment Variables 🔐

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |

## Deployment 🚀

**Ready to go live? Your app is deployment-ready!**

### Quick Deploy (2 minutes)

1. **Prepare for deployment:**
   ```bash
   ./deploy.sh  # Automated deployment preparation
   ```

2. **Choose your platform:**

   **Option A: Vercel (Recommended)**
   - Push to GitHub
   - Import project at [vercel.com](https://vercel.com)
   - Add environment variables
   - Deploy! ✨

   **Option B: Netlify**
   - Push to GitHub or drag & drop `dist` folder
   - Configure at [netlify.com](https://netlify.com)
   - Goes live instantly! 🚀

### Deployment Files Included

- ✅ `vercel.json` - Vercel configuration
- ✅ `netlify.toml` - Netlify configuration  
- ✅ `public/_redirects` - SPA routing
- ✅ `Dockerfile` - Container deployment
- ✅ `.github/workflows/deploy.yml` - CI/CD
- ✅ `deploy.sh` - Automated preparation script

### Build Stats

- **Build Size**: ~576KB (optimized)
- **Load Time**: <2s on fast connections
- **Performance**: Optimized for production

**📖 Detailed Instructions**: See `DEPLOYMENT.md` for comprehensive deployment guide

**⚡ Quick Start**: See `QUICK-DEPLOY.md` for 1-click deployment

## Support & Community 💬

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join our community discussions
- **ALX Community**: Share your showcased projects with fellow ALX students

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments 🙏

- Built for the ALX Software Engineering community
- Powered by Supabase and modern web technologies
- UI components from shadcn/ui

---

**Happy Coding! 🎉**

*Built with ❤️ for ALX Students*