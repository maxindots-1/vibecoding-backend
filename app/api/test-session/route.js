import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const sessionId = randomUUID();
    console.log('Test session ID:', sessionId);
    
    return Response.json({
      success: true,
      session_id: sessionId,
      message: 'Session ID generated successfully'
    });
  } catch (error) {
    console.error('Error generating session ID:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
