-- Fix match_sketches function to return fields with names expected by backend
-- Backend expects: meaning, visibility, chaos_order (not _level suffix)

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
  suitable_body_parts text[],  -- Backend expects this name
  size text,
  price numeric,
  tags text[],
  style text,
  complexity text,
  meaning text,        -- Backend expects this name (not meaning_level)
  visibility text,     -- Backend expects this name (not visibility_level)
  chaos_order text,    -- Backend expects this name (not chaos_order_level)
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
    sketches.body_parts as suitable_body_parts,  -- Map body_parts to suitable_body_parts
    sketches.size,
    sketches.price,
    sketches.tags,
    sketches.style,
    sketches.complexity,
    sketches.meaning_level as meaning,        -- Map meaning_level to meaning
    sketches.visibility_level as visibility,  -- Map visibility_level to visibility
    sketches.chaos_order_level as chaos_order, -- Map chaos_order_level to chaos_order
    sketches.visual_description,
    1 - (sketches.embedding <=> query_embedding) as similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
