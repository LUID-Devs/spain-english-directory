import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';
import { sendClaimApprovedNotification } from '@/lib/email';

// POST /api/admin/claims/:id/approve - Approve a claim
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (claim.status === 'approved') {
      return NextResponse.json(
        { error: 'Claim is already approved' },
        { status: 400 }
      );
    }

    if (!claim.isVerified) {
      return NextResponse.json(
        { error: 'Cannot approve unverified claim' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { adminId, notes } = body;

    // Update claim status
    await claim.update({
      status: 'approved',
      reviewedBy: adminId || null,
      reviewedAt: new Date(),
      notes: notes ? `${claim.notes || ''}\n[Admin Notes]: ${notes}` : claim.notes,
    });

    // Update the directory entry to mark as claimed
    const entry = claim.directoryEntry;
    if (entry) {
      await entry.update({
        isClaimed: true,
        claimedBy: claim.claimantEmail,
        claimedAt: new Date(),
        // Optional: update contact info if different
        ...(claim.claimantPhone && !entry.phone ? { phone: claim.claimantPhone } : {}),
        ...(claim.claimantEmail && !entry.email ? { email: claim.claimantEmail } : {}),
      });
    }

    // Send approval notification
    await sendClaimApprovedNotification(claim.claimantEmail, entry?.name || 'your listing');

    return NextResponse.json({
      success: true,
      message: 'Claim approved successfully',
      claim: {
        id: claim.id,
        status: 'approved',
        reviewedAt: claim.reviewedAt,
      },
    });

  } catch (error) {
    console.error('Error approving claim:', error);
    return NextResponse.json(
      { error: 'Failed to approve claim' },
      { status: 500 }
    );
  }
}
