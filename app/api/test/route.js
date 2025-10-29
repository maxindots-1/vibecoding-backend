export async function GET() {
  return Response.json({ 
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString()
  });
}
