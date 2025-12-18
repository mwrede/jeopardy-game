'use client'

import { useState } from 'react'

export default function Instructions() {
  const [showInstructions, setShowInstructions] = useState(true)

  if (!showInstructions) {
    return (
      <button
        onClick={() => setShowInstructions(true)}
        className="mb-4 text-roboflow-purple hover:text-roboflow-blue font-semibold underline"
      >
        Show Instructions
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-r from-roboflow-purple to-roboflow-blue text-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">How to Play</h2>
        <button
          onClick={() => setShowInstructions(false)}
          className="text-white hover:text-gray-200 font-bold text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-sm">
          2 Categories are work related, and 1 is just for fun! A well rounded individual. The game is just like jeopardy, and no contestants because well I'm not fully there at realtime servers, but it's you against the clock. So be fast, and right.
        </p>

        <p className="font-semibold text-lg">
          There will be points, and I plan to give the winner a singular lenny!
        </p>
      </div>
    </div>
  )
}
