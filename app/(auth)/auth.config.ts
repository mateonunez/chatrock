import {
  DEFAULT_CHAT_PAGE,
  DEFAULT_HOME_PAGE,
  DEFAULT_LOGIN_PAGE,
  DEFAULT_REGISTER_PAGE,
} from '@/lib/router/router.config';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: DEFAULT_LOGIN_PAGE,
    newUser: DEFAULT_HOME_PAGE,
  },
  providers: [],
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: { auth: any; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChatPage = nextUrl.pathname.startsWith(DEFAULT_CHAT_PAGE);
      const isOnRegisterPage = nextUrl.pathname.startsWith(
        DEFAULT_REGISTER_PAGE,
      );
      const isOnLoginPage = nextUrl.pathname.startsWith(DEFAULT_LOGIN_PAGE);

      if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
        return Response.redirect(new URL(DEFAULT_CHAT_PAGE, nextUrl));
      }

      if (isOnRegisterPage || isOnLoginPage) {
        return true;
      }

      if (isOnChatPage) {
        return isLoggedIn;
      }

      if (isLoggedIn) {
        return Response.redirect(new URL(DEFAULT_CHAT_PAGE, nextUrl));
      }

      return true;
    },
  },
};
