const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Build landing
console.log('Building landing...');
execSync('cd packages/landing && npm run build', { stdio: 'inherit' });

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

console.log('Build complete!');
