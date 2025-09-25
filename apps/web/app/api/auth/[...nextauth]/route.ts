import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import apiClient from '@/lib/api-client'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await apiClient.auth.login({
            email: credentials.email,
            password: credentials.password
          })

          if (response.error || !response.data) {
            return null
          }

          const { user, token } = response.data

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            subscription: user.subscription,
            accessToken: token
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.role = user.role
        token.subscription = user.subscription
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.role = token.role
      session.user.subscription = token.subscription
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }