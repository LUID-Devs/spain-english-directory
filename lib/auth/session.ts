import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
const encoder = new TextEncoder();
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface AuthSession {
  entryId: number;
  email: string;
  exp: number;
}

function toBase64Url(input: Uint8Array): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

async function hmacSha256(message: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return new Uint8Array(signature);
}

function getAuthSecret(): string {
  return process.env.AUTH_SESSION_SECRET || process.env.ADMIN_API_KEY || 'dev-only-insecure-secret';
}

export async function createSessionToken(entryId: number, email: string): Promise<string> {
  const payload: AuthSession = {
    entryId,
    email,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = toBase64Url(encoder.encode(payloadJson));
  const signature = await hmacSha256(payloadB64, getAuthSecret());
  const signatureB64 = toBase64Url(signature);

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;

  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) return null;

  const expectedSig = await hmacSha256(payloadB64, getAuthSecret());
  const providedSig = fromBase64Url(signatureB64);

  if (expectedSig.length !== providedSig.length) return null;

  let valid = true;
  for (let i = 0; i < expectedSig.length; i += 1) {
    if (expectedSig[i] !== providedSig[i]) {
      valid = false;
    }
  }

  if (!valid) return null;

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadB64));
    const payload = JSON.parse(payloadJson) as AuthSession;

    if (!payload || typeof payload.entryId !== 'number' || typeof payload.email !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  };
}
