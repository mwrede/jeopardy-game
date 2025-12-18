import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { saveGame } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { score } = await req.json()

  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
  }

  // Get today's date in YYYY-MM-DD format (UTC)
  const today = new Date().toISOString().split('T')[0]
  
  console.log('Saving game for date:', today, 'user:', session.user.id, 'score:', score)

  // Use username as user ID (it's stored as the id in the users table)
  const userId = session.user.id

  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
  }

  try {
    await saveGame(userId, score, today)
    console.log('Game saved successfully')

    return NextResponse.json({ success: true, date: today })
  } catch (error) {
    console.error('Error saving game:', error)
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 })
  }
}
