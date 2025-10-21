-- Check current match_sketches function definition
-- This will show the current parameters and defaults

SELECT 
  routine_name,
  routine_definition,
  data_type,
  parameter_name,
  parameter_mode,
  parameter_default
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_name = 'match_sketches'
  AND r.routine_schema = 'public'
ORDER BY p.ordinal_position;

-- Also check if function exists and what parameters it has
SELECT 
  routine_name,
  specific_name,
  parameter_name,
  data_type,
  parameter_default,
  parameter_mode
FROM information_schema.parameters
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'match_sketches' 
    AND routine_schema = 'public'
)
ORDER BY ordinal_position;
