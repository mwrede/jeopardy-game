'use client'

import { useState, useEffect } from 'react'
import { getTodaysGame, FINAL_JEOPARDY, type Category, type Clue } from '@/lib/gameData'
import QuestionModal from './QuestionModal'
import FinalJeopardy from './FinalJeopardy'

export default function GameBoard({ onGameComplete }: { onGameComplete: (score: number) => void }) {
  const [categories] = useState<Category[]>(getTodaysGame())
  const [answeredClues, setAnsweredClues] = useState<Set<string>>(new Set())
  const [currentClue, setCurrentClue] = useState<{ clue: Clue; categoryIndex: number; clueIndex: number } | null>(null)
  const [score, setScore] = useState(0)
  const [showFinalJeopardy, setShowFinalJeopardy] = useState(false)

  const allCluesAnswered = answeredClues.size === categories.reduce((acc, cat) => acc + cat.clues.length, 0)

  useEffect(() => {
    if (allCluesAnswered && !showFinalJeopardy) {
      setShowFinalJeopardy(true)
    }
  }, [allCluesAnswered, showFinalJeopardy])

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
      setScore(score + pointsEarned)
    }
    setCurrentClue(null)
  }

  const handleFinalJeopardyComplete = (finalScore: number) => {
    onGameComplete(finalScore)
  }

  if (showFinalJeopardy) {
    return <FinalJeopardy currentScore={score} onComplete={handleFinalJeopardyComplete} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-800">Today's Game</h2>
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
