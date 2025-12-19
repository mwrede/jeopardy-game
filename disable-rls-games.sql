-- Disable Row Level Security for games table
-- This will allow the Supabase client to read all games for the leaderboard
-- Run this in your Supabase SQL Editor NOW

ALTER TABLE games DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'games';

-- This should show rowsecurity = false
