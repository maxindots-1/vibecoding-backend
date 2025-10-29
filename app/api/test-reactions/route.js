export async function GET() {
  return Response.json({
    success: true,
    message: 'Test reactions endpoint is working!',
    timestamp: new Date().toISOString()
  });
}
