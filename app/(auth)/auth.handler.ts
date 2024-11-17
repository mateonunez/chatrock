import NextAuth, { type User, type Session } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { compare } from 'bcrypt-ts';

interface ExtendedSessions extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials: Record<string, string>) {
        const { email, password } = credentials;
        const [user] = await getUser(email);

        if (!user) {
          return null;
        }

        // biome-ignore lint/style/noNonNullAssertion: Forbidden non-null assertion.
        const passwordMatch = await compare(password, user.password!);

        if (!passwordMatch) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
