-- Fix Row Level Security policies for games table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all games" ON games;
DROP POLICY IF EXISTS "Users can insert their own games" ON games;
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON games;

-- Create new policies that explicitly allow all access
-- This allows both authenticated users and service role to read games
CREATE POLICY "Enable read access for all users"
ON games FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON games FOR INSERT
WITH CHECK (true);

-- Verify the policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'games';
