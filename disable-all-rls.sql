-- Disable Row Level Security for all tables
-- Run this in your Supabase SQL Editor

-- Disable RLS for games table
ALTER TABLE games DISABLE ROW LEVEL SECURITY;

-- Disable RLS for users table (in case it's also blocking)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS for submissions table
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Disable RLS for questions table
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Verify all RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('games', 'users', 'submissions', 'questions')
ORDER BY tablename;

-- All should show rowsecurity = false

-- Test query: This should return your games
SELECT id, user_id, score, date, completed_at
FROM games
ORDER BY score DESC
LIMIT 10;
