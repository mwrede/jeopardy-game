import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createOrUpdateUser } from '@/lib/supabaseDb'

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        name: { label: 'Full Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.name) {
          return null
        }

        const username = credentials.username.trim()
        const name = credentials.name.trim()

        if (username.length === 0 || name.length === 0) {
          return null
        }

        try {
          // Check if username already exists (must be unique)
          const { getUserByUsername } = await import('@/lib/supabaseDb')
          const existingUser = await getUserByUsername(username)
          
          if (existingUser && existingUser.id !== username) {
            // Username is taken by a different user
            throw new Error(`Username "${username}" is already taken. Please choose a different username.`)
          }

          // Create or update user in Supabase
          // Use username as the ID
          await createOrUpdateUser(username, name, null)

          return {
            id: username,
            name: name,
            email: null,
            image: null,
          }
        } catch (error) {
          console.error('Error creating/updating user:', error)
          // Return error message to show to user
          if (error instanceof Error && error.message.includes('already taken')) {
            throw error // Re-throw to show to user
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Use username as the user ID
        token.sub = user.id
        token.name = user.name
        token.email = user.email || null
        token.picture = user.image || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Use username as the user ID
        session.user.id = token.sub || ''
        session.user.name = token.name || ''
        session.user.email = token.email || null
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

