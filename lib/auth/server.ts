import { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

export async function getAuthSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
