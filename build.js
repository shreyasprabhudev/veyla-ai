const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Build landing
console.log('Building landing...');
execSync('cd packages/landing && npm run build', { stdio: 'inherit' });

// Build dashboard
console.log('Building dashboard...');
execSync('cd packages/dashboard && npm run build', { stdio: 'inherit' });

// Copy landing build
console.log('Copying landing build...');
fs.copySync(
  path.join(__dirname, 'packages/landing/.next/static'),
  path.join(distDir, '_next/static')
);

// Copy landing HTML files
fs.copySync(
  path.join(__dirname, 'packages/landing/out'),
  distDir
);

// Copy landing public files if they exist
const landingPublicDir = path.join(__dirname, 'packages/landing/public');
if (fs.existsSync(landingPublicDir)) {
  fs.copySync(landingPublicDir, distDir);
}

// Copy dashboard build
console.log('Copying dashboard build...');
fs.copySync(
  path.join(__dirname, 'packages/dashboard/.next/static'),
  path.join(distDir, 'dashboard/_next/static')
);

// Copy dashboard HTML files
fs.copySync(
  path.join(__dirname, 'packages/dashboard/out'),
  path.join(distDir, 'dashboard')
);

// Copy dashboard public files if they exist
const dashboardPublicDir = path.join(__dirname, 'packages/dashboard/public');
if (fs.existsSync(dashboardPublicDir)) {
  fs.copySync(dashboardPublicDir, path.join(distDir, 'dashboard'));
}

console.log('Build complete!');
