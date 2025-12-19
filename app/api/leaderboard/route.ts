import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get all players regardless of date - force fresh data
    const timestamp = Date.now()
    const searchParams = req.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    console.log(`[${timestamp}] Fetching all leaderboard entries from games table (forceRefresh: ${forceRefresh})`)
    
    // Get all players, not just top 10, so everyone can see their rank
    const leaderboard = await getLeaderboard('', 1000) // Large limit to get all players

    console.log(`[${timestamp}] Leaderboard result:`, { 
      count: leaderboard.length,
      user_ids: leaderboard.map(e => e.user_id),
      scores: leaderboard.map(e => e.score),
      entries: leaderboard.map(e => ({ user_id: e.user_id, name: e.name, score: e.score, rank: e.rank }))
    })

    // Add aggressive cache headers to prevent ANY caching
    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Timestamp': timestamp.toString(),
        'X-Force-Refresh': forceRefresh ? 'true' : 'false',
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
