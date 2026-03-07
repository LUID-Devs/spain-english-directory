import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const ADMIN_KEY_HEADER = 'x-admin-key';

export function requireAdminAuth(request: NextRequest): NextResponse | null {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  

  const providedKey = request.headers.get(ADMIN_KEY_HEADER);
  if (!providedKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const providedBuffer = Buffer.from(providedKey);
  const configuredBuffer = Buffer.from(configuredKey);

  if (providedBuffer.length !== configuredBuffer.length) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const validKey = crypto.timingSafeEqual(providedBuffer, configuredBuffer);
  if (!validKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null;
}
