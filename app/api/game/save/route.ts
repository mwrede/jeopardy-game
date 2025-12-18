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

  // Round score to integer since database column is INTEGER
  const roundedScore = Math.round(score)

  // Get today's date in YYYY-MM-DD format (UTC)
  const today = new Date().toISOString().split('T')[0]
  
  // Use username as the identifier (session.user.id is the username)
  const username = session.user.id

  if (!username) {
    return NextResponse.json({ error: 'Username not found' }, { status: 400 })
  }

  console.log('Saving game for date:', today, 'username:', username, 'score:', roundedScore, '(original:', score, ')')

  try {
    await saveGame(username, roundedScore, today)
    console.log('Game saved successfully')

    return NextResponse.json({ success: true, date: today })
  } catch (error) {
    console.error('Error saving game:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error)
    return NextResponse.json({ 
      error: 'Failed to save game',
      details: errorDetails
    }, { status: 500 })
  }
}
