# 🚀 Deploy to Vercel - Step by Step Guide

## 📋 Prerequisites Checklist

Before we start, make sure you have:
- ✅ Fixed npm installation working locally
- ✅ GitHub account
- ✅ Supabase account and project (we'll set this up if needed)
- ✅ Your project code ready

---

## 🔧 Step 1: Set Up Supabase (If Not Done)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `alx-student-showcase`
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your users
5. Click **"Create new project"** (takes 1-2 minutes)

### Set Up Database
1. Once project is ready, go to **SQL Editor** in sidebar
2. Copy the contents from `supabase-schema.txt` in your project
3. Paste into SQL Editor and click **"Run"**
4. Verify tables created: Go to **Table Editor** → Should see `users` and `projects` tables

### Get API Keys
1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://your-project.supabase.co`
   - **Project API Keys** → **anon public**: `eyJ...`

---

## 📦 Step 2: Push Code to GitHub

### Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click **"New repository"** (green button)
3. Repository settings:
   - **Repository name**: `alx-student-showcase`
   - **Description**: `ALX Student Showcase - Share your coding journey`
   - **Public** or **Private** (your choice)
   - ❌ Don't initialize with README (we have files already)
4. Click **"Create repository"**

### Upload Your Code
In your project folder, run these commands:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - ALX Student Showcase ready for deployment"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/alx-student-showcase.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**✅ Verify**: Refresh your GitHub repository page - you should see all your files uploaded.

---

## 🌐 Step 3: Deploy to Vercel

### Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your repositories

### Import Your Project
1. On Vercel dashboard, click **"New Project"**
2. You'll see your GitHub repositories listed
3. Find `alx-student-showcase` and click **"Import"**

### Configure Project Settings
1. **Project Name**: `alx-student-showcase` (or customize)
2. **Framework Preset**: Should auto-detect as **"Vite"** ✅
3. **Root Directory**: Leave as `./`
4. **Build Settings**: Should auto-populate:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Add Environment Variables
This is the **most important step**!

1. Scroll down to **"Environment Variables"** section
2. Add these variables one by one:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase Project URL (from Step 1)
   - **Environment**: All (Production, Preview, Development)

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key (from Step 1)
   - **Environment**: All (Production, Preview, Development)

3. Click **"Add"** after each variable

### Deploy!
1. Click **"Deploy"** button
2. ⏱️ Wait 2-3 minutes for deployment
3. 🎉 You'll see "Congratulations!" when complete

---

## ✅ Step 4: Verify Deployment

### Test Your Live App
1. Click **"Visit"** button or copy the provided URL
2. Your app should load at: `https://alx-student-showcase-xxx.vercel.app`

### Test Core Features
- ✅ **Homepage loads** without errors
- ✅ **Sign Up/Login works** (try Google/GitHub auth)
- ✅ **Profile page** accessible after login
- ✅ **Add project** functionality works
- ✅ **Share project** modal opens and generates content

### Check for Issues
If something doesn't work:
1. Go to Vercel dashboard → Your project → **"Functions"** tab
2. Check for any error logs
3. Verify environment variables are set correctly

---

## 🌟 Step 5: Optional Enhancements

### Custom Domain (Optional)
1. In Vercel dashboard → Your project → **"Settings"** → **"Domains"**
2. Click **"Add"** and enter your domain
3. Follow DNS configuration instructions
4. SSL certificate will be automatically provisioned

### Automatic Deployments
- ✅ Already set up! Every git push to `main` branch will auto-deploy
- Preview deployments created for pull requests

### Performance Monitoring
1. Go to **"Analytics"** tab in your Vercel project
2. Monitor visitor stats, performance metrics
3. Set up alerts for downtime (optional)

---

## 🆘 Troubleshooting

### Common Issues & Solutions

**❌ Build Failed**
- Check build logs in Vercel dashboard
- Verify all dependencies install correctly
- Ensure environment variables are set

**❌ App Loads but Login Doesn't Work**
- Double-check Supabase environment variables
- Verify Supabase project is active
- Check browser console for error messages

**❌ 404 Errors on Page Refresh**
- Already fixed! Your `vercel.json` handles SPA routing

**❌ Supabase Connection Issues**
- Verify URL and API key are correct
- Check Supabase project status
- Ensure RLS policies are properly set

### Getting Help
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Project Issues**: Check GitHub repository issues

---

## 🎉 Success! Your App is Live!

### Share Your Achievement
Your ALX Student Showcase is now live at:
```
https://alx-student-showcase-[your-id].vercel.app
```

### Next Steps
1. **Test thoroughly** with real data
2. **Share with ALX community** and get feedback
3. **Add projects** and start showcasing your work
4. **Customize design** to make it uniquely yours
5. **Monitor usage** through Vercel analytics

**🚀 Congratulations! You've successfully deployed your first production React app!** 

*Time to start showcasing your ALX journey to the world!* 🌟