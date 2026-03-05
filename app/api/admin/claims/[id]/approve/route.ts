import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';
import { sendApprovalEmail } from '@/lib/email';

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
        { success: false, error: 'Invalid claim ID' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { adminId, notes } = body;

    // Find the claim with directory entry
    const claim = await Claim.findByPk(claimId, {
      include: [{
        model: DirectoryEntry,
        as: 'directoryEntry',
      }],
    });

    if (!claim) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (claim.status === 'approved') {
      return NextResponse.json(
        { success: false, error: 'Claim is already approved' },
        { status: 400 }
      );
    }

    if (claim.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Cannot approve a rejected claim' },
        { status: 400 }
      );
    }

    // Check if entry is already claimed by someone else
    const directoryEntry = claim.directoryEntry;
    if (directoryEntry?.isClaimed) {
      return NextResponse.json(
        { success: false, error: 'This listing is already claimed by another user' },
        { status: 409 }
      );
    }

    // Update claim status
    await claim.update({
      status: 'approved',
      reviewedBy: adminId || null,
      reviewedAt: new Date(),
      notes: notes || claim.notes,
    });

    // Update directory entry to mark as claimed
    await directoryEntry?.update({
      isClaimed: true,
      claimedBy: claim.claimantEmail,
      claimedAt: new Date(),
      isVerified: true,
    });

    // Send approval notification email
    await sendApprovalEmail(
      claim.claimantEmail,
      claim.claimantName,
      directoryEntry?.name || 'your business'
    );

    return NextResponse.json({
      success: true,
      message: 'Claim approved successfully. The listing has been transferred to the claimant.',
      claim: {
        id: claim.id,
        status: 'approved',
        claimantEmail: claim.claimantEmail,
        directoryEntry: {
          id: directoryEntry?.id,
          name: directoryEntry?.name,
          isClaimed: true,
        },
      },
    });

  } catch (error) {
    console.error('Failed to approve claim:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to approve claim.' },
      { status: 500 }
    );
  }
}
