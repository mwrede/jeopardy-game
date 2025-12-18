import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyUser, createUser } from '@/lib/auth'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignup: { label: 'Is Signup', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Check if this is a signup or login
        if (credentials.isSignup === 'true') {
          // Sign up
          const user = await createUser(
            credentials.username,
            credentials.password,
            credentials.name || credentials.username
          )

          if (!user) {
            return null
          }

          return {
            id: user.id,
            email: user.username,
            name: user.name,
            image: null,
          }
        } else {
          // Login
          const user = await verifyUser(credentials.username, credentials.password)

          if (!user) {
            return null
          }

          return {
            id: user.id,
            email: user.username,
            name: user.name,
            image: null,
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || ''
        session.user.email = token.email || ''
        session.user.name = token.name || ''
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
