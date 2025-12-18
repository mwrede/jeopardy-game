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

export async function getLeaderboard(date: string, limit: number = 1000): Promise<LeaderboardEntry[]> {
  // Get all games regardless of date - force fresh query
  console.log('Querying all games from Supabase (ignoring date filter)')
  
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('user_id, score, completed_at, date')
    .order('completed_at', { ascending: false }) // Order by most recent first

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
    throw gamesError
  }

  console.log('Games found:', games?.length || 0, 'for date:', date)

  if (!games || games.length === 0) {
    // Try to get all games to see what dates exist (for debugging)
    const { data: allGames } = await supabase
      .from('games')
      .select('date')
      .limit(10)
    
    console.log('Sample dates in database:', allGames?.map(g => g.date) || [])
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
  console.log('User IDs from games:', userIds)
  
  if (userIds.length === 0) {
    console.log('No user IDs found in games')
    return []
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, image, username')
    .in('id', userIds)

  if (usersError) {
    console.error('Error fetching users:', usersError)
    throw usersError
  }

  console.log('Users found:', users?.length || 0, 'for', userIds.length, 'user IDs')

  // If we have games but no users, there's a mismatch
  if (!users || users.length === 0) {
    console.error('No users found for user IDs:', userIds)
    console.error('This suggests user_id in games table does not match id in users table')
    return []
  }

  // Check for mismatches
  const foundUserIds = new Set(users.map(u => u.id))
  const missingUserIds = userIds.filter(id => !foundUserIds.has(id))
  if (missingUserIds.length > 0) {
    console.warn('Some user IDs from games not found in users table:', missingUserIds)
  }

  // Combine data, sort by score (descending), and assign ranks
  // Rank is calculated consistently: same score = same rank, next rank skips
  const leaderboardEntries = users
    .map((user) => {
      const scoreData = userScores.get(user.id)
      if (!scoreData) {
        console.warn(`No score data found for user ${user.id} (username: ${user.username})`)
        return null
      }
      // If they have a game entry, they've finished
      const hasFinished = !!scoreData
      return {
        user_id: user.id,
        name: user.name || 'Unknown',
        image: user.image,
        score: scoreData.score,
        completed_at: scoreData.completed_at,
        has_finished: hasFinished,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => {
      // Sort by score descending, then by completed_at ascending (earlier = better rank)
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    })

  // Calculate ranks: same score = same rank, next rank skips
  const leaderboard: LeaderboardEntry[] = leaderboardEntries.map((entry, index) => {
    let rank = index + 1
    if (index > 0) {
      const prevEntry = leaderboardEntries[index - 1]
      if (entry.score === prevEntry.score) {
        // Same score as previous entry, use same rank
        // Find the first entry with this score to get its rank
        for (let i = index - 1; i >= 0; i--) {
          if (leaderboardEntries[i].score === entry.score) {
            rank = i + 1
          } else {
            break
          }
        }
      }
    }
    return {
      ...entry,
      rank: rank,
    }
  }).slice(0, limit)

  return leaderboard
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
