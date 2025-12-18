'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!session) return null

  return (
    <nav className="bg-white shadow-md border-b-4 border-roboflow-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/lenny.png" 
                alt="Jeopardy" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`font-semibold transition-colors ${
                pathname === '/' ? 'text-roboflow-purple' : 'text-gray-600 hover:text-roboflow-purple'
              }`}
            >
              Today&apos;s Game
            </Link>

            <Link
              href="/leaderboard"
              className={`font-semibold transition-colors ${
                pathname === '/leaderboard' ? 'text-roboflow-purple' : 'text-gray-600 hover:text-roboflow-purple'
              }`}
            >
              Leaderboard
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-roboflow-purple"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-roboflow-purple text-white flex items-center justify-center font-bold">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                      <p className="text-xs text-gray-600">{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
