import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { DirectoryEntry } from '@/models';
import { createSessionToken, sessionCookieOptions } from '@/lib/auth/session';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const expectedPassword = process.env.DASHBOARD_LOGIN_PASSWORD;
    if (!expectedPassword) {
      return NextResponse.json(
        { message: 'Server login password is not configured. Set DASHBOARD_LOGIN_PASSWORD.' },
        { status: 500 }
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const entry = await DirectoryEntry.findOne({
      where: {
        email: { [Op.iLike]: email },
      },
      raw: true,
    });

    if (!entry) {
      return NextResponse.json({ message: 'No directory entry found for this email' }, { status: 404 });
    }

    const token = await createSessionToken(entry.id, email);

    const response = NextResponse.json({
      success: true,
      user: {
        entryId: entry.id,
        email,
        name: entry.name,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ message: 'Failed to login' }, { status: 500 });
  }
}
