-- Execute this SQL in Supabase SQL Editor
-- This adds semantic description columns to user_sessions table

ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS size_description TEXT,
ADD COLUMN IF NOT EXISTS visibility_description TEXT,
ADD COLUMN IF NOT EXISTS meaning_description TEXT,
ADD COLUMN IF NOT EXISTS chaos_order_description TEXT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;
