import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const host = request.headers.get('host') || '';
  
  // Log the request details for debugging
  console.log('Health check request:', {
    userAgent,
    host,
    url: request.url
  });

  // Special handling for ELB health checker
  if (userAgent.includes('ELB-HealthChecker')) {
    return new NextResponse(
      JSON.stringify({ status: 'healthy', type: 'elb' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Prevent caching for health checks
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  }

  // Regular health check response
  return new NextResponse(
    JSON.stringify({ status: 'healthy', type: 'regular' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    }
  );
}
