import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { hasPlayedToday } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const hasPlayed = await hasPlayedToday(session.user.id, today)

    return NextResponse.json({ hasPlayed })
  } catch (error) {
    console.error('Error checking game status:', error)
    return NextResponse.json({ error: 'Failed to check game status' }, { status: 500 })
  }
}
