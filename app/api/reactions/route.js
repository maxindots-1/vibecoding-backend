export async function POST(request) {
  try {
    console.log('🎯 Reaction API called - Simple Version');
    const body = await request.json();
    console.log('📥 Received reaction data:', body);

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
      message: 'Reactions API is working! (Simple version)'
    });

  } catch (error) {
    console.error('❌ Reaction API error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    console.log('🔍 Get reactions API called - Simple Version');
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return Response.json({
        success: false,
        error: 'Missing session_id parameter'
      }, { status: 400 });
    }

    // For now, just return empty reactions
    return Response.json({
      success: true,
      reactions: [],
      message: 'Reactions API is working! (Simple version)',
      session_id
    });

  } catch (error) {
    console.error('❌ Get reactions API error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
