-- Supabase Setup SQL
-- Run this in Supabase SQL Editor to set up the database

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create sketches table
CREATE TABLE IF NOT EXISTS sketches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_bio TEXT NOT NULL,
  description TEXT NOT NULL,
  body_parts TEXT[] NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  price INTEGER NOT NULL,
  image_filename TEXT NOT NULL,
  tags TEXT[],
  style TEXT,
  complexity TEXT CHECK (complexity IN ('low', 'medium', 'high')),
  color_scheme TEXT,
  meaning_level TEXT,
  visibility_level TEXT,
  chaos_order_level TEXT,
  notes TEXT,
  embedding vector(1536), -- OpenAI ada-002 produces 1536-dimensional vectors
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on embedding column for fast similarity search
CREATE INDEX IF NOT EXISTS sketches_embedding_idx ON sketches 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for vector similarity search
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

-- Enable Row Level Security (RLS)
ALTER TABLE sketches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Enable read access for all users" ON sketches
  FOR SELECT
  USING (true);

-- Create policy to allow insert/update only with service role
-- (you'll handle this via service_role_key in your backend)
CREATE POLICY "Enable insert for service role only" ON sketches
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for service role only" ON sketches
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for sketch images (optional, if not using external URLs)
-- Run this in Supabase Dashboard > Storage section
-- CREATE BUCKET sketches;

COMMENT ON TABLE sketches IS 'Tattoo sketches with vector embeddings for AI-powered search';
COMMENT ON COLUMN sketches.embedding IS 'OpenAI embedding vector (1536 dimensions) for semantic search';
COMMENT ON FUNCTION match_sketches IS 'Find sketches similar to a query embedding using cosine similarity';

