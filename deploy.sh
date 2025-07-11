#!/bin/bash

# ALX Student Showcase - Deployment Script
echo "🚀 Starting deployment preparation for ALX Student Showcase..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found. Creating template..."
    cat > .env.local << 'ENVEOF'
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
ENVEOF
    print_warning "Please update .env.local with your Supabase credentials before deploying."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Run linting
print_status "Running code linting..."
npm run lint
if [ $? -eq 0 ]; then
    print_success "Code linting passed"
else
    print_warning "Linting issues found, but continuing..."
fi

# Build the project
print_status "Building project for production..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check build output
if [ -d "dist" ]; then
    print_success "Build output directory created"
    BUILD_SIZE=$(du -sh dist | cut -f1)
    print_status "Build size: $BUILD_SIZE"
else
    print_error "Build directory not found"
    exit 1
fi

echo ""
print_success "🎉 Deployment preparation complete!"
echo ""
print_status "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Commit your code to GitHub"
echo "3. Choose a deployment platform:"
echo "   • Vercel (Recommended): https://vercel.com"
echo "   • Netlify: https://netlify.com"
echo "   • GitHub Pages: Follow instructions in DEPLOYMENT.md"
echo ""
print_status "For detailed deployment instructions, see DEPLOYMENT.md"
echo ""
print_success "Happy deploying! 🚀"
