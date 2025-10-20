/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vibecoding Backend API'
  });
}

