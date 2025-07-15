# ALX Student Showcase 🚀

Your ultimate portfolio platform to document, manage, and share your incredible ALX Software Engineering projects with the world\!

-----

✨ **Features at a Glance**

  * **Secure Authentication:** Seamless sign-up and login powered by Supabase Auth, including Google & GitHub integrations.
  * **Comprehensive Project Management:** Easily add, edit, and organize all your coding projects with rich metadata.
  * **Smart Social Sharing:** Generate perfectly formatted posts for X (Twitter), LinkedIn, Facebook, and Discord with a single click.
  * **Dynamic Profile:** Create a detailed profile showcasing your ALX journey, skills, and contact information.
  * **GitHub Import Wizard:** Effortlessly import your ALX projects directly from your GitHub repositories.
  * **Work Log Generation:** Automatically create summaries of your recent GitHub activity for project updates.
  * **Responsive & Modern UI:** A beautiful, intuitive interface designed with Tailwind CSS and shadcn/ui, ensuring a flawless experience on any device.

-----

🛠️ **Tech Stack**

This application is built with a robust and modern technology stack:

  * **Frontend:** React 19, JavaScript (JSX), Vite
  * **Styling:** Tailwind CSS V4, shadcn/ui
  * **Backend & Database:** Supabase (PostgreSQL, Authentication, Realtime)
  * **Package Manager:** npm
  * **Icons:** Lucide React

-----

🚀 **Quick Start Guide**

Get your ALX Student Showcase up and running in minutes\!

### Prerequisites

Before you begin, ensure you have the following installed:

  * Node.js (v18 or higher)
  * npm (Node Package Manager)
  * A Supabase account (free tier is sufficient)

### Installation Steps

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd alx-student-showcase
    ```

2.  **Install project dependencies:**

    ```bash
    npm install
    # If you encounter ERESOLVE errors, try: npm install --legacy-peer-deps
    ```

3.  **Set up your Supabase Project:**

      * Go to [supabase.com](https://supabase.com/) and create a new project.
      * Navigate to **Settings \> API** to find your **Project URL** and **Anon Key**.
      * Open your Supabase SQL Editor and run the database schema provided in `supabase-schema.txt`. This will create your `users` and `projects` tables, along with Row Level Security (RLS) policies and triggers.

4.  **Configure Environment Variables:**

      * Create a copy of the example environment file:
        ```bash
        cp .env.local.example .env.local
        ```
      * Open `.env.local` and update it with your Supabase credentials:
        ```
        VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
        # Optional: For GitHub API rate limit increase (recommended for import feature)
        # VITE_GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
        ```
        Replace `"YOUR_SUPABASE_PROJECT_URL"` and `"YOUR_SUPABASE_ANON_KEY"` with your actual values.
        For `VITE_GITHUB_TOKEN`, generate a Personal Access Token (PAT) with `public_repo` scope on GitHub if you plan to use the GitHub import feature extensively.

5.  **Start the Development Server:**

    ```bash
    npm run dev
    ```

    Your application will now be running locally, typically at `http://localhost:5173`.

6.  **Build for Production:**

    ```bash
    npm run build
    ```

    This command compiles the application into the `dist` directory, ready for deployment.

-----

📊 **Database Schema**

The core database schema is defined in `supabase-schema.txt` and includes:

  * `users` table: Stores extended user profiles (full name, ALX ID, GitHub username, LinkedIn URL, bio, etc.) linked to Supabase Auth users.
  * `projects` table: Houses detailed documentation for each student project, including title, description, technologies, URLs, categories, and ALX-specific metadata.

**Key Database Features:**

  * **Row Level Security (RLS):** Ensures data privacy and proper access control.
  * **Automatic Profile Creation:** A database trigger automatically creates a `users` entry upon new user sign-up via Supabase Auth.
  * **Optimized Indexes:** For efficient data retrieval and performance.
  * `updated_at` timestamps: Triggers automatically update timestamps on record modifications.

-----

📖 **Usage Guide**

### Getting Started

1.  **Sign Up or Log In:** Create a new account or sign in using email/password, Google, or GitHub.
2.  **Onboarding Tour:** For first-time users, an interactive onboarding dialog will guide you through key features.
3.  **Complete Your Profile:** Navigate to the "Profile" tab to add your ALX ID, GitHub username, professional bio, and social links.
4.  **Add Your Projects:**
      * **Manually:** Click "Add Project" to input details like project description, tech stack, difficulty, links, key learnings, and challenges.
      * **From GitHub:** Use the "Import GitHub" wizard to fetch your repositories, detect ALX projects, and import them directly.

### Sharing Your Projects

1.  **View Your Projects:** Go to the "Projects" tab to see all your documented work.
2.  **Click the Share Icon:** On any project card, click the share button to open the sharing modal.
3.  **Generate Work Log (Optional):** If the project has a GitHub URL, you can generate a summary of recent commits to include in your post.
4.  **Choose Your Platform:** Select from X (Twitter), LinkedIn, Facebook, or Discord.
5.  **Customize Content:** Edit the auto-generated post content to perfectly match your message.
6.  **Copy or Share:** Copy the formatted text to your clipboard or use direct sharing buttons where available.

### Platform-Specific Features

  * **X (Twitter):** Content is optimized for the 280-character limit, including smart hashtag generation.
  * **LinkedIn:** Professional format with detailed project information and career-focused insights.
  * **Facebook:** Engaging and descriptive content for broader audience reach.
  * **Discord:** Developer-friendly markdown formatting for clean, readable posts in coding communities.

-----

📁 **Project Structure**

```
src/
├── components/
│   ├── auth/           # Authentication forms, pages, and protected routes
│   ├── projects/       # Components for project creation, listing, and editing
│   ├── profile/        # User profile management components
│   ├── github/         # GitHub import wizard and related UI
│   ├── sharing/        # Modals and components for social media sharing
│   └── ui/             # Reusable ShadCN UI components (buttons, cards, etc.)
├── hooks/              # Custom React hooks (e.g., useAuth)
├── lib/                # Utility functions (cn, supabase client, GitHub API service)
├── services/           # Backend interaction services (AuthService, GitHubCommitsService, SocialContentOptimizer)
├── store/              # Redux Toolkit store, slices (auth, projects, ui, github, sharing)
├── pages/              # Top-level page components (SignInPage, SignUpPage, Dashboard)
└── App.jsx             # Main application router and layout
```

-----

🤝 **Contributing**

We welcome contributions from the ALX community and beyond\! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and ensure the code adheres to existing style.
4.  Add tests for new features or bug fixes, if applicable.
5.  Commit your changes with a clear and concise commit message.
6.  Submit a Pull Request to the `main` branch.

-----

🔐 **Environment Variables**

Ensure these environment variables are configured in your `.env.local` file:

| Variable                  | Description                          | Required        |
| :------------------------ | :----------------------------------- | :-------------- |
| `VITE_SUPABASE_URL`       | Your Supabase project URL            | ✅              |
| `VITE_SUPABASE_ANON_KEY`  | Your Supabase anonymous key          | ✅              |
| `VITE_GITHUB_TOKEN`       | Your GitHub Personal Access Token (for API calls) | ⚠️ (Highly Recommended) |

-----

🚀 **Deployment**

Your ALX Student Showcase is designed for easy deployment to popular hosting platforms\!

### Quick Deploy (2 minutes)

1.  **Prepare for deployment:**

    ```bash
    ./deploy.sh # Automated script to prepare build artifacts and configurations
    ```

2.  **Choose your platform:**

      * **Option A: Vercel (Recommended)**

          * Push your code to a GitHub repository.
          * Import your project at [vercel.com](https://vercel.com/).
          * Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GITHUB_TOKEN`) in Vercel settings.
          * Deploy\! ✨ Your app will be live in moments.

      * **Option B: Netlify**

          * Push to GitHub or simply drag & drop your `dist` folder.
          * Configure your build settings at [netlify.com](https://www.netlify.com/).
          * Goes live instantly\! 🚀

### Deployment Files Included

The repository includes pre-configured files for various deployment strategies:

  * ✅ `vercel.json` - Vercel deployment configuration
  * ✅ `netlify.toml` - Netlify build and deployment configuration
  * ✅ `public/_redirects` - SPA routing rules for Netlify
  * ✅ `Dockerfile` - For containerized deployments (e.g., Docker, Kubernetes)
  * ✅ `.github/workflows/deploy.yml` - Basic CI/CD pipeline for GitHub Actions
  * ✅ `deploy.sh` - An automated script to streamline deployment preparation

### Build Stats

  * **Optimized Build Size:** \~576KB
  * **Fast Load Time:** \<2s on fast connections
  * **High Performance:** Optimized for production environments

-----

📖 **Detailed Instructions:** For a comprehensive guide on deployment, refer to `DEPLOYMENT.md`.

⚡ **Quick Start:** For 1-click deployment options, see `QUICK-DEPLOY.md`.

-----

💬 **Support & Community**

  * **Issues:** Report any bugs, suggest features, or ask questions via GitHub Issues.
  * **Discussions:** Join our community discussions on the GitHub Discussions tab.
  * **ALX Community:** Feel free to share your showcased projects with fellow ALX students and inspire others\!

-----

📄 **License**

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

-----

🙏 **Acknowledgments**

  * Built with passion and dedication.
  * Powered by Supabase and modern web technologies.
  * UI components from shadcn/ui.

-----

Happy Coding\! 🎉

-----

Copyright © 2025 ***Immanuel Eshun Quansah***. All rights reserved.
