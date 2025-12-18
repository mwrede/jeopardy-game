import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL || ''
  const expectedCallbackUrl = `${nextAuthUrl}/api/auth/callback/google`
  
  const checks = {
    google: {
      hasClientId: !!(process.env.NEW_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID),
      hasClientSecret: !!(process.env.NEW_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET),
      clientIdPrefix: (process.env.NEW_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)?.substring(0, 30) || 'missing',
      usingNewPrefix: !!process.env.NEW_GOOGLE_CLIENT_ID,
    },
    nextAuth: {
      hasUrl: !!process.env.NEXTAUTH_URL,
      url: process.env.NEXTAUTH_URL || 'missing',
      urlLength: process.env.NEXTAUTH_URL?.length || 0,
      hasTrailingSlash: process.env.NEXTAUTH_URL?.endsWith('/') || false,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'missing',
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    redirectUri: {
      expected: expectedCallbackUrl,
      instructions: 'Copy this EXACT URL to Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs',
      mustMatch: 'The redirect URI in Google Cloud Console must match this EXACTLY (no trailing slash, correct path)',
    },
  }

  return NextResponse.json(checks, { status: 200 })
}

