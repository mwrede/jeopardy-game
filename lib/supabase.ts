import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  username: string
  password: string
  name: string | null
  image: string | null
  created_at: string
}

export interface Game {
  id: number
  user_id: string
  score: number
  completed_at: string
  date: string
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  image: string | null
  score: number
  completed_at: string
}
