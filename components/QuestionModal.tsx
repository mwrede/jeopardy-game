'use client'

import { useState, useEffect, useRef } from 'react'
import { type Clue } from '@/lib/gameData'

interface QuestionModalProps {
  clue: Clue
  onAnswer: (pointsEarned: number) => void
  onClose: () => void
  currentScore: number
}

export default function QuestionModal({ clue, onAnswer, onClose, currentScore }: QuestionModalProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isDontKnow, setIsDontKnow] = useState(false)
  const [showDailyDoubleWager, setShowDailyDoubleWager] = useState(clue.isDailyDouble || false)
  const [wager, setWager] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxWager = currentScore < 2000 ? 2000 : currentScore

  useEffect(() => {
    if (!showDailyDoubleWager && !showResult) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [showDailyDoubleWager, showResult])

  useEffect(() => {
    if (!showDailyDoubleWager) {
      inputRef.current?.focus()
    }
  }, [showDailyDoubleWager])

  const currentValue = clue.isDailyDouble ? wager : clue.value
  const pointsPerSecond = currentValue / 15
  const pointsLost = Math.min(timeElapsed * pointsPerSecond, currentValue)

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

  const checkAnswer = () => {
    const normalized = normalizeAnswer(userAnswer)
    const correctNormalized = normalizeAnswer(clue.answer)

    const correct = normalized === correctNormalized || correctNormalized.includes(normalized) || normalized.includes(correctNormalized)
    setIsCorrect(correct)
    setShowResult(true)

    setTimeout(() => {
      if (correct) {
        const earned = Math.round(Math.max(0, currentValue - pointsLost))
        onAnswer(earned)
      } else {
        onAnswer(-Math.round(currentValue))
      }
    }, 2000)
  }

  const handleDontKnow = () => {
    setIsDontKnow(true)
    setIsCorrect(false)
    setShowResult(true)

    setTimeout(() => {
      onAnswer(0) // No points lost for "I Don't Know"
    }, 2000)
  }

  const handleDailyDoubleSubmit = () => {
    const minWager = 0
    if (wager < minWager || wager > maxWager) {
      alert(`Wager must be between $${minWager.toLocaleString()} and $${maxWager.toLocaleString()}`)
      return
    }
    setShowDailyDoubleWager(false)
  }

  if (showDailyDoubleWager) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <h2 className="text-5xl font-bold text-white mb-6 animate-pulse">DAILY DOUBLE!</h2>
          <p className="text-white text-lg mb-6">
            How much would you like to wager?
          </p>
          <p className="text-white text-sm mb-4">
            (Minimum: $0 • Maximum: ${maxWager.toLocaleString()})
          </p>
          <input
            type="number"
            min="0"
            max={maxWager}
            value={wager || ''}
            onChange={(e) => setWager(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 text-2xl text-center rounded-lg border-4 border-white font-bold mb-6"
            placeholder="Enter wager"
            autoFocus
          />
          <button
            onClick={handleDailyDoubleSubmit}
            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors text-xl"
          >
            Lock In Wager
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 rounded-lg shadow-2xl max-w-3xl w-full">
        <div className="flex justify-between items-start mb-6">
          <div className="text-purple-100 text-2xl font-bold">
            ${currentValue.toLocaleString()}
          </div>
          <div className="text-right">
            <div className="text-white text-sm">Time Elapsed</div>
            <div className="text-purple-100 text-2xl font-bold">{timeElapsed}s</div>
            <div className="text-red-300 text-sm">-${Math.round(pointsLost).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg mb-6">
          {clue.isImage && clue.imagePath ? (
            <div className="flex justify-center">
              <img
                src={clue.imagePath}
                alt="Rebus puzzle"
                className="max-w-full max-h-96 object-contain rounded"
              />
            </div>
          ) : (
            <p className="text-2xl text-center font-semibold text-gray-800">{clue.question}</p>
          )}
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              className="w-full px-4 py-3 text-lg rounded-lg border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="What is...?"
            />

            <div className="flex gap-4">
              <button
                onClick={checkAnswer}
                className={`${clue.isDailyDouble ? 'w-full' : 'flex-1'} bg-purple-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-800 transition-colors`}
              >
                Submit Answer
              </button>
              {!clue.isDailyDouble && (
                <button
                  onClick={handleDontKnow}
                  className="flex-1 bg-purple-300 text-purple-900 font-bold py-3 px-6 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  I Don&apos;t Know
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {!isDontKnow && (
              <div className={`text-4xl font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                {isCorrect ? 'CORRECT!' : 'INCORRECT'}
              </div>
            )}
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 text-sm mb-2">Correct answer:</p>
              <p className="text-xl font-semibold text-gray-800">{clue.answer}</p>
            </div>
            {isCorrect && (
              <p className="text-green-300 text-2xl font-bold">
                +${Math.round(Math.max(0, currentValue - pointsLost)).toLocaleString()}
              </p>
            )}
            {!isCorrect && !isDontKnow && (
              <p className="text-red-300 text-2xl font-bold">
                -${currentValue.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
