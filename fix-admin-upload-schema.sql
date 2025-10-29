-- Fix admin upload schema issues
-- Run this in Supabase SQL Editor to fix the database schema

-- First, check if visual_description column exists, if not add it
ALTER TABLE sketches 
ADD COLUMN IF NOT EXISTS visual_description TEXT;

-- Check if body_parts column exists (it should be there from original schema)
-- If it doesn't exist, we need to rename suitable_body_parts to body_parts
DO $$ 
BEGIN
    -- Check if suitable_body_parts exists and body_parts doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'suitable_body_parts'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'body_parts'
    ) THEN
        -- Rename suitable_body_parts to body_parts
        ALTER TABLE sketches RENAME COLUMN suitable_body_parts TO body_parts;
        RAISE NOTICE 'Renamed suitable_body_parts to body_parts';
    END IF;
END $$;

-- Ensure embedding column exists with correct dimensions
DO $$
BEGIN
    -- Check if embedding column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'embedding'
    ) THEN
        -- Add embedding column
        ALTER TABLE sketches ADD COLUMN embedding vector(1536);
        RAISE NOTICE 'Added embedding column';
    END IF;
END $$;

-- Create or recreate index for embedding
DROP INDEX IF EXISTS sketches_embedding_idx;
CREATE INDEX IF NOT EXISTS sketches_embedding_idx ON sketches 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Update match_sketches function to include visual_description
DROP FUNCTION IF EXISTS match_sketches(vector, double precision, integer);
CREATE OR REPLACE FUNCTION match_sketches(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.01,
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
  meaning_level TEXT,
  visibility_level TEXT,
  chaos_order_level TEXT,
  visual_description TEXT,
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
    sketches.meaning_level,
    sketches.visibility_level,
    sketches.chaos_order_level,
    sketches.visual_description,
    1 - (sketches.embedding <=> query_embedding) AS similarity
  FROM sketches
  WHERE 1 - (sketches.embedding <=> query_embedding) > match_threshold
  ORDER BY sketches.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sketches' 
ORDER BY ordinal_position;

-- Test the function
SELECT 'Schema update completed successfully' as status;
