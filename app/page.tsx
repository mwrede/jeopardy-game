'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Instructions from '@/components/Instructions'
import GameBoard from '@/components/GameBoard'
import { supabase } from '@/lib/supabase'

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

          // Fetch user's most recent score (not just best score from leaderboard)
          if (session?.user?.id) {
            try {
              const mostRecentResponse = await fetch('/api/game/most-recent')
              if (mostRecentResponse.ok) {
                const mostRecentData = await mostRecentResponse.json()
                if (mostRecentData && mostRecentData.score !== undefined) {
                  console.log('Most recent game score:', mostRecentData)
                  setFinalScore(mostRecentData.score)
                }
              }
            } catch (error) {
              console.error('Failed to fetch most recent score:', error)
            }
          }

          // Fetch leaderboard - get all entries
          const leaderboardResponse = await fetch(`/api/leaderboard?t=${Date.now()}`, {
            cache: 'no-store',
          })
          const leaderboardData = await leaderboardResponse.json()
          setLeaderboard(leaderboardData) // Show all entries

          // Find user's rank from leaderboard
          if (session?.user?.id) {
            const userEntry = leaderboardData.find((entry: any) => entry.user_id === session.user?.id)
            if (userEntry) {
              setUserRank(userEntry.rank || null)
              // Only update score if we didn't get it from most recent
              if (finalScore === 0 && userEntry.score) {
                setFinalScore(userEntry.score)
              }
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

  const fetchLeaderboard = async () => {
    try {
      // Add cache-busting timestamp to ensure fresh data from Supabase
      const timestamp = Date.now()
      console.log(`[${timestamp}] Fetching leaderboard from Supabase...`)
      
      const leaderboardResponse = await fetch(`/api/leaderboard?t=${timestamp}`, {
        cache: 'no-store', // Force no caching
      })
      
      if (!leaderboardResponse.ok) {
        throw new Error(`Failed to fetch leaderboard: ${leaderboardResponse.statusText}`)
      }
      
      const leaderboardData = await leaderboardResponse.json()
      console.log(`[${timestamp}] Leaderboard fetched:`, { 
        count: leaderboardData.length,
        user_ids: leaderboardData.map((e: any) => e.user_id)
      })
      
      setLeaderboard(leaderboardData) // Show all entries, not just top 3

      // Find user's rank from leaderboard data
      if (session?.user?.id) {
        const userEntry = leaderboardData.find((entry: any) => entry.user_id === session.user?.id)
        if (userEntry) {
          console.log(`[${timestamp}] User rank found:`, userEntry.rank, 'score:', userEntry.score)
          setUserRank(userEntry.rank || null)
        } else {
          console.warn(`[${timestamp}] User ${session.user.id} not found in leaderboard`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }

  const handleGameComplete = async (score: number) => {
    console.log('handleGameComplete called with score:', score)
    setFinalScore(score)
    setGameCompleted(true)
    setSaving(true)

    try {
      console.log('Saving game score to Supabase:', score)
      const saveResponse = await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || `Failed to save score: ${saveResponse.statusText}`
        console.error('Save failed:', errorMessage)
        throw new Error(errorMessage)
      }

      const saveResult = await saveResponse.json()
      console.log('Game saved successfully:', saveResult)

      // Wait a bit longer for Supabase to process the insert and ensure it's available
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch leaderboard after saving to get updated rankings - force fresh data
      console.log('Fetching updated leaderboard after game save...')
      await fetchLeaderboard()
      
      // Fetch again after another short delay to ensure data is fully propagated
      await new Promise(resolve => setTimeout(resolve, 1000))
      await fetchLeaderboard()
      
      console.log('Leaderboard updated after game completion')
    } catch (error) {
      console.error('Failed to save score:', error)
      alert('Failed to save your score. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Auto-refresh leaderboard when game is completed
  useEffect(() => {
    if (gameCompleted && !saving) {
      console.log('Game completed, setting up leaderboard auto-refresh and realtime subscription')
      
      // Set up realtime subscription to games table
      const channel = supabase
        .channel('games-changes-results')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'games',
          },
          (payload) => {
            console.log('New game inserted via realtime on results page:', payload.new)
            // Refresh leaderboard when a new game is saved
            fetchLeaderboard()
          }
        )
        .subscribe()

      // Refresh immediately with a delay to ensure data is available
      const immediateRefresh = setTimeout(() => {
        console.log('Immediate leaderboard refresh after game completion')
        fetchLeaderboard()
      }, 2000)

      // Refresh again after a bit more time
      const secondRefresh = setTimeout(() => {
        console.log('Second leaderboard refresh after game completion')
        fetchLeaderboard()
      }, 4000)

      // Set up auto-refresh every 3 seconds as a fallback
      const interval = setInterval(() => {
        console.log('Auto-refreshing leaderboard (fallback)...')
        fetchLeaderboard()
      }, 3000)

      // Also refresh when page comes into focus
      const handleFocus = () => {
        console.log('Page focused, refreshing leaderboard')
        fetchLeaderboard()
      }
      window.addEventListener('focus', handleFocus)

      return () => {
        // Clean up subscription and intervals
        supabase.removeChannel(channel)
        clearTimeout(immediateRefresh)
        clearTimeout(secondRefresh)
        clearInterval(interval)
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [gameCompleted, saving, session])

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

        {gameCompleted || hasPlayedToday ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold mb-6 text-purple-800">Game Complete!</h2>
              <div className={`text-7xl font-bold mb-2 ${finalScore >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                ${finalScore.toLocaleString()}
              </div>
              {userRank !== null && (
                <div className="mb-4">
                  <p className="text-3xl font-bold text-purple-600">
                    Rank: #{userRank}
                  </p>
                </div>
              )}
              {saving ? (
                <p className="text-gray-600 mb-6">Saving your score...</p>
              ) : (
                <p className="text-gray-600 mb-6">
                  {hasPlayedToday ? "You've already played today! View the leaderboard to see all players." : "Your score has been saved to the leaderboard!"}
                </p>
              )}
            </div>

            {!saving && leaderboard.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-center mb-4 text-purple-800">All Players</h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr className="bg-purple-100 border-b-2 border-purple-300">
                        <th className="text-left py-4 px-6 font-bold text-purple-800 w-24">Rank</th>
                        <th className="text-left py-4 px-6 font-bold text-purple-800">First Name</th>
                        <th className="text-right py-4 px-6 font-bold text-purple-800">Score</th>
                        <th className="text-center py-4 px-6 font-bold text-purple-800">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => {
                        const isCurrentUser = session?.user?.id === entry.user_id
                        const firstName = entry.name.split(' ')[0]
                        return (
                          <tr
                            key={entry.user_id}
                            className={`border-b border-gray-200 transition-colors ${
                              entry.rank === 1
                                ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white'
                                : entry.rank === 2
                                ? 'bg-gradient-to-r from-purple-300 to-purple-400 text-white'
                                : entry.rank === 3
                                ? 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900'
                                : 'bg-white text-gray-800 hover:bg-purple-50'
                            } ${isCurrentUser ? 'ring-2 ring-purple-600' : ''}`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {entry.rank === 1 ? (
                                  <span className="text-2xl font-bold">🥇 #1</span>
                                ) : entry.rank === 2 ? (
                                  <span className="text-2xl font-bold">🥈 #2</span>
                                ) : entry.rank === 3 ? (
                                  <span className="text-2xl font-bold">🥉 #3</span>
                                ) : (
                                  <span className="font-bold text-lg">#{entry.rank}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-lg">
                                {firstName}
                                {isCurrentUser && (
                                  <span className="ml-2 text-sm opacity-75">(You)</span>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-bold text-xl">${entry.score.toLocaleString()}</span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              {entry.has_finished ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                  ✓ Finished
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                                  In Progress
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                    </div>
                  </div>
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
        ) : hasPlayedToday ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-purple-800">You&apos;ve Already Played Today!</h2>
            <p className="text-gray-600 mb-6">Check the leaderboard to see your rank and all players.</p>
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        ) : (
          <GameBoard onGameComplete={handleGameComplete} />
        )}
      </div>
    </div>
  )
}
