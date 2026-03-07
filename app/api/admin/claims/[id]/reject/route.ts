import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';
import { sendClaimRejectedNotification } from '@/lib/email';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const claimId = parseInt(id);

    if (isNaN(claimId)) {
      return NextResponse.json(
        { error: 'Invalid claim ID' },
        { status: 400 }
      );
    }

    const claim = await Claim.findByPk(claimId, {
      include: [{
        model: DirectoryEntry,
        as: 'directoryEntry',
      }],
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    if (claim.status === 'rejected') {
      return NextResponse.json(
        { error: 'Claim is already rejected' },
        { status: 400 }
      );
    }

    if (claim.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot reject an already approved claim' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { adminId, reason, notes } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    await claim.update({
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: adminId || null,
      reviewedAt: new Date(),
      notes: notes ? `${claim.notes || ''}\n[Admin Notes]: ${notes}` : claim.notes,
    });

    const entry = claim.directoryEntry;
    await sendClaimRejectedNotification(
      claim.claimantEmail,
      entry?.name || 'your listing',
      reason
    );

    return NextResponse.json({
      success: true,
      message: 'Claim rejected successfully',
      claim: {
        id: claim.id,
        status: 'rejected',
        reviewedAt: claim.reviewedAt,
        rejectionReason: reason,
      },
    });

  } catch (error) {
    console.error('Error rejecting claim:', error);
    return NextResponse.json(
      { error: 'Failed to reject claim' },
      { status: 500 }
    );
  }
}
