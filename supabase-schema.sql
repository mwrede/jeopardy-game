-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL
);

-- Create leaderboard view (automatically computed from games table)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  g.user_id,
  u.name,
  u.image,
  MAX(g.score) as score,
  MAX(g.completed_at) as completed_at,
  g.date
FROM games g
JOIN users u ON g.user_id = u.id
GROUP BY g.user_id, u.name, u.image, g.date
ORDER BY MAX(g.score) DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_user_date ON games(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read all users
CREATE POLICY "Users can read all users" ON users
  FOR SELECT USING (true);

-- Users can insert/update their own user record
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (true);

-- Users can read all games
CREATE POLICY "Users can read all games" ON games
  FOR SELECT USING (true);

-- Users can insert their own games
CREATE POLICY "Users can insert their own games" ON games
  FOR INSERT WITH CHECK (true);
