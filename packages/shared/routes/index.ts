export const routes = {
  // Public routes
  home: '/',
  dashboard: '/dashboard',
  
  // External routes
  landing: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  app: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001',
} as const;

// Routes that don't require authentication
export const publicPaths = new Set([
  routes.home,
  '/_next',
  '/api',
  '/static',
  '/favicon.ico',
]);

// Static paths that should bypass middleware
export const staticPaths = new Set([
  '/_next',
  '/api',
  '/static',
  '/favicon.ico',
]);
