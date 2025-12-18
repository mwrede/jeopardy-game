import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get all players regardless of date
    console.log('Fetching all leaderboard entries (ignoring date)')
    
    // Get all players, not just top 10, so everyone can see their rank
    const leaderboard = await getLeaderboard('', 1000) // Large limit to get all players

    console.log('Leaderboard result:', { count: leaderboard.length })

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
