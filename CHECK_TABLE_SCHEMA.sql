-- Check table schema to see exact column types
SELECT column_name, data_type, udt_name, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sketches' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
