import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry } from '@/models';
import { verifySessionToken } from '@/lib/auth/session';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const entry = await DirectoryEntry.findByPk(session.entryId, { raw: true });
    if (!entry) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        entryId: entry.id,
        email: session.email,
        name: entry.name,
      },
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
