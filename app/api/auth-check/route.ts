import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    google: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 30) || 'missing',
    },
    nextAuth: {
      hasUrl: !!process.env.NEXTAUTH_URL,
      url: process.env.NEXTAUTH_URL || 'missing',
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'missing',
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL || 'missing'}/api/auth/callback/google`,
  }

  return NextResponse.json(checks, { status: 200 })
}

