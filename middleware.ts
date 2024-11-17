import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';
import {
  DEFAULT_API_PAGE,
  DEFAULT_HOME_PAGE,
  DEFAULT_LOGIN_PAGE,
  DEFAULT_REGISTER_PAGE,
} from './lib/router/router.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    DEFAULT_HOME_PAGE,
    '/:id',
    `/${DEFAULT_API_PAGE}/:path*`,
    DEFAULT_LOGIN_PAGE,
    DEFAULT_REGISTER_PAGE,
  ],
};
