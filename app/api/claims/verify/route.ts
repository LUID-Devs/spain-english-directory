import { NextResponse } from 'next/server';
import { initDb, Claim } from '@/lib/initDb';

interface VerifyClaimBody {
  claimId?: number;
  code?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await initDb();

    const body = (await request.json()) as VerifyClaimBody;
    const claimId = Number(body.claimId);
    const code = body.code?.trim();

    if (!claimId || !code) {
      return NextResponse.json(
        { success: false, error: 'Claim ID and code are required.' },
        { status: 400 }
      );
    }

    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: 'Claim not found.' },
        { status: 404 }
      );
    }

    if (claim.verificationCode !== code) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    if (claim.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'This claim has been rejected.' },
        { status: 409 }
      );
    }

    if (claim.status !== 'approved') {
      claim.status = 'verified';
      await claim.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to verify claim:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify claim.' },
      { status: 500 }
    );
  }
}
