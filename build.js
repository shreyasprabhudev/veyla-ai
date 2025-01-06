const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Build both projects
console.log('Building landing...');
execSync('cd packages/landing && npm run build', { stdio: 'inherit' });

console.log('Building dashboard...');
execSync('cd packages/dashboard && npm run build', { stdio: 'inherit' });

// Create dist directory
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Helper function to copy Next.js build output
function copyNextOutput(sourcePath, targetPath) {
  // Copy the entire .next directory
  fs.copySync(sourcePath, targetPath, {
    filter: (src) => {
      // Skip cache directories
      return !src.includes('cache');
    }
  });
}

// Copy landing build
console.log('Copying landing build...');
copyNextOutput(
  path.join(__dirname, 'packages/landing/.next'),
  path.join(distDir, '.next')
);

// Copy landing public files
const landingPublicDir = path.join(__dirname, 'packages/landing/public');
if (fs.existsSync(landingPublicDir)) {
  fs.copySync(landingPublicDir, distDir);
}

// Copy dashboard build
console.log('Copying dashboard build...');
const dashboardDist = path.join(distDir, 'dashboard');
fs.ensureDirSync(dashboardDist);

copyNextOutput(
  path.join(__dirname, 'packages/dashboard/.next'),
  path.join(dashboardDist, '.next')
);

// Copy dashboard public files
const dashboardPublicDir = path.join(__dirname, 'packages/dashboard/public');
if (fs.existsSync(dashboardPublicDir)) {
  fs.copySync(dashboardPublicDir, dashboardDist);
}

// Copy package.json files for runtime configuration
fs.copySync(
  path.join(__dirname, 'packages/landing/package.json'),
  path.join(distDir, 'package.json')
);

fs.copySync(
  path.join(__dirname, 'packages/dashboard/package.json'),
  path.join(dashboardDist, 'package.json')
);

console.log('Build complete!');
