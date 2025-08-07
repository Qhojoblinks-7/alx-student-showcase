# 🆓 FREE SETUP GUIDE - ALX Student Showcase

This guide will help you set up the ALX Student Showcase application using **100% FREE services**. Perfect for personal projects and learning!

## 🎯 Quick Start (5 minutes)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd alx-student-showcase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB Atlas (FREE)**
   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create free account
   - Create new cluster (FREE tier - 512MB)
   - Get connection string

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB connection string
   ```

5. **Initialize database**
   ```bash
   npm run db:init
   ```

6. **Start development**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup (FREE)

### Option 1: MongoDB Atlas (Recommended)
**FREE: 512MB storage, shared clusters**

1. **Sign up**: Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create account**: Use your email
3. **Create cluster**: Choose FREE tier
4. **Set up database access**:
   - Create database user
   - Set username and password
5. **Set up network access**:
   - Allow access from anywhere (0.0.0.0/0)
6. **Get connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/alx-showcase
   ```

### Option 2: Local MongoDB (FREE)
**FREE: Unlimited storage, local installation**

1. **Install MongoDB**:
   - [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - [Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)
2. **Start MongoDB service**
3. **Use connection string**: `mongodb://localhost:27017`

## 📧 Email Services (FREE)

### Option 1: Console Logging (Development)
**FREE: No setup required**

For development, emails are logged to console:
```javascript
// In .env.local
VITE_EMAIL_SERVICE=console
```

### Option 2: Gmail SMTP (Personal Use)
**FREE: Unlimited emails for personal use**

1. **Enable 2-factor authentication** on your Gmail
2. **Generate app password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Configure in .env.local**:
   ```env
   VITE_EMAIL_SERVICE=gmail
   VITE_GMAIL_USER=your-email@gmail.com
   VITE_GMAIL_PASSWORD=your-app-password
   ```

### Option 3: Mailgun (Production)
**FREE: 5,000 emails/month**

1. **Sign up**: [mailgun.com](https://mailgun.com)
2. **Verify domain** or use sandbox domain
3. **Get API key** from dashboard
4. **Configure in .env.local**:
   ```env
   VITE_EMAIL_SERVICE=mailgun
   VITE_MAILGUN_API_KEY=your-api-key
   VITE_MAILGUN_DOMAIN=your-domain.com
   ```

### Option 4: SendGrid (Production)
**FREE: 100 emails/day**

1. **Sign up**: [sendgrid.com](https://sendgrid.com)
2. **Verify email address**
3. **Get API key** from dashboard
4. **Configure in .env.local**:
   ```env
   VITE_EMAIL_SERVICE=sendgrid
   VITE_SENDGRID_API_KEY=your-api-key
   ```

### Option 5: Resend (Production)
**FREE: 3,000 emails/month**

1. **Sign up**: [resend.com](https://resend.com)
2. **Verify domain**
3. **Get API key** from dashboard
4. **Configure in .env.local**:
   ```env
   VITE_EMAIL_SERVICE=resend
   VITE_RESEND_API_KEY=your-api-key
   ```

## 🔐 GitHub OAuth (FREE)

**FREE: Unlimited OAuth apps**

1. **Go to GitHub Settings**: [github.com/settings/developers](https://github.com/settings/developers)
2. **Create OAuth App**:
   - Application name: "ALX Student Showcase"
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/github/callback`
3. **Get credentials**:
   - Client ID
   - Client Secret
4. **Configure in .env.local**:
   ```env
   VITE_GITHUB_CLIENT_ID=your-client-id
   VITE_GITHUB_CLIENT_SECRET=your-client-secret
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
   ```

## 💾 File Storage (FREE)

### Option 1: Cloudinary (Recommended)
**FREE: 25GB storage, 25GB bandwidth/month**

1. **Sign up**: [cloudinary.com](https://cloudinary.com)
2. **Get credentials** from dashboard
3. **Configure in .env.local**:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_API_KEY=your-api-key
   VITE_CLOUDINARY_API_SECRET=your-api-secret
   ```

### Option 2: Firebase Storage
**FREE: 5GB storage, 1GB download/day**

1. **Create Firebase project**: [firebase.google.com](https://firebase.google.com)
2. **Enable Storage**
3. **Get config** from project settings
4. **Configure in .env.local**:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   ```

### Option 3: AWS S3
**FREE: 5GB storage, 20,000 GET requests/month**

1. **Create AWS account**
2. **Create S3 bucket**
3. **Create IAM user** with S3 access
4. **Configure in .env.local**:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_BUCKET_NAME=your-bucket-name
   VITE_AWS_ACCESS_KEY_ID=your-access-key
   VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

## 🚀 Hosting (FREE)

### Option 1: Vercel (Recommended)
**FREE: Unlimited deployments**

1. **Sign up**: [vercel.com](https://vercel.com)
2. **Connect GitHub repository**
3. **Deploy automatically**

### Option 2: Netlify
**FREE: Unlimited deployments**

1. **Sign up**: [netlify.com](https://netlify.com)
2. **Connect GitHub repository**
3. **Deploy automatically**

### Option 3: GitHub Pages
**FREE: Unlimited hosting**

1. **Enable GitHub Pages** in repository settings
2. **Set source** to GitHub Actions
3. **Deploy automatically**

### Option 4: Render
**FREE: 750 hours/month**

1. **Sign up**: [render.com](https://render.com)
2. **Create new Web Service**
3. **Connect GitHub repository**

### Option 5: Railway
**FREE: 500 hours/month**

1. **Sign up**: [railway.app](https://railway.app)
2. **Create new project**
3. **Connect GitHub repository**

## 🔧 Environment Configuration

### Complete .env.local Example
```env
# MongoDB (FREE)
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alx-showcase
VITE_MONGODB_DB_NAME=alx-showcase

# JWT (FREE)
VITE_JWT_SECRET=your-super-secret-jwt-key-here

# GitHub OAuth (FREE)
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CLIENT_SECRET=your-github-client-secret
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback

# Email Service (FREE - Choose one)
VITE_EMAIL_SERVICE=console
# VITE_EMAIL_SERVICE=gmail
# VITE_GMAIL_USER=your-email@gmail.com
# VITE_GMAIL_PASSWORD=your-app-password

# File Storage (FREE - Choose one)
# VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
# VITE_CLOUDINARY_API_KEY=your-api-key
# VITE_CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
VITE_APP_NAME=ALX Student Showcase
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

## 📱 Development Workflow

### 1. Local Development
```bash
# Start development server
npm run dev

# Initialize database
npm run db:init

# Build for production
npm run build
```

### 2. Database Management
```bash
# Initialize database with sample data
npm run db:init

# View database setup guide
npm run db:setup
```

### 3. Email Testing
- Emails are logged to console in development
- Check browser console for email URLs
- Use real email service for production

## 🎯 Production Deployment

### 1. Prepare for Production
```bash
# Build the application
npm run build

# Set production environment variables
# Update VITE_APP_URL to your domain
# Configure real email service
# Set up file storage
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 3. Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Set environment variables in Netlify dashboard
```

## 💡 Tips for Free Tier Usage

### MongoDB Atlas
- **512MB storage** is plenty for personal projects
- **Shared clusters** are perfect for development
- **Backup** your data regularly

### Email Services
- **Console logging** for development
- **Gmail SMTP** for personal projects
- **Mailgun/SendGrid** for production

### File Storage
- **Cloudinary** is the most generous free tier
- **Compress images** before upload
- **Use CDN** for better performance

### Hosting
- **Vercel/Netlify** are the easiest to use
- **GitHub Pages** for static hosting
- **Render/Railway** for full-stack apps

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access settings
   - Ensure database user exists

2. **GitHub OAuth Not Working**
   - Verify callback URL
   - Check client ID and secret
   - Ensure OAuth app is configured correctly

3. **Email Not Sending**
   - Check email service configuration
   - Verify API keys
   - Check console for errors

4. **File Upload Failed**
   - Verify storage service credentials
   - Check file size limits
   - Ensure proper CORS configuration

### Getting Help

1. **Check console logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Test services individually** to isolate issues
4. **Use free tier limits** as a guide for troubleshooting

## 🎉 Success!

Once you've completed this setup, you'll have:

✅ **FREE MongoDB database** with 512MB storage  
✅ **FREE email service** for notifications  
✅ **FREE GitHub OAuth** for authentication  
✅ **FREE file storage** for uploads  
✅ **FREE hosting** for deployment  
✅ **Real-time updates** with polling  
✅ **Advanced features** without cost  

Your ALX Student Showcase application is now running on **100% FREE services**! 🚀

---

**Remember**: All these services have generous free tiers that are perfect for personal projects and learning. You can always upgrade to paid plans when your project grows! 💪