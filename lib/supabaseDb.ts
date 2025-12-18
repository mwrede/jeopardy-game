import { supabase } from './supabase'
import type { User, Game, LeaderboardEntry } from './supabase'

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user by username:', error)
      throw error
    }

    return data || null
  } catch (error) {
    console.error('Unexpected error in getUserByUsername:', error)
    return null
  }
}

export async function createOrUpdateUser(
  username: string,
  name: string,
  image: string | null
): Promise<void> {
  try {
    // Check if username already exists (must be unique)
    const existingUser = await getUserByUsername(username)
    
    if (existingUser && existingUser.id !== username) {
      // Username exists but with different ID - this shouldn't happen, but handle it
      throw new Error(`Username "${username}" is already taken`)
    }

    // Use username as the ID, no password needed
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: username, // Use username as the ID
          username: username,
          password: 'no_password', // Placeholder - not used
          name: name,
          image: image,
        },
        {
          onConflict: 'id',
        }
      )

    if (error) {
      console.error('Error creating/updating user in Supabase:', error)
      // Check if it's a unique constraint violation
      if (error.code === '23505' || error.message?.includes('unique')) {
        throw new Error(`Username "${username}" is already taken. Please choose a different username.`)
      }
      throw error
    }
  } catch (error) {
    console.error('Unexpected error in createOrUpdateUser:', error)
    throw error
  }
}

export async function saveGame(username: string, score: number, date: string): Promise<void> {
  try {
    // Ensure score is an integer
    const integerScore = Math.round(score)
    if (integerScore !== score) {
      console.log(`Rounding score from ${score} to ${integerScore}`)
    }
    
    console.log('Attempting to save game:', { username, score: integerScore, date })
    
    // First, ensure the user exists in the users table (by username)
    const existingUser = await getUserByUsername(username)

    if (!existingUser) {
      console.log('User not found, this might cause a foreign key constraint error')
      throw new Error(`User with username "${username}" does not exist in the users table. Please sign in again.`)
    }

    // Username should be the same as user_id (id in users table)
    // Since we set id: username in createOrUpdateUser, we can use username directly
    // But verify it matches
    if (existingUser.id !== username) {
      console.error('Username mismatch!', { username, userId: existingUser.id })
      throw new Error(`Username "${username}" does not match user ID "${existingUser.id}". Please sign in again.`)
    }

    // Save game using username directly as user_id (since username = id)
    const gameData = {
      user_id: username, // Use username directly since username = id
      score: integerScore, // Use rounded integer score
      date,
    }
    
    console.log('Inserting game data:', gameData)
    
    const { data, error } = await supabase.from('games').insert(gameData).select()

    if (error) {
      console.error('Error saving game to Supabase:', error)
      console.error('Error code:', error.code)
      console.error('Error details:', JSON.stringify(error, null, 2))
      console.error('Game data attempted:', gameData)
      throw new Error(`Supabase error: ${error.message || JSON.stringify(error)}`)
    }

    console.log('Game saved successfully:', data)
    
    // Verify the game was saved by querying it back
    const { data: verifyData, error: verifyError } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', username)
      .eq('date', date)
      .order('completed_at', { ascending: false })
      .limit(1)
    
    if (verifyError) {
      console.error('Error verifying saved game:', verifyError)
    } else {
      console.log('Verified saved game exists:', verifyData?.length || 0, 'game(s) found')
    }
  } catch (error) {
    console.error('Unexpected error in saveGame:', error)
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

export async function getMostRecentGameScore(userId: string): Promise<{ score: number; completed_at: string } | null> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('score, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      console.error('Error getting most recent game score:', error)
      throw error
    }

    return data ? { score: data.score, completed_at: data.completed_at } : null
  } catch (error) {
    console.error('Unexpected error in getMostRecentGameScore:', error)
    return null
  }
}

export async function getLeaderboard(date: string, limit: number = 1000): Promise<LeaderboardEntry[]> {
  // Query the leaderboard table directly - it's automatically maintained by triggers
  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from('leaderboard')
    .select('user_id, name, image, score, completed_at')
    .order('score', { ascending: false })
    .order('completed_at', { ascending: true }) // Earlier completion = better rank for ties

  if (leaderboardError) {
    console.error('Error fetching leaderboard from Supabase:', leaderboardError)
    throw leaderboardError
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    console.log('No entries found in leaderboard table')
    return []
  }

  console.log(`Fetched ${leaderboardData.length} entries from leaderboard table`)

  // Build leaderboard entries and assign ranks
  const entries: LeaderboardEntry[] = leaderboardData.map((entry, index) => ({
    user_id: entry.user_id,
    name: entry.name || entry.user_id, // Fallback to user_id if name is null
    image: entry.image,
    score: entry.score,
    completed_at: entry.completed_at,
    has_finished: true,
    rank: 0, // Will be calculated below
  }))

  // Assign ranks (same score = same rank)
  entries.forEach((entry, index) => {
    if (index === 0) {
      entry.rank = 1
    } else {
      const prevEntry = entries[index - 1]
      entry.rank = prevEntry.score === entry.score ? prevEntry.rank : index + 1
    }
  })

  console.log(`Returning ${entries.length} leaderboard entries with scores:`, entries.map(e => ({ user_id: e.user_id, name: e.name, score: e.score, rank: e.rank })))
  return entries.slice(0, limit)
}

export interface Question {
  id: number
  game_date: string
  category: string
  question_type: string
  value: number | null
  type: string | null
  clue: string
  answer: string
  is_daily_double: boolean
  is_image: boolean
  image_path: string | null
}

export async function getQuestionsForDate(date: string): Promise<Question[]> {
  try {
    console.log('Fetching all questions from Supabase (ignoring date)')
    
    // Fetch all questions regardless of date
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('category', { ascending: true })
      .order('value', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching questions from Supabase:', error)
      throw error
    }

    console.log(`Found ${data?.length || 0} total questions in Supabase`)
    
    if (data && data.length > 0) {
      console.log('Sample question:', {
        category: data[0].category,
        question_type: data[0].question_type,
        value: data[0].value,
        game_date: data[0].game_date,
      })
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getQuestionsForDate:', error)
    throw error
  }
}

export async function getFinalJeopardyForDate(date: string): Promise<Question | null> {
  try {
    console.log('Fetching Final Jeopardy from Supabase (ignoring date)')
    
    // Fetch Final Jeopardy regardless of date
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('question_type', 'Final Jeopardy')
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('No Final Jeopardy found')
        return null
      }
      console.error('Error fetching Final Jeopardy:', error)
      throw error
    }

    console.log('Final Jeopardy found:', data?.category)
    return data || null
  } catch (error) {
    console.error('Unexpected error in getFinalJeopardyForDate:', error)
    return null
  }
}
