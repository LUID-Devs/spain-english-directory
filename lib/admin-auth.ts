import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_KEY_HEADER = 'x-admin-key';

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return NextResponse.json(
      { error: 'Admin authentication is not configured' },
      { status: 503 }
    );
  }

  const providedKey = request.headers.get(ADMIN_KEY_HEADER);
  if (!providedKey || providedKey !== configuredKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}
