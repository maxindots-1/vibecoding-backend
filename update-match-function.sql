-- Update match_sketches function with new default parameters
DROP FUNCTION IF EXISTS match_sketches;

CREATE OR REPLACE FUNCTION match_sketches(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.1,
  match_count INT DEFAULT 15
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  artist_name TEXT,
  artist_bio TEXT,
  description TEXT,
  body_parts TEXT[],
  size TEXT,
  price INTEGER,
  image_filename TEXT,
  tags TEXT[],
  style TEXT,
  complexity TEXT,
  color_scheme TEXT,
  meaning_level TEXT,
  visibility_level TEXT,
  chaos_order_level TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  visual_description TEXT,
  embedding vector(1536),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sketches.id,
    sketches.title,
    sketches.artist_name,
    sketches.artist_bio,
    sketches.description,
    sketches.body_parts,
    sketches.size,
    sketches.price,
    sketches.image_filename,
    sketches.tags,
    sketches.style,
    sketches.complexity,
    sketches.color_scheme,
    sketches.meaning_level,
    sketches.visibility_level,
    sketches.chaos_order_level,
    sketches.notes,
    sketches.created_at,
    sketches.updated_at,
    sketches.visual_description,
    sketches.embedding,
    1 - (sketches.embedding <=> query_embedding) AS similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
