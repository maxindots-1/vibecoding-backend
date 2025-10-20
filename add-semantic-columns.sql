-- Add semantic description columns to user_sessions table
-- This will store the text descriptions from frontend buttons instead of just numeric values

-- Add new columns for semantic descriptions
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
