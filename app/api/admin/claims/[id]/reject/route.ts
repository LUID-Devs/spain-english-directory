import { NextResponse } from 'next/server';
import { initDb, Claim } from '@/lib/initDb';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await initDb();

    const { id } = await context.params;
    const claimId = Number(id);

    if (!claimId) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim id.' },
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

    await claim.update({ status: 'rejected' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reject claim:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to reject claim.' },
      { status: 500 }
    );
  }
}
