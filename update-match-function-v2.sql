-- Update match_sketches function with higher default limits
-- This will ensure we get 15 sketches instead of 4

-- Drop existing function
DROP FUNCTION IF EXISTS match_sketches(vector(1536), float, int);

-- Recreate with correct parameters and higher default limit
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

-- Verify the function was created with correct defaults
SELECT 
  routine_name,
  parameter_name,
  data_type,
  parameter_default
FROM information_schema.parameters
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'match_sketches' 
    AND routine_schema = 'public'
)
ORDER BY ordinal_position;
