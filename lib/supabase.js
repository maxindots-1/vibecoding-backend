import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Тестовая функция для проверки соединения
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key (first 10 chars):', supabaseKey?.substring(0, 10) + '...');
    
    const { data, error } = await supabase
      .from('user_sessions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}

/**
 * Search for sketches using vector similarity
 * @param {Array<number>} embedding - The query embedding vector
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of matching sketches
 */
export async function searchSketchesByEmbedding(embedding, limit = 15) {
  try {
    const { data, error } = await supabase.rpc('match_sketches', {
      query_embedding: embedding,
      match_threshold: 0.5, // Increased threshold for more accurate results (was 0.01)
      match_count: limit
    });

    if (error) {
      console.error('Error searching sketches:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Supabase search error:', error);
    throw error;
  }
}

/**
 * Get a sketch by ID
 * @param {string} id - Sketch ID
 * @returns {Promise<Object>} - Sketch data
 */
export async function getSketchById(id) {
  try {
    const { data, error } = await supabase
      .from('sketches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sketch:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }
}

/**
 * Insert or update a sketch
 * @param {Object} sketchData - Sketch data to upsert
 * @returns {Promise<Object>} - Inserted/updated sketch
 */
export async function upsertSketch(sketchData) {
  try {
    const { data, error } = await supabase
      .from('sketches')
      .upsert(sketchData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting sketch:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Supabase upsert error:', error);
    throw error;
  }
}

/**
 * Get all sketches (for admin/management)
 * @returns {Promise<Array>} - Array of all sketches
 */
export async function getAllSketches() {
  try {
    const { data, error } = await supabase
      .from('sketches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sketches:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }
}

/**
 * Create a new user session
 * @param {string} sessionId - Unique session identifier
 * @param {Object} sessionData - User session data
 * @returns {Promise<Object>} - Created session
 */
export async function createUserSession(sessionId, sessionData) {
  try {
    console.log('Creating session:', sessionId, 'with data:', JSON.stringify(sessionData, null, 2));
    
    // Очистить undefined значения
    const cleanData = Object.fromEntries(
      Object.entries(sessionData).filter(([_, value]) => value !== undefined)
    );
    
    console.log('Clean data for insertion:', JSON.stringify(cleanData, null, 2));
    
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        session_id: sessionId,
        ...cleanData
      })
      .select();

    if (error) {
      console.error('Supabase error creating user session:', JSON.stringify(error, null, 2));
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error('No data returned from insert operation');
      throw new Error('Failed to create session - no data returned');
    }

    console.log('Session created successfully:', JSON.stringify(data[0], null, 2));
    return data[0];
  } catch (error) {
    console.error('Session creation error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

/**
 * Update user session with email and authentication status
 * @param {string} sessionId - Session identifier
 * @param {string} email - User email
 * @returns {Promise<Object>} - Updated session
 */
export async function updateUserSession(sessionId, email) {
  try {
    console.log('Updating session:', sessionId, 'with email:', email);
    
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        email: email,
        is_authenticated: true,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user session:', error);
      throw error;
    }

    if (!data) {
      throw new Error(`No session found with ID: ${sessionId}`);
    }

    console.log('Session updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Supabase session update error:', error);
    throw error;
  }
}

/**
 * Get user session by session ID
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} - Session data
 */
export async function getUserSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching user session:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Supabase session fetch error:', error);
    throw error;
  }
}

/**
 * Generate Supabase Storage URL for sketch images
 * @param {string} filename - Image filename
 * @returns {string} - Full URL to image in Supabase Storage
 */
export function getSketchImageUrl(filename) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const bucketName = 'sketch-images';
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filename}`;
}

/**
 * Create or update a user reaction for a sketch
 * @param {string} sessionId - User session ID
 * @param {string} sketchId - Sketch ID being rated
 * @param {string} reactionType - 'like', 'dislike', or 'bad_response'
 * @returns {Promise<Object>} - Created/updated reaction
 */
export async function upsertSketchReaction(sessionId, sketchId, reactionType) {
  try {
    console.log('Upserting reaction:', { sessionId, sketchId, reactionType });
    
    // For like/dislike, first remove the opposite reaction if it exists
    if (reactionType === 'like' || reactionType === 'dislike') {
      const oppositeReaction = reactionType === 'like' ? 'dislike' : 'like';
      
      await supabase
        .from('sketch_reactions')
        .delete()
        .eq('session_id', sessionId)
        .eq('sketch_id', sketchId)
        .eq('reaction_type', oppositeReaction);
    }
    
    // Try to upsert the reaction
    const { data, error } = await supabase
      .from('sketch_reactions')
      .upsert({
        session_id: sessionId,
        sketch_id: sketchId,
        reaction_type: reactionType,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,sketch_id,reaction_type'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting sketch reaction:', error);
      throw error;
    }

    console.log('Reaction upserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Sketch reaction upsert error:', error);
    throw error;
  }
}

/**
 * Remove a user reaction for a sketch
 * @param {string} sessionId - User session ID
 * @param {string} sketchId - Sketch ID
 * @param {string} reactionType - 'like', 'dislike', or 'bad_response'
 * @returns {Promise<boolean>} - Success status
 */
export async function removeSketchReaction(sessionId, sketchId, reactionType) {
  try {
    console.log('Removing reaction:', { sessionId, sketchId, reactionType });
    
    const { error } = await supabase
      .from('sketch_reactions')
      .delete()
      .eq('session_id', sessionId)
      .eq('sketch_id', sketchId)
      .eq('reaction_type', reactionType);

    if (error) {
      console.error('Error removing sketch reaction:', error);
      throw error;
    }

    console.log('Reaction removed successfully');
    return true;
  } catch (error) {
    console.error('Sketch reaction removal error:', error);
    throw error;
  }
}

/**
 * Get all reactions for a user session
 * @param {string} sessionId - User session ID
 * @returns {Promise<Array>} - Array of user reactions
 */
export async function getSessionReactions(sessionId) {
  try {
    const { data, error } = await supabase
      .from('sketch_reactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching session reactions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Session reactions fetch error:', error);
    throw error;
  }
}

/**
 * Get reactions for a specific sketch
 * @param {string} sketchId - Sketch ID
 * @returns {Promise<Object>} - Reaction statistics
 */
export async function getSketchReactionStats(sketchId) {
  try {
    const { data, error } = await supabase
      .from('sketch_reactions')
      .select('reaction_type')
      .eq('sketch_id', sketchId);

    if (error) {
      console.error('Error fetching sketch reaction stats:', error);
      throw error;
    }

    const stats = {
      likes: 0,
      dislikes: 0,
      bad_responses: 0
    };

    data?.forEach(reaction => {
      if (reaction.reaction_type === 'like') stats.likes++;
      else if (reaction.reaction_type === 'dislike') stats.dislikes++;
      else if (reaction.reaction_type === 'bad_response') stats.bad_responses++;
    });

    return stats;
  } catch (error) {
    console.error('Sketch reaction stats error:', error);
    throw error;
  }
}

