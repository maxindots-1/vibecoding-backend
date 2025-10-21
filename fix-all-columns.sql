-- Fix all column name mismatches in match_sketches function
-- Correct column names: meaning_level, visibility_level, chaos_order_level

DROP FUNCTION IF EXISTS match_sketches(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_sketches (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.01,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id text,
  title text,
  description text,
  artist_name text,
  artist_bio text,
  image_filename text,
  body_parts text[],
  size text,
  price numeric,
  tags text[],
  style text,
  complexity text,
  meaning_level text,        -- FIXED: was meaning
  visibility_level text,     -- FIXED: was visibility
  chaos_order_level text,    -- FIXED: was chaos_order
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
    sketches.body_parts,
    sketches.size,
    sketches.price,
    sketches.tags,
    sketches.style,
    sketches.complexity,
    sketches.meaning_level,        -- FIXED: was meaning
    sketches.visibility_level,     -- FIXED: was visibility
    sketches.chaos_order_level,    -- FIXED: was chaos_order
    sketches.visual_description,
    1 - (sketches.embedding <=> query_embedding) as similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
