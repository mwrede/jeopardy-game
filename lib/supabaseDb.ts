import { supabase } from './supabase'
import type { User, Game, LeaderboardEntry } from './supabase'

export async function createOrUpdateUser(
  id: string,
  email: string,
  name: string | null,
  image: string | null
): Promise<void> {
  // For Google OAuth users, use email as both id and username
  // Password is not needed for OAuth users, but we need to provide a placeholder
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: id,
        username: email, // Use email as username for OAuth users
        password: 'oauth_user', // Placeholder - not used for OAuth
        name: name,
        image: image,
      },
      {
        onConflict: 'id',
      }
    )

  if (error) {
    console.error('Error creating/updating user:', error)
    throw error
  }
}

export async function saveGame(userId: string, score: number, date: string): Promise<void> {
  const { error } = await supabase.from('games').insert({
    user_id: userId,
    score,
    date,
  })

  if (error) {
    console.error('Error saving game:', error)
    throw error
  }
}

export async function getTodaysBestScore(userId: string, date: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('games')
    .select('score')
    .eq('user_id', userId)
    .eq('date', date)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null
    }
    console.error('Error getting best score:', error)
    throw error
  }

  return data?.score ?? null
}

export async function hasPlayedToday(userId: string, date: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('games')
    .select('id')
    .eq('user_id', userId)
    .eq('date', date)
    .limit(1)

  if (error) {
    console.error('Error checking if played today:', error)
    throw error
  }

  return (data?.length ?? 0) > 0
}

export async function getLeaderboard(date: string, limit: number = 10): Promise<LeaderboardEntry[]> {
  // Get all games for today
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('user_id, score, completed_at')
    .eq('date', date)

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
    throw gamesError
  }

  if (!games || games.length === 0) {
    return []
  }

  // Group by user and get their best score
  const userScores = new Map<string, { score: number; completed_at: string }>()

  games.forEach((game) => {
    const existing = userScores.get(game.user_id)
    if (!existing || game.score > existing.score) {
      userScores.set(game.user_id, {
        score: game.score,
        completed_at: game.completed_at,
      })
    }
  })

  // Get user details
  const userIds = Array.from(userScores.keys())
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, image')
    .in('id', userIds)

  if (usersError) {
    console.error('Error fetching users:', usersError)
    throw usersError
  }

  // Combine data
  const leaderboard: LeaderboardEntry[] = users
    .map((user) => {
      const scoreData = userScores.get(user.id)
      return {
        user_id: user.id,
        name: user.name || 'Unknown',
        image: user.image,
        score: scoreData!.score,
        completed_at: scoreData!.completed_at,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return leaderboard
}
