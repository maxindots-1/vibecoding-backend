-- CORRECT FIX: Fix match_sketches function with proper column names
-- Copy this entire content and paste into Supabase SQL Editor

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
  suitable_body_parts text[],
  size text,
  price integer,
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
    sketches.suitable_body_parts,
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

-- Test the function
SELECT * FROM match_sketches(
  (SELECT embedding FROM sketches LIMIT 1),
  0.01,
  5
) LIMIT 1;
