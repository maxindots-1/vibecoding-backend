-- Remove old numeric level columns from user_sessions table
-- This script removes the old numeric columns that are no longer needed
-- since we now use text description columns instead

ALTER TABLE user_sessions 
DROP COLUMN IF EXISTS size_level,
DROP COLUMN IF EXISTS visibility_level,
DROP COLUMN IF EXISTS meaning_level,
DROP COLUMN IF EXISTS chaos_order_level;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;
