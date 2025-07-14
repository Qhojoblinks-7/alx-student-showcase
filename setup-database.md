# Database Setup and Troubleshooting Guide

## Current Issues Identified:

### 1. **Missing Supabase Configuration**
- Environment variables not set
- No actual Supabase project created
- Database schema not initialized

### 2. **Database Schema Issues**
- Tables `users` and `projects` don't exist
- Missing RLS policies
- Missing triggers for user creation

### 3. **Authentication Issues**
- No automatic user profile creation
- Missing auth state management

## Step-by-Step Solution:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down the Project URL and anon key

### Step 2: Set Environment Variables
Create `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Initialize Database Schema
Run the SQL from `supabase-schema.txt` in Supabase SQL Editor

### Step 4: Test Database Connection
Use the test script: `node test-db.js`

## Common Database Errors and Solutions:

### Error: "Missing Supabase environment variables"
**Solution**: Set up `.env.local` file with proper credentials

### Error: "Table 'users' does not exist"
**Solution**: Run the database schema SQL

### Error: "RLS policy violation"
**Solution**: Ensure RLS policies are created and user is authenticated

### Error: "Invalid API key"
**Solution**: Use the correct anon key, not service role key

## Testing Database Connectivity:

1. **Basic Connection Test**:
   ```javascript
   const { data, error } = await supabase.auth.getSession()
   ```

2. **Database Query Test**:
   ```javascript
   const { data, error } = await supabase
     .from('users')
     .select('*')
     .limit(1)
   ```

3. **Authentication Test**:
   ```javascript
   const { data, error } = await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'password123'
   })
   ```

## Monitoring Database Health:

### Check Tables Exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check RLS Policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Triggers:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## Performance Optimization:

1. **Indexes**: Ensure proper indexes on frequently queried columns
2. **RLS**: Optimize RLS policies for better performance
3. **Connection Pooling**: Use connection pooling in production
4. **Caching**: Implement client-side caching for frequently accessed data

## Security Best Practices:

1. **Never expose service role key in client**
2. **Use RLS policies for data protection**
3. **Validate all user inputs**
4. **Implement proper error handling**
5. **Use HTTPS in production**

## Troubleshooting Checklist:

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database schema executed
- [ ] RLS policies created
- [ ] Triggers installed
- [ ] Authentication providers configured
- [ ] Test user created
- [ ] Basic CRUD operations working
- [ ] Error handling implemented
- [ ] Performance optimized