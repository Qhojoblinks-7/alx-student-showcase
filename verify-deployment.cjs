// Pre-deployment verification script
console.log('🔍 Verifying deployment readiness...\n');

// Check if build works
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let success = true;

// 1. Check package.json
console.log('✅ Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.scripts.build) {
  console.log('❌ Missing build script');
  success = false;
} else {
  console.log('✅ Build script found');
}

// 2. Check environment template
console.log('✅ Checking environment template...');
if (fs.existsSync('.env.local.example')) {
  console.log('✅ Environment template exists');
} else {
  console.log('❌ Missing .env.local.example');
  success = false;
}

// 3. Check vercel.json
console.log('✅ Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json found');
} else {
  console.log('❌ Missing vercel.json');
  success = false;
}

// 4. Check main files
console.log('✅ Checking main application files...');
const requiredFiles = [
  'src/main.jsx',
  'src/App.jsx',
  'src/components/Dashboard.jsx',
  'src/components/auth/ProtectedRoute.jsx'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ Missing ${file}`);
    success = false;
  }
});

// 5. Test build
console.log('✅ Testing build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
  console.log(error.stdout?.toString());
  success = false;
}

console.log('\n' + '='.repeat(50));
if (success) {
  console.log('🎉 All checks passed! Ready for Vercel deployment.');
  console.log('\nNext steps:');
  console.log('1. Push to GitHub: git add . && git commit -m "Ready for deployment" && git push');
  console.log('2. Go to vercel.com and import your repository');
  console.log('3. Add environment variables in Vercel dashboard');
  console.log('4. Deploy! 🚀');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
}
console.log('='.repeat(50));