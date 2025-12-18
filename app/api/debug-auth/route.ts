import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const clientId = process.env.NEW_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.NEW_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
  
  return NextResponse.json({
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdPrefix: clientId?.substring(0, 20) || 'missing',
    usingNewPrefix: !!process.env.NEW_GOOGLE_CLIENT_ID,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    expectedCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
  })
}

