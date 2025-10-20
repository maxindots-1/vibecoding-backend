import { updateUserSession } from '../../../lib/supabase';

/**
 * API endpoint to update user session with email
 * POST /api/update-session
 * 
 * Request body:
 * {
 *   session_id: string,
 *   email: string
 * }
 */
export async function POST(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const { session_id, email } = await request.json();
    
    console.log('=== UPDATE SESSION API CALL ===');
    console.log('Session ID:', session_id);
    console.log('Email:', email);

    // Validate required fields
    if (!session_id || !email) {
      return Response.json({
        success: false,
        error: 'Missing required fields',
        message: 'session_id and email are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Update user session with email
    const updatedSession = await updateUserSession(session_id, email);
    console.log('Session updated with email:', email);

    return Response.json({
      success: true,
      message: 'Session updated successfully',
      session: updatedSession
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Error in update-session API:', error);
    
    // Handle specific error cases
    if (error.message && error.message.includes('No rows found')) {
      return Response.json({
        success: false,
        error: 'Session not found',
        message: 'The provided session ID does not exist'
      }, { status: 404 });
    }

    return Response.json({
      success: false,
      error: 'Failed to update session',
      message: error.message
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}
