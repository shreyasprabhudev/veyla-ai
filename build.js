const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);

// Build landing
console.log('Building landing...');
execSync('cd packages/landing && npm run build', { stdio: 'inherit' });

// Copy the entire out directory
console.log('Copying landing build...');
fs.copySync(
  path.join(__dirname, 'packages/landing/out'),
  distDir
);

console.log('Build complete!');
