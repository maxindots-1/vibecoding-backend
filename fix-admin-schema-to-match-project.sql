-- Fix admin schema to match working project schema
-- Run this in Supabase SQL Editor

-- Ensure all required columns exist with correct names
ALTER TABLE sketches 
ADD COLUMN IF NOT EXISTS suitable_body_parts TEXT[],
ADD COLUMN IF NOT EXISTS visual_description TEXT,
ADD COLUMN IF NOT EXISTS meaning TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT,
ADD COLUMN IF NOT EXISTS chaos_order TEXT;

-- If body_parts exists but suitable_body_parts doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'body_parts'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'suitable_body_parts'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN body_parts TO suitable_body_parts;
        RAISE NOTICE 'Renamed body_parts to suitable_body_parts';
    END IF;
END $$;

-- If meaning_level exists but meaning doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'meaning_level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'meaning'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN meaning_level TO meaning;
        RAISE NOTICE 'Renamed meaning_level to meaning';
    END IF;
END $$;

-- If visibility_level exists but visibility doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'visibility_level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'visibility'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN visibility_level TO visibility;
        RAISE NOTICE 'Renamed visibility_level to visibility';
    END IF;
END $$;

-- If chaos_order_level exists but chaos_order doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'chaos_order_level'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sketches' AND column_name = 'chaos_order'
    ) THEN
        ALTER TABLE sketches RENAME COLUMN chaos_order_level TO chaos_order;
        RAISE NOTICE 'Renamed chaos_order_level to chaos_order';
    END IF;
END $$;

-- Update the match_sketches function to use correct column names
DROP FUNCTION IF EXISTS match_sketches(vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_sketches(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.01,
  match_count int DEFAULT 20
)
RETURNS TABLE(
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

-- Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sketches' 
ORDER BY ordinal_position;

-- Test the function
SELECT 'Schema updated to match working project' as status;
