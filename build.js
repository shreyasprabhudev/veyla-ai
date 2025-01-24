const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Clean up any existing dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.removeSync(distDir);
}
fs.ensureDirSync(distDir);

// Build landing
console.log('Building landing package...');
try {
  execSync('cd packages/landing && npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building landing package:', error);
  process.exit(1);
}

// Copy the entire out directory
console.log('Copying build output to dist...');
const outDir = path.join(__dirname, 'packages/landing/out');
if (!fs.existsSync(outDir)) {
  throw new Error('Next.js build output directory not found at: ' + outDir);
}

try {
  fs.copySync(outDir, distDir);
  console.log('Build complete! Output directory:', distDir);
} catch (error) {
  console.error('Error copying build output:', error);
  process.exit(1);
}
