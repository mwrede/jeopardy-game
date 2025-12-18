'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  try {
    return <SessionProvider>{children}</SessionProvider>
  } catch (error) {
    // If SessionProvider fails, still render children
    // This prevents the entire app from crashing
    console.error('AuthProvider error:', error)
    return <>{children}</>
  }
}
