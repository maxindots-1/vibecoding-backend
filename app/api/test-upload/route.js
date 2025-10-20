export async function POST(request) {
  try {
    return Response.json({
      success: true,
      message: 'Test upload endpoint is working'
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
