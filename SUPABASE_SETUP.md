# Supabase Setup Guide

This guide will walk you through setting up Supabase for the ALX Student Showcase application.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub or email
3. Once logged in, click "New Project"

## Step 2: Create a New Project

1. Choose your organization (or create one)
2. Enter project details:
   - **Name**: ALX Student Showcase (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
3. Click "Create new project"
4. Wait for the project to be created (2-3 minutes)

## Step 3: Get Your API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 4: Set Up Environment Variables

1. In your project root, copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 5: Set Up the Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `supabase-schema.txt`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- User profiles table with ALX-specific fields
- Projects table for documenting student work
- Row Level Security (RLS) policies for data protection
- Triggers for automatic profile creation

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Scroll down to **Auth Providers**
3. Enable the providers you want:
   - **Google**: Follow the setup guide for Google OAuth
   - **GitHub**: Follow the setup guide for GitHub OAuth
   - **Email**: Already enabled by default

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the app
3. Try signing up with email or social providers
4. Check that your user appears in the **Authentication** → **Users** section

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Double-check your environment variables
   - Make sure you're using the `anon/public` key, not the `service_role` key
   - Restart your development server after changing `.env.local`

2. **Database connection issues**:
   - Ensure the SQL schema was executed successfully
   - Check for any error messages in the SQL Editor

3. **Authentication not working**:
   - Verify your redirect URLs in the auth provider settings
   - For local development, add `http://localhost:5173` to allowed redirect URLs

### Environment Variables Not Loading:

Make sure your `.env.local` file is in the project root (same level as `package.json`) and restart your development server.

### Database Schema Errors:

If you encounter errors running the schema:
1. Try running it in smaller chunks
2. Check the Supabase logs in the dashboard
3. Ensure you have the necessary permissions

## Security Notes

- Never commit your `.env.local` file to version control
- The `anon/public` key is safe to use in client-side code
- Row Level Security policies protect your data
- Always use HTTPS in production

## Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the Supabase Discord community
- Review the [authentication guides](https://supabase.com/docs/guides/auth)