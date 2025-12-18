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
  providers: [
    GoogleProvider({
      clientId: clientId,
      clientSecret: clientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        // Create or update user in Supabase
        try {
          await createOrUpdateUser(
            user.email,
            user.email,
            user.name || null,
            user.image || null
          )
        } catch (error) {
          console.error('Error creating/updating user:', error)
          // Don't block sign-in if user creation fails
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.email || user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
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

