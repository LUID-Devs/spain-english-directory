import { NextResponse } from 'next/server';
import { initDb, Claim, DirectoryEntry, sequelize } from '@/lib/initDb';

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

    if (claim.status !== 'verified' && claim.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Claim must be verified before approval.' },
        { status: 409 }
      );
    }

    await sequelize.transaction(async (transaction) => {
      await claim.update({ status: 'approved' }, { transaction });

      await DirectoryEntry.update(
        {
          claimedBy: claim.id,
          claimedAt: new Date(),
          isVerified: true,
        },
        {
          where: { id: claim.directoryEntryId },
          transaction,
        }
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to approve claim:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to approve claim.' },
      { status: 500 }
    );
  }
}
