import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsForDate, getFinalJeopardyForDate } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const searchParams = req.nextUrl.searchParams
    const date = searchParams.get('date') || today
    const type = searchParams.get('type') // 'final' or null for regular questions

    if (type === 'final') {
      const finalJeopardy = await getFinalJeopardyForDate(date)
      return NextResponse.json(finalJeopardy)
    } else {
      const questions = await getQuestionsForDate(date)
      return NextResponse.json(questions)
    }
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

