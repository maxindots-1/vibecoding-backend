# Admin Panel Fix Instructions

## Problem
The admin panel is failing to upload sketches with the error:
```
Database insert failed: Could not find the 'body_parts' column of 'sketches' in the schema cache
```

## Root Cause
There's a mismatch between the database schema and the backend code:
- Database schema uses `body_parts` column
- Backend code is trying to use `suitable_body_parts` column
- Missing `visual_description` column in some database instances

## Solution

### Step 1: Update Database Schema
Run this SQL script in Supabase SQL Editor:

```sql
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
```

### Step 2: Redeploy Backend
After updating the database schema, redeploy the backend to Vercel:

```bash
cd backend
vercel --prod
```

### Step 3: Test Admin Panel
1. Open the admin panel: `/Users/maximshishkin/Documents/Dots/Web/Vibecoding/admin/index.html`
2. Fill in the required fields:
   - Sketch Title
   - Artist Name
   - Artist Bio
   - Sketch Description
   - Select body parts (arm, leg, chest, back)
   - Select size (small, medium, large)
   - Set price
   - Upload image
3. Click "Add Sketch"
4. Check that the upload succeeds

## Expected Result
- Admin panel should successfully upload sketches
- No more "body_parts column not found" errors
- Sketches should be saved to database with all metadata
- AI should generate visual descriptions and embeddings
- New sketches should appear in search results

## Troubleshooting
If issues persist:
1. Check Vercel logs for backend errors
2. Verify database schema matches expected structure
3. Ensure all environment variables are set correctly
4. Check that Supabase Storage bucket exists and is accessible

## Files Modified
- `backend/app/api/upload-sketch/route.js` - Fixed column name mapping
- `backend/fix-admin-upload-schema.sql` - Database schema fix
- This file - Instructions for fixing the issue
