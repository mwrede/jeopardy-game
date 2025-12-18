'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface LeaderboardEntry {
  user_id: string
  name: string
  image: string | null
  score: number
  completed_at: string
  rank: number
  has_finished: boolean
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        // Add cache-busting timestamp and no-cache headers to ensure fresh data
        const response = await fetch(`/api/leaderboard?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setLeaderboard(Array.isArray(data) ? data : [])
        console.log('Leaderboard data:', data)

        // Find user's rank from the data
        if (session?.user?.id) {
          const userEntry = data.find((entry: LeaderboardEntry) => entry.user_id === session.user?.id)
          setUserRank(userEntry?.rank || null)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        setError(error instanceof Error ? error.message : 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchLeaderboard()
      
      // Refresh every 5 seconds to get latest data from Supabase
      const interval = setInterval(() => {
        fetchLeaderboard()
      }, 5000)
      
      // Also refresh when page comes into focus
      const handleFocus = () => {
        fetchLeaderboard()
      }
      window.addEventListener('focus', handleFocus)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('focus', handleFocus)
      }
    } else {
      setLoading(false)
    }
  }, [session])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-roboflow-purple to-roboflow-blue">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-purple-800">
            Today&apos;s Leaderboard
          </h1>
          {userRank !== null && (
            <p className="text-center text-lg text-purple-600 font-semibold mb-6">
              Your Rank: #{userRank}
            </p>
          )}

          {loading ? (
            <div className="text-center text-gray-600 py-12">
              <p className="text-xl">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-12">
              <p className="text-xl mb-4">Error loading leaderboard</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <p className="text-xl mb-4">No scores yet today!</p>
              <p>Be the first to play and claim the top spot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
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
          )}

          {leaderboard.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Winner gets a singular golden lenny! ( ͡° ͜ʖ ͡°)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
