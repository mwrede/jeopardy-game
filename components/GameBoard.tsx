'use client'

import { useState, useEffect } from 'react'
import { type Category, type Clue } from '@/lib/gameData'
import QuestionModal from './QuestionModal'
import FinalJeopardy from './FinalJeopardy'

interface Question {
  id: number
  game_date: string
  category: string
  question_type: string
  value: number | null
  type: string | null
  clue: string
  answer: string
  is_daily_double: boolean
  is_image: boolean
  image_path: string | null
}

export default function GameBoard({ onGameComplete }: { onGameComplete: (score: number) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answeredClues, setAnsweredClues] = useState<Set<string>>(new Set())
  const [currentClue, setCurrentClue] = useState<{ clue: Clue; categoryIndex: number; clueIndex: number } | null>(null)
  const [score, setScore] = useState(0)
  const [showFinalJeopardy, setShowFinalJeopardy] = useState(false)
  const [finalJeopardy, setFinalJeopardy] = useState<Question | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching questions from Supabase...')
        
        // Fetch regular questions
        const response = await fetch('/api/questions')
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch questions: ${response.statusText}`)
        }
        const questions: Question[] = await response.json()
        
        console.log(`Fetched ${questions.length} questions from Supabase`)

        // Fetch Final Jeopardy
        const finalResponse = await fetch('/api/questions?type=final')
        if (finalResponse.ok) {
          const final = await finalResponse.json()
          if (final && final.id) {
            setFinalJeopardy(final)
            console.log('Final Jeopardy loaded:', final.category)
          }
        }

        // Group questions by category
        const categoryMap = new Map<string, Clue[]>()
        
        questions.forEach((q) => {
          if (q.question_type === 'Jeopardy Round') {
            if (!categoryMap.has(q.category)) {
              categoryMap.set(q.category, [])
            }
            
            const clue: Clue = {
              question: q.clue,
              answer: q.answer,
              value: q.value || 0,
              isDailyDouble: q.is_daily_double,
              isImage: q.is_image,
              imagePath: q.image_path || undefined,
            }
            
            categoryMap.get(q.category)!.push(clue)
          }
        })

        console.log(`Grouped into ${categoryMap.size} categories`)

        // Convert to Category array and sort clues by value
        const categoriesArray: Category[] = Array.from(categoryMap.entries()).map(([name, clues]) => ({
          name,
          clues: clues.sort((a, b) => a.value - b.value),
        }))

        if (categoriesArray.length === 0) {
          setError('No questions found in Supabase for today. Please check that questions exist in the questions table with today\'s date.')
        } else {
          setCategories(categoriesArray)
        }
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError(err instanceof Error ? err.message : 'Failed to load questions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const totalClues = categories.reduce((acc, cat) => acc + cat.clues.length, 0)
  const allCluesAnswered = categories.length > 0 && answeredClues.size === totalClues && totalClues > 0

  useEffect(() => {
    if (allCluesAnswered && !showFinalJeopardy && finalJeopardy) {
      setShowFinalJeopardy(true)
    }
  }, [allCluesAnswered, showFinalJeopardy, finalJeopardy])

  const handleClueClick = (categoryIndex: number, clueIndex: number) => {
    const key = `${categoryIndex}-${clueIndex}`
    if (answeredClues.has(key)) return

    const clue = categories[categoryIndex].clues[clueIndex]
    setCurrentClue({ clue, categoryIndex, clueIndex })
  }

  const handleAnswer = (pointsEarned: number) => {
    if (currentClue) {
      const key = `${currentClue.categoryIndex}-${currentClue.clueIndex}`
      setAnsweredClues(new Set([...answeredClues, key]))
      // Round to ensure score is always an integer
      const newScore = Math.round(score + pointsEarned)
      console.log(`Score update: ${score} + ${pointsEarned} = ${newScore}`)
      setScore(newScore)
    }
    setCurrentClue(null)
  }

  const handleFinalJeopardyComplete = (finalScore: number) => {
    console.log('Final Jeopardy complete - passing final score to game:', finalScore)
    onGameComplete(finalScore)
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl text-gray-600">Loading questions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl text-red-600 mb-4">Error loading questions</p>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl text-gray-600">No questions available for today.</p>
      </div>
    )
  }

  if (showFinalJeopardy && finalJeopardy) {
    console.log('Entering Final Jeopardy with cumulative score:', score)
    return (
      <FinalJeopardy
        currentScore={score}
        onComplete={handleFinalJeopardyComplete}
        finalJeopardy={finalJeopardy}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-800">Today&apos;s Game</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Score</p>
            <p className={`text-4xl font-bold ${score >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              ${score.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-2">
              <div className="bg-gradient-to-r from-purple-700 to-purple-800 text-white p-4 rounded-lg text-center shadow-md">
                <h3 className="font-bold text-lg uppercase">{category.name}</h3>
              </div>
              {category.clues.map((clue, clueIndex) => {
                const key = `${categoryIndex}-${clueIndex}`
                const isAnswered = answeredClues.has(key)

                return (
                  <button
                    key={clueIndex}
                    onClick={() => handleClueClick(categoryIndex, clueIndex)}
                    disabled={isAnswered}
                    className={`w-full p-6 rounded-lg font-bold text-2xl transition-all ${
                      isAnswered
                        ? 'bg-purple-200 text-purple-400 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isAnswered ? '—' : `$${clue.value}`}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {currentClue && (
        <QuestionModal
          clue={currentClue.clue}
          onAnswer={handleAnswer}
          onClose={() => setCurrentClue(null)}
          currentScore={score}
        />
      )}
    </div>
  )
}
