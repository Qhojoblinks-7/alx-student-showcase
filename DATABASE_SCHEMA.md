# 🗄️ Database Schema Documentation

## Overview
The ALX Student Showcase uses Supabase as the backend database with PostgreSQL. The schema is designed to support user profiles, project management, and social features with proper security through Row Level Security (RLS).

## 📊 Database Tables

### 1. Users Table
**Purpose**: Stores user profiles and authentication data
**Location**: `public.users`

```sql
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
```

**Fields**:
- `id`: UUID (references auth.users)
- `email`: User's email address
- `full_name`: User's full name
- `alx_id`: ALX student identifier
- `github_username`: GitHub username
- `linkedin_url`: LinkedIn profile URL
- `bio`: User biography
- `avatar_url`: Profile picture URL
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### 2. Projects Table
**Purpose**: Stores user projects and portfolio items
**Location**: `public.projects`

```sql
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  category TEXT CHECK (category IN ('web', 'mobile', 'data', 'ai', 'backend', 'devops', 'other')) NOT NULL DEFAULT 'other',
  original_repo_name TEXT,
  alx_confidence DECIMAL(3,2),
  last_updated TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique project identifier
- `user_id`: Owner of the project
- `title`: Project title
- `description`: Project description
- `technologies`: Array of technologies used
- `github_url`: GitHub repository URL
- `live_url`: Live demo URL
- `category`: Project category (web, mobile, data, ai, backend, devops, other)
- `original_repo_name`: Original GitHub repository name
- `alx_confidence`: ALX project detection confidence (0.00-1.00)
- `last_updated`: Last GitHub update timestamp
- `is_public`: Public visibility flag
- `created_at`: Project creation timestamp
- `updated_at`: Last update timestamp

### 3. Badges Table
**Purpose**: Stores user achievements and badges
**Location**: `public.badges`

```sql
CREATE TABLE badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique badge identifier
- `user_id`: User who earned the badge
- `name`: Badge name
- `description`: Badge description
- `icon`: Badge icon identifier
- `created_at`: Badge award timestamp

## 🔐 Security & Access Control

### Row Level Security (RLS)
All tables have RLS enabled for data protection.

#### Users Table Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Projects Table Policies
```sql
-- Users can view public projects
CREATE POLICY "Users can view public projects" ON public.projects
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Users can view their own projects
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);
```

## 🔄 Triggers & Functions

### Automatic User Profile Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Automatic Timestamp Updates
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

## 📈 Performance Indexes

```sql
-- Projects table indexes
CREATE INDEX projects_user_id_idx ON public.projects(user_id);
CREATE INDEX projects_is_public_idx ON public.projects(is_public);
CREATE INDEX projects_category_idx ON public.projects(category);
CREATE INDEX projects_created_at_idx ON public.projects(created_at DESC);
CREATE INDEX projects_alx_confidence_idx ON public.projects(alx_confidence);
```

## 🚀 Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the Project URL and anon key

### 2. Set Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Initialize Database
Run the complete schema from `supabase-schema.txt` in Supabase SQL Editor.

### 4. Verify Setup
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 🔍 Common Queries

### Get User Profile
```sql
SELECT * FROM users WHERE id = auth.uid();
```

### Get User's Projects
```sql
SELECT * FROM projects 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### Get Public Projects
```sql
SELECT p.*, u.full_name, u.github_username 
FROM projects p 
JOIN users u ON p.user_id = u.id 
WHERE p.is_public = true 
ORDER BY p.created_at DESC;
```

### Get Projects by Category
```sql
SELECT * FROM projects 
WHERE category = 'web' AND is_public = true 
ORDER BY created_at DESC;
```

## 🛡️ Security Considerations

1. **Never expose service role key** in client-side code
2. **Use RLS policies** for data protection
3. **Validate all user inputs** before database operations
4. **Implement proper error handling** for database operations
5. **Use HTTPS** in production environments
6. **Regular security audits** of RLS policies

## 📊 Data Relationships

```
auth.users (1) ←→ (1) public.users
public.users (1) ←→ (N) public.projects
public.users (1) ←→ (N) public.badges
```

## 🔧 Maintenance

### Regular Tasks
- Monitor database performance
- Review and update RLS policies
- Backup data regularly
- Update indexes as needed
- Monitor for security vulnerabilities

### Performance Monitoring
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

**📝 Note**: This schema is optimized for the ALX Student Showcase application and includes all necessary security measures and performance optimizations for production use.