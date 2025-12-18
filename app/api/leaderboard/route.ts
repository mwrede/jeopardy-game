import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]
    // Get all players, not just top 10, so everyone can see their rank
    const leaderboard = await getLeaderboard(today, 1000) // Large limit to get all players

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
