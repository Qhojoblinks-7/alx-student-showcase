# Deployment Guide - ALX Student Showcase

This guide covers multiple deployment options for your ALX Student Showcase application.

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase project set up with database tables
- ✅ Environment variables configured
- ✅ Project builds successfully (`npm run build`)

## Environment Variables Required

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Option 1: Vercel (Recommended)

**Why Vercel?** Perfect for React apps, excellent performance, easy setup, and free tier.

### Deploy Steps:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/alx-student-showcase.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Add environment variables in project settings
   - Deploy automatically!

3. **Custom Domain (Optional):**
   - Add your domain in Vercel dashboard
   - Update DNS settings as instructed

### Vercel Configuration:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## Option 2: Netlify

**Why Netlify?** Great for static sites, excellent CDN, form handling, and free tier.

### Deploy Steps:

1. **GitHub Integration:**
   - Push code to GitHub (same as above)
   - Go to [netlify.com](https://netlify.com)
   - Connect GitHub and select repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in site settings

3. **Deploy:**
   - Click "Deploy site"
   - Automatic deployments on git push

---

## Option 3: GitHub Pages (Free)

**Limitations:** Only static hosting, no server-side features.

### Deploy Steps:

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/alx-student-showcase",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## Option 4: Railway

**Why Railway?** Good for full-stack apps, database hosting, simple deployment.

### Deploy Steps:

1. **Connect Repository:**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository

2. **Environment Variables:**
   - Add your Supabase credentials
   - Set `PORT=3000` if needed

3. **Deploy:**
   - Automatic deployment from GitHub

---

## Option 5: Render

**Why Render?** Free tier, easy setup, good for static sites.

### Deploy Steps:

1. **Connect Repository:**
   - Go to [render.com](https://render.com)
   - Create new static site
   - Connect GitHub repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables:**
   - Add Supabase credentials in environment section

---

## Post-Deployment Checklist

After deploying, verify:

- ✅ Application loads correctly
- ✅ Authentication works (Supabase connection)
- ✅ Database operations function
- ✅ All routes work properly
- ✅ Environment variables are set
- ✅ HTTPS is enabled
- ✅ Custom domain configured (if applicable)

## Performance Optimization

Your app is already optimized with:
- Vite's production build
- Tree shaking
- Code splitting
- Asset optimization
- Tailwind CSS purging

## Troubleshooting

**Common Issues:**

1. **Environment Variables Not Working:**
   - Ensure variables start with `VITE_`
   - Restart build after adding variables

2. **Supabase Connection Issues:**
   - Verify URL and keys are correct
   - Check network policies in Supabase

3. **Build Failures:**
   - Run `npm run build` locally first
   - Check for missing dependencies
   - Verify all imports are correct

4. **Routing Issues:**
   - Configure platform for SPA routing
   - Add `_redirects` file for Netlify
   - Use `vercel.json` for Vercel

## Domain Setup

Once deployed, you can:
- Use the provided subdomain (e.g., `app-name.vercel.app`)
- Configure a custom domain through your hosting provider
- Set up SSL/HTTPS (usually automatic)

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics, Vercel Analytics)
- Performance monitoring
- Uptime monitoring

Your ALX Student Showcase is ready for the world! 🚀