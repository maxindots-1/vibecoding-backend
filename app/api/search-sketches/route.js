import { generateEmbedding, buildPromptFromResponses, enhanceResultsWithAI } from '../../../lib/openai';
import { searchSketchesByEmbedding, createUserSession, getSketchImageUrl, testSupabaseConnection } from '../../../lib/supabase';
import { randomUUID } from 'crypto';

/**
 * API endpoint to search for sketches based on user responses
 * POST /api/search-sketches
 * 
 * Request body:
 * {
 *   tattooExperience: string,
 *   size: number (0-100),
 *   bodyPart: string,
 *   visibility: number (0-100),
 *   meaningLevel: number (0-100),
 *   chaosOrder: number (0-100),
 *   customText: string,
 *   voiceTranscript: string,
 *   moodboardDescription: string
 * }
 */
// Temporary reactions endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return Response.json({
      success: false,
      error: 'Missing session_id parameter'
    }, { status: 400 });
  }

  return Response.json({
    success: true,
    reactions: [],
    message: 'Reactions API is working! (temporary)',
    session_id
  });
}

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
    const userResponses = await request.json();
    
    // Add logging to debug prompt generation
    console.log('User responses received:', JSON.stringify(userResponses, null, 2));

    // Generate unique session ID
    const sessionId = randomUUID();

    // Build search prompt from user responses
    const prompt = buildPromptFromResponses(userResponses);
    console.log('Generated prompt:', prompt);

    // Generate embedding for the prompt
    const embedding = await generateEmbedding(prompt);

    // Search for matching sketches using vector similarity
    const matchedSketches = await searchSketchesByEmbedding(embedding, 15);

    // Optionally enhance results with AI-generated explanations
    // Note: This adds extra API cost, can be disabled for cost savings
    const enhanceWithAI = false; // Temporarily disabled for testing
    let finalSketches = matchedSketches;

    if (enhanceWithAI && matchedSketches.length > 0) {
      try {
        finalSketches = await enhanceResultsWithAI(prompt, matchedSketches);
      } catch (error) {
        console.error('Failed to enhance with AI, returning basic results:', error);
        // Continue with non-enhanced results
      }
    }

    // Update sketch image URLs to use Supabase Storage and include visual descriptions
    const sketchesWithImageUrls = finalSketches.map(sketch => ({
      ...sketch,
      image_url: getSketchImageUrl(sketch.image_filename),
      visual_description: sketch.visual_description || ''
    }));

    // Extract recommended sketch IDs
    const recommendedSketchIds = finalSketches.map(sketch => sketch.id);

    // Create user session for logging (async, don't wait for it)
    const sessionData = {
      tattoo_experience: userResponses.tattooExperience,
      size_description: userResponses.sizeDescription,
      body_part: userResponses.bodyPart,
      custom_body_part: userResponses.customBodyPart,
      visibility_description: userResponses.visibilityDescription,
      meaning_description: userResponses.meaningDescription,
      chaos_order_description: userResponses.chaosOrderDescription,
      custom_text: userResponses.customText,
      generated_prompt: prompt,
      recommended_sketch_ids: recommendedSketchIds,
      is_authenticated: false
    };
    
    // Wait for session creation to complete
    try {
      await createUserSession(sessionId, sessionData);
      console.log('Session created successfully:', sessionId);
    } catch (error) {
      console.error('Session creation failed:', error);
      // Continue anyway - session creation is not critical for search results
    }

    // Return matched sketches with session ID
    const response = {
      success: true,
      session_id: sessionId,
      sketches: sketchesWithImageUrls,
      count: finalSketches.length
    };
    return Response.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Error in search-sketches API:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to search sketches',
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
