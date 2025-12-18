import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsForDate, getFinalJeopardyForDate } from '@/lib/supabaseDb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Date parameter is ignored - we fetch all questions
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') // 'final' or null for regular questions

    console.log('Questions API called (fetching all questions, ignoring date)')

    if (type === 'final') {
      const finalJeopardy = await getFinalJeopardyForDate('')
      console.log('Final Jeopardy result:', finalJeopardy ? 'Found' : 'Not found')
      return NextResponse.json(finalJeopardy)
    } else {
      const questions = await getQuestionsForDate('')
      console.log(`Returning ${questions.length} questions`)
      return NextResponse.json(questions)
    }
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

