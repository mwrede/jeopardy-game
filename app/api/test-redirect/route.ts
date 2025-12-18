import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Get the exact redirect URI that NextAuth would use
  const nextAuthUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '') || ''
  const redirectUri = `${nextAuthUrl}/api/auth/callback/google`
  
  return NextResponse.json({
    message: 'Copy this EXACT redirect URI to Google Cloud Console',
    redirectUri: redirectUri,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    cleanedNextAuthUrl: nextAuthUrl,
    instructions: [
      '1. Go to https://console.cloud.google.com/apis/credentials',
      '2. Click on your OAuth 2.0 Client ID',
      '3. Under "Authorized redirect URIs", click "+ ADD URI"',
      '4. Paste the redirectUri value above (the one in quotes)',
      '5. Click "SAVE"',
      '6. Wait 2-3 minutes',
      '7. Try signing in again'
    ],
    commonMistakes: [
      '❌ Adding a trailing slash: https://raccoonjeopardy.vercel.app/api/auth/callback/google/',
      '❌ Wrong path: /api/auth/callback (missing /google)',
      '❌ HTTP instead of HTTPS: http://raccoonjeopardy.vercel.app/...',
      '❌ Extra spaces or characters',
      '✅ Correct: https://raccoonjeopardy.vercel.app/api/auth/callback/google'
    ]
  }, { status: 200 })
}

