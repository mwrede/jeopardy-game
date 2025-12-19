-- Update the leaderboard view to show ALL game entries instead of just one per user

-- Drop existing leaderboard view
DROP VIEW IF EXISTS leaderboard;

-- Create new leaderboard view that shows ALL games
CREATE VIEW leaderboard AS
SELECT
  g.id as game_id,
  g.user_id,
  u.name,
  u.image,
  g.score,
  g.completed_at,
  g.date
FROM games g
LEFT JOIN users u ON g.user_id = u.id
ORDER BY g.score DESC, g.completed_at ASC;
