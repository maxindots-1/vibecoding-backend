-- Final Diagnostic Queries for Structure Mismatch Error
-- Execute these in Supabase SQL Editor to get exact current state

-- Query 1: Get EXACT current function definition
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'match_sketches'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Query 2: Get EXACT table schema with data types
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sketches' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Query 3: Test if function can be called (this will show the exact error)
SELECT * FROM match_sketches(
  (SELECT embedding FROM sketches LIMIT 1),
  0.01,
  5
) LIMIT 1;
