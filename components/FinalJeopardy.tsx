'use client'

import { useState } from 'react'

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

interface FinalJeopardyProps {
  currentScore: number
  onComplete: (finalScore: number) => void
  finalJeopardy: Question
}

export default function FinalJeopardy({ currentScore, onComplete, finalJeopardy }: FinalJeopardyProps) {
  const [stage, setStage] = useState<'wager' | 'answer' | 'result'>('wager')
  const [wager, setWager] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)

  const maxWager = Math.max(2000, currentScore > 0 ? currentScore : 0)

  const handleWagerSubmit = () => {
    if (wager < 0 || wager > maxWager) {
      alert(`Wager must be between $0 and $${maxWager.toLocaleString()}`)
      return
    }
    setStage('answer')
  }

  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .replace(/^what is /i, '')
      .replace(/^who is /i, '')
      .replace(/^what are /i, '')
      .replace(/^who are /i, '')
      .replace(/^where is /i, '')
      .replace(/\?/g, '')
      .replace(/[()]/g, '')
      .trim()
  }

  const handleAnswerSubmit = () => {
    const normalized = normalizeAnswer(userAnswer)
    const correctNormalized = normalizeAnswer(finalJeopardy.answer)

    const correct = normalized === correctNormalized ||
                   correctNormalized.includes(normalized) ||
                   normalized.includes(correctNormalized)

    setIsCorrect(correct)
    setStage('result')

    // Round to ensure score is always an integer
    const finalScore = Math.round(correct ? currentScore + wager : currentScore - wager)
    console.log('===== FINAL JEOPARDY SCORE CALCULATION =====')
    console.log('Cumulative score before Final Jeopardy:', currentScore)
    console.log('Wager:', wager)
    console.log('Answer correct?', correct)
    console.log('Calculation:', correct ? `${currentScore} + ${wager}` : `${currentScore} - ${wager}`)
    console.log('FINAL SCORE TO BE SAVED:', finalScore)
    console.log('============================================')

    setTimeout(() => {
      console.log('Passing final score to save:', finalScore)
      onComplete(finalScore)
    }, 3000)
  }

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-purple-800 to-purple-950 p-8 rounded-lg shadow-2xl">
      <h1 className="text-5xl font-bold text-center text-purple-200 mb-8">FINAL JEOPARDY</h1>

      {stage === 'wager' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-gray-600 text-sm mb-2">Category:</p>
            <p className="text-3xl font-bold text-center text-purple-800">{finalJeopardy.category}</p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <p className="text-white text-center mb-4">Current Score: ${currentScore.toLocaleString()}</p>
            <p className="text-white text-center text-sm mb-6">
              How much would you like to wager? (Maximum: ${maxWager.toLocaleString()})
            </p>
            <input
              type="number"
              min="0"
              max={maxWager}
              value={wager || ''}
              onChange={(e) => setWager(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 text-2xl text-center rounded-lg border-4 border-purple-300 font-bold mb-6"
              placeholder="Enter wager"
              autoFocus
            />
            <button
              onClick={handleWagerSubmit}
              className="w-full bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-400 transition-colors text-xl"
            >
              Lock In Wager
            </button>
          </div>
        </div>
      )}

      {stage === 'answer' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-gray-600 text-sm mb-2">Category: {finalJeopardy.category}</p>
            {finalJeopardy.is_image && finalJeopardy.image_path ? (
              <div className="mb-6 flex justify-center">
                <img
                  src={finalJeopardy.image_path}
                  alt="Final Jeopardy clue"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            ) : (
              <p className="text-2xl text-center font-semibold text-gray-800 mb-6">{finalJeopardy.clue}</p>
            )}
            <p className="text-center text-purple-600 font-bold">Wager: ${wager.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
              className="w-full px-4 py-3 text-lg rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="What is...?"
              autoFocus
            />
            <button
              onClick={handleAnswerSubmit}
              className="w-full bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors text-xl"
            >
              Submit Final Answer
            </button>
          </div>
        </div>
      )}

      {stage === 'result' && (
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className={`text-6xl font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {isCorrect ? 'CORRECT!' : 'INCORRECT'}
          </div>

          <div className="bg-white p-6 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Correct answer:</p>
            <p className="text-2xl font-semibold text-gray-800">{finalJeopardy.answer}</p>
          </div>

          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <p className="text-white text-lg mb-2">Starting Score: ${currentScore.toLocaleString()}</p>
            <p className="text-white text-lg mb-2">Wager: ${wager.toLocaleString()}</p>
            <div className="border-t-2 border-purple-300 my-4"></div>
            <p className={`text-4xl font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              Final Score: ${(isCorrect ? currentScore + wager : currentScore - wager).toLocaleString()}
            </p>
          </div>

          <p className="text-purple-200 text-sm">Saving your score and redirecting...</p>
        </div>
      )}
    </div>
  )
}
