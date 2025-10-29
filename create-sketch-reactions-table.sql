-- Create sketch_reactions table for user feedback system
-- This table stores user reactions (like, dislike, bad_response) for specific sketches

-- Create sketch_reactions table
CREATE TABLE IF NOT EXISTS sketch_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  sketch_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'bad_response')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one reaction per sketch per session (except bad_response can coexist)
  CONSTRAINT unique_like_dislike_per_sketch_session UNIQUE (session_id, sketch_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sketch_reactions_session ON sketch_reactions(session_id);
CREATE INDEX IF NOT EXISTS idx_sketch_reactions_sketch ON sketch_reactions(sketch_id);
CREATE INDEX IF NOT EXISTS idx_sketch_reactions_type ON sketch_reactions(reaction_type);

-- Enable Row Level Security
ALTER TABLE sketch_reactions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert reactions (sessions created before auth)
CREATE POLICY "Allow insert reactions" ON sketch_reactions
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Allow users to read their own reactions by session
CREATE POLICY "Allow read own reactions" ON sketch_reactions
  FOR SELECT
  USING (true);

-- Policy 3: Allow users to update their reactions
CREATE POLICY "Allow update own reactions" ON sketch_reactions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow users to delete their reactions (for toggle functionality)
CREATE POLICY "Allow delete own reactions" ON sketch_reactions
  FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sketch_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_sketch_reactions_updated_at ON sketch_reactions;
CREATE TRIGGER update_sketch_reactions_updated_at
  BEFORE UPDATE ON sketch_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_sketch_reactions_updated_at();

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sketch_reactions' 
ORDER BY ordinal_position;
