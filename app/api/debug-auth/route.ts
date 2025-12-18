import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'missing',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
  })
}

