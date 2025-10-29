import { 
  upsertSketchReaction, 
  removeSketchReaction, 
  getSessionReactions 
} from '../../../lib/supabase.js';

export async function POST(request) {
  try {
    console.log('🎯 Reaction API called');
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

    let result;

    if (action === 'remove') {
      // Remove the reaction
      result = await removeSketchReaction(session_id, sketch_id, reaction_type);
      
      return Response.json({
        success: true,
        action: 'removed',
        reaction_type,
        sketch_id,
        session_id
      });
    } else {
      // Create or update the reaction
      result = await upsertSketchReaction(session_id, sketch_id, reaction_type);
      
      return Response.json({
        success: true,
        action: 'upserted',
        data: result
      });
    }

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
    console.log('🔍 Get reactions API called');
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return Response.json({
        success: false,
        error: 'Missing session_id parameter'
      }, { status: 400 });
    }

    const reactions = await getSessionReactions(session_id);

    return Response.json({
      success: true,
      reactions
    });

  } catch (error) {
    console.error('❌ Get reactions API error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
