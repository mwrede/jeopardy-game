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
      console.log(`[${timestamp}] ===== FETCHING LEADERBOARD =====`)

      const leaderboardResponse = await fetch(`/api/leaderboard?t=${timestamp}`, {
        cache: 'no-store', // Force no caching
      })

      console.log(`[${timestamp}] Response status:`, leaderboardResponse.status, leaderboardResponse.statusText)

      if (!leaderboardResponse.ok) {
        const errorText = await leaderboardResponse.text()
        console.error(`[${timestamp}] Leaderboard fetch failed:`, errorText)
        throw new Error(`Failed to fetch leaderboard: ${leaderboardResponse.statusText}`)
      }

      const leaderboardData = await leaderboardResponse.json()
      console.log(`[${timestamp}] Raw leaderboard data:`, leaderboardData)

      // Check if response has an error property
      if (leaderboardData.error) {
        console.error(`[${timestamp}] Leaderboard API returned error:`, leaderboardData.error, leaderboardData.details)
        throw new Error(leaderboardData.error)
      }

      // Ensure we have an array
      const validLeaderboard = Array.isArray(leaderboardData) ? leaderboardData : []

      console.log(`[${timestamp}] Leaderboard processed:`, {
        count: validLeaderboard.length,
        entries: validLeaderboard.map((e: any) => ({
          user_id: e.user_id,
          name: e.name,
          score: e.score,
          rank: e.rank
        }))
      })

      if (validLeaderboard.length > 0) {
        console.log(`[${timestamp}] ✅ Setting leaderboard with ${validLeaderboard.length} entries`)
        setLeaderboard(validLeaderboard) // Show all entries
      } else {
        console.warn(`[${timestamp}] ⚠️ Leaderboard is empty!`)
      }

      // Find user's rank from leaderboard data
      if (session?.user?.id) {
        const userEntry = validLeaderboard.find((entry: any) => entry.user_id === session.user?.id)
        if (userEntry) {
          console.log(`[${timestamp}] User rank found:`, userEntry.rank, 'score:', userEntry.score, 'name:', userEntry.name)
          setUserRank(userEntry.rank || null)
          // Update finalScore if it's different (in case leaderboard has more recent data)
          if (userEntry.score !== finalScore) {
            console.log(`[${timestamp}] Updating finalScore from ${finalScore} to ${userEntry.score}`)
            setFinalScore(userEntry.score)
          }
        } else {
          console.warn(`[${timestamp}] User ${session.user.id} not found in leaderboard. Available user_ids:`, validLeaderboard.map((e: any) => e.user_id))
        }
      }
    } catch (error) {
      console.error('❌ LEADERBOARD FETCH ERROR:', error)
      console.error('Error details:', error instanceof Error ? error.message : String(error))
      // Don't clear the leaderboard on error, keep what we have
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

      // Aggressively fetch leaderboard multiple times to ensure we get the update
      // The view might take a moment to reflect the new game
      console.log('Fetching updated leaderboard after game save...')
      
      // Fetch immediately
      await fetchLeaderboard()
      
      // Fetch multiple times with delays to catch the view update
      setTimeout(() => fetchLeaderboard(), 500)
      setTimeout(() => fetchLeaderboard(), 1000)
      setTimeout(() => fetchLeaderboard(), 2000)
      setTimeout(() => fetchLeaderboard(), 3000)
      setTimeout(() => fetchLeaderboard(), 5000)
      
      console.log('Leaderboard refresh scheduled multiple times')
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
      
      // Set up realtime subscription to submissions table for instant leaderboard updates
      const channel = supabase
        .channel('submissions-changes-results')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'submissions',
          },
          (payload) => {
            console.log('New submission inserted via realtime on results page:', payload.new)
            // Refresh leaderboard immediately when a new submission is saved
            fetchLeaderboard()
            setTimeout(() => fetchLeaderboard(), 500)
            setTimeout(() => fetchLeaderboard(), 1000)
          }
        )
        .subscribe()

      // Aggressively refresh multiple times to ensure we get the update
      const refresh1 = setTimeout(() => fetchLeaderboard(), 500)
      const refresh2 = setTimeout(() => fetchLeaderboard(), 1000)
      const refresh3 = setTimeout(() => fetchLeaderboard(), 2000)
      const refresh4 = setTimeout(() => fetchLeaderboard(), 3000)
      const refresh5 = setTimeout(() => fetchLeaderboard(), 5000)

      // Set up auto-refresh every 2 seconds as a fallback
      const interval = setInterval(() => {
        console.log('Auto-refreshing leaderboard (fallback)...')
        fetchLeaderboard()
      }, 2000)

      // Also refresh when page comes into focus
      const handleFocus = () => {
        console.log('Page focused, refreshing leaderboard')
        fetchLeaderboard()
      }
      window.addEventListener('focus', handleFocus)

      return () => {
        // Clean up subscription and intervals
        supabase.removeChannel(channel)
        clearTimeout(refresh1)
        clearTimeout(refresh2)
        clearTimeout(refresh3)
        clearTimeout(refresh4)
        clearTimeout(refresh5)
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

            {!saving && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-center mb-4 text-purple-800">All Players</h3>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>Loading leaderboard...</p>
                    <p className="text-sm mt-2">If this persists, check the browser console for errors.</p>
                  </div>
                ) : (
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
                )}
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
