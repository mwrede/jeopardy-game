import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Disable caching completely

export async function GET(req: NextRequest) {
  try {
    // Get all players regardless of date
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] Fetching all leaderboard entries from Supabase (fresh query)`)
    
    // Get all players, not just top 10, so everyone can see their rank
    const leaderboard = await getLeaderboard('', 1000) // Large limit to get all players

    console.log(`[${timestamp}] Leaderboard result:`, { 
      count: leaderboard.length,
      entries: leaderboard.map(e => ({ user_id: e.user_id, name: e.name, score: e.score, rank: e.rank }))
    })

    // Add cache headers to prevent caching
    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
