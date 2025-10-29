const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://acmtedexiyynsksfrfwt.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbXRlZGV4aXl5bnNrc2ZyZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzMTE5MSwiZXhwIjoyMDc1OTA3MTkxfQ.EzxYbhDvh0tj3RubOu6LRxEB81ahLILBUpGvGzk6TNM'
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vibecoding Backend API'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Search sketches
app.post('/api/search-sketches', async (req, res) => {
  try {
    const userResponses = req.body;
    
    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Created session ID:', sessionId);

    // Build prompt
    const prompt = `User is looking for a tattoo with the following characteristics:
Experience: ${userResponses.tattooExperience || 'not specified'}
Size preference: ${userResponses.size || 'not specified'}
Preferred placement: ${userResponses.bodyPart || 'not specified'}
Visibility: ${userResponses.visibility || 'not specified'}
Approach: ${userResponses.meaningLevel || 'not specified'}
Style preference: ${userResponses.chaosOrder || 'not specified'}
Additional details: ${userResponses.customText || 'none'}`;

    // Get sketches from Supabase
    const { data: sketches, error } = await supabase
      .from('sketches')
      .select('*')
      .limit(4);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    console.log('Retrieved sketches from Supabase:', sketches.length);

    // Add image URLs
    const sketchesWithUrls = sketches.map(sketch => ({
      ...sketch,
      image_url: `https://acmtedexiyynsksfrfwt.supabase.co/storage/v1/object/public/sketch-images/${sketch.image_filename}`
    }));

    // Log session (try to create, but don't fail if it doesn't work)
    try {
      await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          tattoo_experience: userResponses.tattooExperience,
          size_level: userResponses.size,
          body_part: userResponses.bodyPart,
          visibility_level: userResponses.visibility,
          meaning_level: userResponses.meaningLevel,
          chaos_order_level: userResponses.chaosOrder,
          custom_text: userResponses.customText,
          generated_prompt: prompt,
          recommended_sketch_ids: sketches.map(s => s.id),
          is_authenticated: false
        });
      console.log('Session logged successfully');
    } catch (sessionError) {
      console.error('Session logging failed:', sessionError);
    }

    const response = {
      success: true,
      session_id: sessionId,
      prompt: prompt,
      sketches: sketchesWithUrls,
      count: sketches.length
    };

    console.log('Returning response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Update session
app.post('/api/update-session', async (req, res) => {
  try {
    const { session_id, email } = req.body;

    if (!session_id || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Update session
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        email: email,
        is_authenticated: true,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update session'
      });
    }

    res.json({
      success: true,
      message: 'Session updated successfully',
      session: data
    });

  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reactions API
app.get('/api/reactions', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing session_id parameter'
      });
    }

    // For now, just return empty reactions
    res.json({
      success: true,
      reactions: [],
      message: 'Reactions API is working! (Pages Router)',
      session_id
    });

  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/reactions', async (req, res) => {
  try {
    const { session_id, sketch_id, reaction_type, action = 'upsert' } = req.body;

    // Validate required fields
    if (!session_id || !sketch_id || !reaction_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: session_id, sketch_id, reaction_type'
      });
    }

    // Validate reaction type
    const validReactions = ['like', 'dislike', 'bad_response'];
    if (!validReactions.includes(reaction_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reaction_type. Must be: like, dislike, or bad_response'
      });
    }

    // For now, just return success without database operations
    res.json({
      success: true,
      action: action,
      reaction_type,
      sketch_id,
      session_id,
      message: 'Reactions API is working! (Pages Router)'
    });

  } catch (error) {
    console.error('Reaction API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = app;