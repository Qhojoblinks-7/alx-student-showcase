-- =====================================================
-- ALX Student Showcase - Complete Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor to set up the complete database
-- =====================================================

-- Clean up existing objects (if any)
-- =====================================================
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_updated_at_users ON public.users CASCADE;
DROP TRIGGER IF EXISTS handle_updated_at_projects ON public.projects CASCADE;

-- Drop existing tables (if any)
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- Enable Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Create Tables
-- =====================================================

-- Users Table (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  alx_id TEXT UNIQUE,
  github_username TEXT,
  linkedin_url TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
-- =====================================================
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  category TEXT CHECK (category IN ('web', 'mobile', 'data', 'ai', 'backend', 'devops', 'other')) NOT NULL DEFAULT 'other',
  original_repo_name TEXT, -- For GitHub imported projects
  alx_confidence DECIMAL(3,2), -- ALX detection confidence (0.00-1.00)
  last_updated TIMESTAMP WITH TIME ZONE, -- Last GitHub update
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges Table
-- =====================================================
CREATE TABLE public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Create Indexes for Performance
-- =====================================================

-- Users table indexes
CREATE INDEX users_email_idx ON public.users(email);
CREATE INDEX users_alx_id_idx ON public.users(alx_id);
CREATE INDEX users_github_username_idx ON public.users(github_username);

-- Projects table indexes
CREATE INDEX projects_user_id_idx ON public.projects(user_id);
CREATE INDEX projects_is_public_idx ON public.projects(is_public);
CREATE INDEX projects_category_idx ON public.projects(category);
CREATE INDEX projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX projects_alx_confidence_idx ON public.projects(alx_confidence);
CREATE INDEX projects_technologies_idx ON public.projects USING GIN(technologies);

-- Badges table indexes
CREATE INDEX badges_user_id_idx ON public.badges(user_id);
CREATE INDEX badges_name_idx ON public.badges(name);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Create RLS Policies
-- =====================================================

-- Users Table Policies
-- =====================================================
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects Table Policies
-- =====================================================
CREATE POLICY "Users can view public projects" ON public.projects
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Badges Table Policies
-- =====================================================
CREATE POLICY "Users can view their own badges" ON public.badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges" ON public.badges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badges" ON public.badges
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Create Functions
-- =====================================================

-- Function to handle new user creation
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Create Triggers
-- =====================================================

-- Trigger to automatically create user profile
-- =====================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers for updated_at timestamps
-- =====================================================
CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =====================================================
-- Create Views for Common Queries
-- =====================================================

-- View for public projects with user info
-- =====================================================
CREATE OR REPLACE VIEW public.public_projects_view AS
SELECT 
  p.id,
  p.title,
  p.description,
  p.technologies,
  p.github_url,
  p.live_url,
  p.category,
  p.alx_confidence,
  p.created_at,
  u.full_name,
  u.github_username,
  u.avatar_url
FROM public.projects p
JOIN public.users u ON p.user_id = u.id
WHERE p.is_public = true
ORDER BY p.created_at DESC;

-- View for user statistics
-- =====================================================
CREATE OR REPLACE VIEW public.user_stats_view AS
SELECT 
  u.id,
  u.full_name,
  u.github_username,
  COUNT(p.id) as total_projects,
  COUNT(CASE WHEN p.is_public = true THEN 1 END) as public_projects,
  COUNT(CASE WHEN p.category = 'web' THEN 1 END) as web_projects,
  COUNT(CASE WHEN p.category = 'mobile' THEN 1 END) as mobile_projects,
  COUNT(CASE WHEN p.category = 'data' THEN 1 END) as data_projects,
  COUNT(CASE WHEN p.category = 'ai' THEN 1 END) as ai_projects,
  COUNT(CASE WHEN p.category = 'backend' THEN 1 END) as backend_projects,
  COUNT(CASE WHEN p.category = 'devops' THEN 1 END) as devops_projects,
  COUNT(b.id) as total_badges
FROM public.users u
LEFT JOIN public.projects p ON u.id = p.user_id
LEFT JOIN public.badges b ON u.id = b.user_id
GROUP BY u.id, u.full_name, u.github_username;

-- =====================================================
-- Create Helper Functions
-- =====================================================

-- Function to get user's projects
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_projects(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  technologies TEXT[],
  github_url TEXT,
  live_url TEXT,
  category TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.technologies,
    p.github_url,
    p.live_url,
    p.category,
    p.is_public,
    p.created_at
  FROM public.projects p
  WHERE p.user_id = user_uuid
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search projects
-- =====================================================
CREATE OR REPLACE FUNCTION public.search_projects(search_term TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  technologies TEXT[],
  category TEXT,
  full_name TEXT,
  github_username TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.technologies,
    p.category,
    u.full_name,
    u.github_username
  FROM public.projects p
  JOIN public.users u ON p.user_id = u.id
  WHERE p.is_public = true
    AND (
      p.title ILIKE '%' || search_term || '%'
      OR p.description ILIKE '%' || search_term || '%'
      OR p.technologies::text ILIKE '%' || search_term || '%'
      OR u.full_name ILIKE '%' || search_term || '%'
    )
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Insert Sample Data (Optional)
-- =====================================================

-- Sample badges (uncomment to add)
/*
INSERT INTO public.badges (user_id, name, description, icon) VALUES
('00000000-0000-0000-0000-000000000001', 'First Project', 'Completed your first project', '🎯'),
('00000000-0000-0000-0000-000000000001', 'Web Developer', 'Built 5 web projects', '🌐'),
('00000000-0000-0000-0000-000000000001', 'Open Source', 'Contributed to open source', '📦');
*/

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if tables were created successfully
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if RLS policies were created
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check if triggers were created
-- SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Check if indexes were created
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- =====================================================
-- Database Schema Complete!
-- =====================================================
-- 
-- Next steps:
-- 1. Set up environment variables in your application
-- 2. Test the database connection
-- 3. Verify authentication works
-- 4. Test CRUD operations
-- 
-- Environment variables needed:
-- VITE_SUPABASE_URL=https://your-project-id.supabase.co
-- VITE_SUPABASE_ANON_KEY=your-anon-key-here
-- =====================================================