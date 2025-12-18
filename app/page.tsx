'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Instructions from '@/components/Instructions'
import GameBoard from '@/components/GameBoard'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gameCompleted, setGameCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    // Only redirect if we're sure the status is unauthenticated
    // Add a small delay to prevent immediate redirects during initialization
    if (status === 'unauthenticated') {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  useEffect(() => {
    const checkGameStatus = async () => {
      if (!session) {
        setCheckingStatus(false)
        return
      }

      try {
        const response = await fetch('/api/game/status')
        const data = await response.json()

        if (data.hasPlayed) {
          setHasPlayedToday(true)
          setGameCompleted(true)

          // Fetch leaderboard
          const leaderboardResponse = await fetch('/api/leaderboard')
          const leaderboardData = await leaderboardResponse.json()
          setLeaderboard(leaderboardData.slice(0, 3))

          // Find user's rank and score
          if (session?.user?.email) {
            const rank = leaderboardData.findIndex((entry: any) => entry.user_id === session.user?.email)
            setUserRank(rank !== -1 ? rank + 1 : null)

            const userEntry = leaderboardData.find((entry: any) => entry.user_id === session.user?.email)
            if (userEntry) {
              setFinalScore(userEntry.score)
            }
          }
        }
      } catch (error) {
        console.error('Failed to check game status:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setCheckingStatus(false)
    }, 5000) // 5 second timeout

    checkGameStatus()

    return () => clearTimeout(timeout)
  }, [session])

  const handleGameComplete = async (score: number) => {
    setFinalScore(score)
    setGameCompleted(true)
    setSaving(true)

    try {
      await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      })

      // Fetch leaderboard after saving
      const leaderboardResponse = await fetch('/api/leaderboard')
      const leaderboardData = await leaderboardResponse.json()
      setLeaderboard(leaderboardData.slice(0, 3)) // Get top 3

      // Find user's rank
      if (session?.user?.email) {
        const rank = leaderboardData.findIndex((entry: any) => entry.user_id === session.user?.email)
        setUserRank(rank !== -1 ? rank + 1 : null)
      }
    } catch (error) {
      console.error('Failed to save score:', error)
    } finally {
      setSaving(false)
    }
  }

  // Show loading state while checking auth
  // But don't wait forever - if it takes too long, show the page anyway
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  // If unauthenticated, the useEffect will redirect to /login
  // But we should still render something to prevent 404
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-roboflow-purple to-roboflow-blue">
        <div className="text-white text-2xl">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Instructions />

        {gameCompleted ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold mb-6 text-purple-800">Game Complete!</h2>
              <div className={`text-7xl font-bold mb-4 ${finalScore >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                ${finalScore.toLocaleString()}
              </div>
              {saving ? (
                <p className="text-gray-600 mb-6">Saving your score...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    {hasPlayedToday ? "You've already played today!" : "Your score has been saved to the leaderboard!"}
                  </p>
                  {userRank !== null && (
                    <p className="text-2xl font-bold text-purple-600 mb-6">
                      Your Rank: #{userRank}
                    </p>
                  )}
                </>
              )}
            </div>

            {!saving && leaderboard.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-center mb-4 text-purple-800">Top Players</h3>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = session?.user?.email === entry.user_id
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          index === 0
                            ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white'
                            : index === 1
                            ? 'bg-gradient-to-r from-purple-300 to-purple-400 text-white'
                            : 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900'
                        } ${isCurrentUser ? 'ring-4 ring-purple-600' : ''}`}
                      >
                        <div className="text-2xl font-bold w-12 text-center">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg">
                            {entry.name.split(' ')[0]}
                            {isCurrentUser && <span className="ml-2 text-sm">(You)</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${entry.score.toLocaleString()}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => router.push('/leaderboard')}
                className="w-full bg-purple-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-purple-700 transition-colors text-xl"
              >
                View Full Leaderboard
              </button>
            </div>
          </div>
        ) : (
          <GameBoard onGameComplete={handleGameComplete} />
        )}
      </div>
    </div>
  )
}
