import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createOrUpdateUser } from '@/lib/supabaseDb'

// Validate Google OAuth credentials
const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!clientId) {
  console.error('Missing GOOGLE_CLIENT_ID environment variable')
  throw new Error('GOOGLE_CLIENT_ID is required')
}
if (!clientSecret) {
  console.error('Missing GOOGLE_CLIENT_SECRET environment variable')
  throw new Error('GOOGLE_CLIENT_SECRET is required')
}

// Log for debugging (first few chars only for security)
console.log('Google OAuth Config:', {
  hasClientId: !!clientId,
  hasClientSecret: !!clientSecret,
  clientIdPrefix: clientId?.substring(0, 20),
})

export const authOptions: AuthOptions = {
  // Explicitly set the base URL for OAuth callbacks
  // This ensures the callback URL is correct even if NEXTAUTH_URL has issues
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: clientId,
      clientSecret: clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign-in first - don't block on Supabase
      // Create or update user in Supabase asynchronously (fire and forget)
      if (account?.provider === 'google' && user.email) {
        // Don't await - run in background to avoid blocking authentication
        createOrUpdateUser(
          user.email, // Use email as the user ID
          user.email, // Email
          user.name || null,
          user.image || null
        )
          .then(() => {
            console.log('✅ User created/updated in Supabase:', user.email)
          })
          .catch((error) => {
            // Log error but don't block sign-in
            // This allows authentication to proceed even if Supabase is temporarily unavailable
            console.error('⚠️ Error creating/updating user in Supabase (non-blocking):', error)
          })
      }
      // Always return true to allow authentication
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Use email as the user ID
        token.sub = user.email || user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Ensure user.id is always the email (which is used as the ID in the database)
        session.user.id = token.email || token.sub || ''
        session.user.email = token.email || ''
        session.user.name = token.name || ''
        session.user.image = token.picture || null
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
}

