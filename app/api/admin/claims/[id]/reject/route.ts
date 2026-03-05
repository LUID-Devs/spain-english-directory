import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';
import { sendRejectionEmail } from '@/lib/email';

// POST /api/admin/claims/:id/reject - Reject a claim
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

    const body = await request.json();
    const { adminId, rejectionReason } = body;

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required (minimum 10 characters)' },
        { status: 400 }
      );
    }

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
    if (claim.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Claim is already rejected' },
        { status: 400 }
      );
    }

    if (claim.status === 'approved') {
      return NextResponse.json(
        { success: false, error: 'Cannot reject an approved claim' },
        { status: 400 }
      );
    }

    // Update claim status
    await claim.update({
      status: 'rejected',
      reviewedBy: adminId || null,
      reviewedAt: new Date(),
      rejectionReason,
    });

    // Send rejection notification email
    await sendRejectionEmail(
      claim.claimantEmail,
      claim.claimantName,
      claim.directoryEntry?.name || 'your business',
      rejectionReason
    );

    return NextResponse.json({
      success: true,
      message: 'Claim rejected successfully.',
      claim: {
        id: claim.id,
        status: 'rejected',
        claimantEmail: claim.claimantEmail,
        rejectionReason,
        directoryEntry: claim.directoryEntry ? {
          id: claim.directoryEntry.id,
          name: claim.directoryEntry.name,
        } : null,
      },
    });

  } catch (error) {
    console.error('Failed to reject claim:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to reject claim.' },
      { status: 500 }
    );
  }
}
