import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getMostRecentGameScore } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const username = session.user.id
    const gameData = await getMostRecentGameScore(username)

    return NextResponse.json(gameData)
  } catch (error) {
    console.error('Error fetching most recent game:', error)
    return NextResponse.json({ error: 'Failed to fetch most recent game' }, { status: 500 })
  }
}

