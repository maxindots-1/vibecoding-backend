export async function GET(request) {
  return Response.json({
    success: true,
    message: 'Reactions API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  return Response.json({
    success: true,
    message: 'Reactions API POST is working!',
    timestamp: new Date().toISOString()
  });
}