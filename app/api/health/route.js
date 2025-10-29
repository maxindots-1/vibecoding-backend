/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vibecoding Backend API',
    version: '2.0'
  });
}

/**
 * Reactions endpoint (temporary)
 * GET /api/health?reactions=true&session_id=xxx
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { session_id, sketch_id, reaction_type, action = 'upsert' } = body;

    // Validate required fields
    if (!session_id || !sketch_id || !reaction_type) {
      return Response.json({
        success: false,
        error: 'Missing required fields: session_id, sketch_id, reaction_type'
      }, { status: 400 });
    }

    // Validate reaction type
    const validReactions = ['like', 'dislike', 'bad_response'];
    if (!validReactions.includes(reaction_type)) {
      return Response.json({
        success: false,
        error: 'Invalid reaction_type. Must be: like, dislike, or bad_response'
      }, { status: 400 });
    }

    // For now, just return success without database operations
    return Response.json({
      success: true,
      action: action,
      reaction_type,
      sketch_id,
      session_id,
      message: 'Reactions API is working! (via health endpoint)'
    });

  } catch (error) {
    console.error('❌ Reaction API error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

