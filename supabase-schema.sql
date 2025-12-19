-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  game_date DATE NOT NULL,
  category TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'Jeopardy Round', 'Final Jeopardy'
  value INTEGER,
  type TEXT, -- 'Fun', 'Serious'
  clue TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_daily_double BOOLEAN DEFAULT FALSE,
  is_image BOOLEAN DEFAULT FALSE,
  image_path TEXT,
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

-- Create submissions table for tracking Final Jeopardy submissions
-- This table will be used for realtime leaderboard updates
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  score INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL
);

-- Drop existing leaderboard view if it exists (to avoid column conflicts)
DROP VIEW IF EXISTS leaderboard;

-- Create leaderboard view (automatically computed from games table)
-- Shows most recent game for each user (not grouped by date)
CREATE VIEW leaderboard AS
SELECT DISTINCT ON (g.user_id)
  g.user_id,
  u.name,
  u.image,
  g.score,
  g.completed_at
FROM games g
LEFT JOIN users u ON g.user_id = u.id
ORDER BY g.user_id, g.completed_at DESC;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_user_date ON games(user_id, date);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_date ON submissions(date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read all users
DROP POLICY IF EXISTS "Users can read all users" ON users;
CREATE POLICY "Users can read all users" ON users
  FOR SELECT USING (true);

-- Users can insert/update their own user record
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own record" ON users;
CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (true);

-- Everyone can read questions
DROP POLICY IF EXISTS "Everyone can read questions" ON questions;
CREATE POLICY "Everyone can read questions" ON questions
  FOR SELECT USING (true);

-- Users can read all games
DROP POLICY IF EXISTS "Users can read all games" ON games;
CREATE POLICY "Users can read all games" ON games
  FOR SELECT USING (true);

-- Users can insert their own games
DROP POLICY IF EXISTS "Users can insert their own games" ON games;
CREATE POLICY "Users can insert their own games" ON games
  FOR INSERT WITH CHECK (true);

-- Everyone can read submissions (for leaderboard)
DROP POLICY IF EXISTS "Everyone can read submissions" ON submissions;
CREATE POLICY "Everyone can read submissions" ON submissions
  FOR SELECT USING (true);

-- Users can insert their own submissions
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;
CREATE POLICY "Users can insert their own submissions" ON submissions
  FOR INSERT WITH CHECK (true);

-- Insert questions from CSV data
INSERT INTO questions (game_date, category, question_type, value, type, clue, answer, is_daily_double, is_image, image_path) VALUES
-- Hometowns
('2025-12-17', 'Hometowns', 'Jeopardy Round', 200, 'Fun', 'This city at the base of the blue ridge mountains on the james river is home to Hunter', 'Lynchburg', FALSE, FALSE, NULL),
('2025-12-17', 'Hometowns', 'Jeopardy Round', 400, 'Fun', 'You''ve heard of the twin cities of st. paul, minneanoplis or like dallas and fort worth, but have you heard of this "higher number" city which includes Davenport, Iowa', 'Quad Cities', FALSE, FALSE, NULL),
('2025-12-17', 'Hometowns', 'Jeopardy Round', 600, 'Fun', 'If you wanted a cheeky pint with Katelyn, you might head to this city where the canals were quite literally built for beer.', 'Dublin', FALSE, FALSE, NULL),
('2025-12-17', 'Hometowns', 'Jeopardy Round', 800, 'Fun', 'Go Blue, Go Julia', 'Ann Arbor', TRUE, FALSE, NULL),
('2025-12-17', 'Hometowns', 'Jeopardy Round', 1000, 'Fun', 'The city of panthers, of the bank named after this country, oh and also Jeremy Powers', 'Charlotte', FALSE, FALSE, NULL),

-- Rebus Raccoon
('2025-12-17', 'Rebus Raccoon', 'Jeopardy Round', 200, 'Serious', '', 'label', FALSE, TRUE, '/image1.png'),
('2025-12-17', 'Rebus Raccoon', 'Jeopardy Round', 400, 'Serious', '', 'detection', FALSE, TRUE, '/image2.png'),
('2025-12-17', 'Rebus Raccoon', 'Jeopardy Round', 600, 'Serious', '', 'bounding box', FALSE, TRUE, '/image3.png'),
('2025-12-17', 'Rebus Raccoon', 'Jeopardy Round', 800, 'Serious', '', 'workspace', FALSE, TRUE, '/image4.png'),
('2025-12-17', 'Rebus Raccoon', 'Jeopardy Round', 1000, 'Serious', '', 'manufacturing', FALSE, TRUE, '/image5.png'),

-- Use Cases
('2025-12-17', 'Use Cases', 'Jeopardy Round', 200, 'Serious', 'The largest one ever was Hallmark/westland''s 2008 one which saw 150M tons of beef going poof', 'Recall', FALSE, FALSE, NULL),
('2025-12-17', 'Use Cases', 'Jeopardy Round', 400, 'Serious', 'This car manufacturer saved capital B billions by using roboflow', 'Rivian', FALSE, FALSE, NULL),
('2025-12-17', 'Use Cases', 'Jeopardy Round', 600, 'Serious', 'Intelisee is a threat detection software that was suffering from a high number of false positives for detecting falls, slips, shooters meaning low precision, but actually would mean high this important metric', 'Recall', TRUE, FALSE, NULL),
('2025-12-17', 'Use Cases', 'Jeopardy Round', 800, 'Serious', 'This chocolate company was having wrapper issues :(', 'Lindt', FALSE, FALSE, NULL),
('2025-12-17', 'Use Cases', 'Jeopardy Round', 1000, 'Serious', 'Vanilla on Strawberry, Mixed Berry on Strawberry at this company caused allergy concerns and recalls but dont worry we fixed it', 'Chobani', FALSE, FALSE, NULL),

-- Final Jeopardy
('2025-12-17', 'Computers', 'Final Jeopardy', NULL, NULL, 'During the 1970s, this company based in Armonk NY was famous for it''s large large computers called mainframes', 'IBM', FALSE, FALSE, NULL);
