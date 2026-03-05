import { NextRequest, NextResponse } from 'next/server';
import DirectoryEntry from '@/models/DirectoryEntry';
import { sendClaimPendingApprovalEmail, sendAdminClaimNotification } from '@/lib/email/claim-emails';

// Use Node.js runtime for database operations
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listingId = parseInt(id);

    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'Invalid listing ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Find the listing
    const listing = await DirectoryEntry.findByPk(listingId);

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check claim status
    if (listing.claimStatus !== 'pending') {
      return NextResponse.json(
        { error: 'No pending claim found for this listing' },
        { status: 400 }
      );
    }

    // Check if verification code has expired
    if (listing.claimVerificationExpiry && new Date() > listing.claimVerificationExpiry) {
      // Reset claim status
      await listing.update({
        claimStatus: 'unclaimed',
        claimedBy: null as unknown as undefined,
        claimEmail: null as unknown as undefined,
        claimPhone: null as unknown as undefined,
        claimVerificationCode: null as unknown as undefined,
        claimVerificationExpiry: null as unknown as undefined,
        claimRequestedAt: null as unknown as undefined,
      });

      return NextResponse.json(
        { error: 'Verification code has expired. Please submit a new claim request.' },
        { status: 410 }
      );
    }

    // Verify the code
    if (listing.claimVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update status to verified (pending admin approval)
    await listing.update({
      claimStatus: 'verified',
    });

    // Send notification to user
    await sendClaimPendingApprovalEmail({
      to: listing.claimEmail!,
      listingName: listing.name,
    });

    // Send notification to admin
    await sendAdminClaimNotification({
      listingId: listing.id,
      listingName: listing.name,
      claimedBy: listing.claimedBy!,
      claimEmail: listing.claimEmail!,
      claimPhone: listing.claimPhone!,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification successful. Your claim is now pending admin approval.',
      listingId: listing.id,
    });

  } catch (error) {
    console.error('Error verifying claim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
