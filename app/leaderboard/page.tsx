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
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        const data = await response.json()
        setLeaderboard(data)

        // Find user's rank
        if (session?.user?.email) {
          const rank = data.findIndex((entry: LeaderboardEntry) => entry.user_id === session.user?.email)
          setUserRank(rank !== -1 ? rank + 1 : null)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchLeaderboard()
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
            <div className="text-center text-gray-600">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <p className="text-xl mb-4">No scores yet today!</p>
              <p>Be the first to play and claim the top spot.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = session?.user?.email === entry.user_id
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      index === 0
                        ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg'
                        : index === 1
                        ? 'bg-gradient-to-r from-purple-300 to-purple-400 text-white'
                        : index === 2
                        ? 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900'
                        : 'bg-purple-50 text-gray-800'
                    } ${isCurrentUser ? 'ring-4 ring-purple-600' : ''}`}
                  >
                  <div className="text-2xl font-bold w-12 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt={entry.name}
                        className="w-12 h-12 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-2 border-white">
                        {entry.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg">{entry.name}</p>
                      <p className="text-sm opacity-75">
                        {new Date(entry.completed_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">${entry.score.toLocaleString()}</p>
                    {isCurrentUser && (
                      <p className="text-sm font-semibold opacity-90">You</p>
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          )}

          {leaderboard.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Winner gets a singular lenny! ( ͡° ͜ʖ ͡°)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
