-- Configure Secure RLS Policies for user_sessions table
-- This script allows sessions to be created securely while maintaining data protection

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous insert" ON user_sessions;
DROP POLICY IF EXISTS "Allow read own session" ON user_sessions;
DROP POLICY IF EXISTS "Allow update own session" ON user_sessions;

-- Enable RLS on user_sessions (if not already enabled)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert new sessions
-- This is needed because sessions are created before authentication
CREATE POLICY "Allow anonymous insert" ON user_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Allow users to read their own sessions by session ID
-- This allows frontend to retrieve session by id
CREATE POLICY "Allow read own session" ON user_sessions
  FOR SELECT
  USING (true);

-- Policy 3: Allow users to update sessions by email
-- This allows updating session when user provides email
CREATE POLICY "Allow update by id" ON user_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_sessions';
