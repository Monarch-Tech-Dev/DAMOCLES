import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// Vipps provider configuration
const VippsProvider = {
  id: 'vipps',
  name: 'Vipps',
  type: 'oauth' as const,
  authorization: {
    url: 'https://api.vipps.no/access-management-1.0/access/oauth2/auth',
    params: {
      scope: 'openid name phoneNumber',
      response_type: 'code',
      ui_locales: 'no',
    },
  },
  token: 'https://api.vipps.no/access-management-1.0/access/oauth2/token',
  userinfo: 'https://api.vipps.no/access-management-1.0/access/userinfo',
  clientId: process.env.VIPPS_CLIENT_ID,
  clientSecret: process.env.VIPPS_CLIENT_SECRET,
  issuer: 'https://api.vipps.no/access-management-1.0/access/',
  checks: ['state'],
  profile(profile: any) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email || `${profile.phone_number}@vipps.user`,
      image: null,
      vippsVerified: true,
      phoneNumber: profile.phone_number,
    };
  },
};

// BankID provider configuration (disabled for MVP)
const BankIDProvider = {
  id: 'bankid',
  name: 'BankID',
  type: 'oauth' as const,
  authorization: {
    url: 'https://auth.bankid.no/oauth2/authorize',
    params: {
      scope: 'openid profile',
      response_type: 'code',
    },
  },
  token: 'https://auth.bankid.no/oauth2/token',
  userinfo: 'https://auth.bankid.no/oauth2/userinfo',
  clientId: process.env.BANKID_CLIENT_ID,
  clientSecret: process.env.BANKID_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: null,
      bankIdVerified: true,
      personalNumber: profile.personal_number,
    };
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call your user service API
          const response = await fetch(`${process.env.USER_SERVICE_URL || 'http://localhost:3002'}/auth/login-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            tier: user.tier || 'Bronze Shield',
            bankIdVerified: user.bankIdVerified || false,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    VippsProvider,
    // BankID provider - disabled for MVP
    // ...(process.env.NODE_ENV === 'production' ? [BankIDProvider] : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      if (user) {
        token.tier = user.tier;
        token.bankIdVerified = user.bankIdVerified;
        token.vippsVerified = user.vippsVerified;
        token.personalNumber = user.personalNumber;
        token.phoneNumber = user.phoneNumber;
      }

      if (account?.provider === 'bankid') {
        token.bankIdVerified = true;
      }

      if (account?.provider === 'vipps') {
        token.vippsVerified = true;
      }

      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.user.tier = token.tier;
      session.user.bankIdVerified = token.bankIdVerified;
      session.user.vippsVerified = token.vippsVerified;
      session.user.personalNumber = token.personalNumber;
      session.user.phoneNumber = token.phoneNumber;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;