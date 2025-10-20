-- Alternative: Use text-embedding-3-small (1536 dimensions) if hnsw is not available
-- Run this in Supabase SQL Editor to upgrade the database schema

-- Add visual_description column
ALTER TABLE sketches 
ADD COLUMN IF NOT EXISTS visual_description TEXT;

-- Drop old embedding column and index
DROP INDEX IF EXISTS sketches_embedding_idx;
ALTER TABLE sketches DROP COLUMN IF EXISTS embedding;

-- Add new embedding column with 1536 dimensions (text-embedding-3-small)
ALTER TABLE sketches ADD COLUMN embedding vector(1536);

-- Recreate index for 1536 dimensions (ivfflat works fine for this size)
CREATE INDEX sketches_embedding_idx ON sketches 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Update match_sketches function for 1536 dimensions
DROP FUNCTION IF EXISTS match_sketches;
CREATE OR REPLACE FUNCTION match_sketches(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 6
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  artist_name TEXT,
  artist_bio TEXT,
  description TEXT,
  visual_description TEXT,
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
    sketches.visual_description,
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
    1 - (sketches.embedding <=> query_embedding) AS similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sketches' 
ORDER BY ordinal_position;
