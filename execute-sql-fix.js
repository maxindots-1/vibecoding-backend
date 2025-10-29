const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://acmtedexiyynsksfrfwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbXRlZGV4aXl5bnNrc2Zyd2Z0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjA0NzYwMCwiZXhwIjoyMDQ3NjIzNjAwfQ.8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMatchFunction() {
  try {
    console.log('🔧 Fixing match_sketches function...');
    
    const sql = `
-- Restore match_sketches function to working state
-- Using simple approach without complex column matching

DROP FUNCTION IF EXISTS match_sketches(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_sketches (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 15
)
RETURNS TABLE (
  id text,
  title text,
  description text,
  artist_name text,
  artist_bio text,
  image_filename text,
  size text,
  price numeric,
  tags text[],
  style text,
  complexity text,
  meaning text,
  visibility text,
  chaos_order text,
  visual_description text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sketches.id,
    sketches.title,
    sketches.description,
    sketches.artist_name,
    sketches.artist_bio,
    sketches.image_filename,
    sketches.size,
    sketches.price,
    sketches.tags,
    sketches.style,
    sketches.complexity,
    sketches.meaning,
    sketches.visibility,
    sketches.chaos_order,
    sketches.visual_description,
    1 - (sketches.embedding <=> query_embedding) as similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ Function fixed successfully!');
    
    // Test the function
    console.log('🧪 Testing function...');
    const { data: testData, error: testError } = await supabase.rpc('match_sketches', {
      query_embedding: new Array(1536).fill(0.1),
      match_threshold: 0.01,
      match_count: 5
    });
    
    if (testError) {
      console.error('❌ Function test failed:', testError);
    } else {
      console.log('✅ Function test successful! Found', testData?.length || 0, 'results');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixMatchFunction();
