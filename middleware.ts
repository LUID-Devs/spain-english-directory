import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

const encoder = new TextEncoder();

function b64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) return false;

  const secret = process.env.AUTH_SESSION_SECRET || process.env.ADMIN_API_KEY || 'dev-only-insecure-secret';
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const expectedBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const expected = new Uint8Array(expectedBuffer);
  const provided = b64UrlToBytes(signatureB64);

  if (expected.length !== provided.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i] !== provided[i]) return false;
  }

  const payloadJson = new TextDecoder().decode(b64UrlToBytes(payloadB64));
  const payload = JSON.parse(payloadJson) as { exp?: number };

  if (!payload.exp || payload.exp < Date.now()) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authenticated = await verifyToken(token);

  if (pathname.startsWith('/dashboard')) {
    if (!authenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === '/login' && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
