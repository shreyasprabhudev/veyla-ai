const { execSync } = require('child_process');

// Build landing
console.log('Building landing...');
execSync('cd packages/landing && npm run build', { stdio: 'inherit' });

console.log('Build complete!');
