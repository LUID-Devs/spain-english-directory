import { NextRequest, NextResponse } from 'next/server';
import DirectoryEntry from '@/models/DirectoryEntry';
import { requireAdminAuth } from '@/lib/admin-auth';

// Use Node.js runtime for database operations
export const runtime = 'nodejs';

// POST /api/admin/claims/[id]/approve - Approve or reject a claim
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
    const listingId = parseInt(id, 10);
    
    if (isNaN(listingId)) {
      return NextResponse.json(
        { error: 'Invalid listing ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, adminName } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const listing = await DirectoryEntry.findByPk(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.claimStatus !== 'verified') {
      return NextResponse.json(
        { error: 'Claim must be verified before admin approval' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await listing.update({
        claimStatus: 'approved',
        claimApprovedAt: new Date(),
        claimApprovedBy: adminName || 'Admin',
      });

      // TODO: Send approval email to claimant
      console.log(`[EMAIL] Claim approved for listing ${listingId}, notified ${listing.claimEmail}`);

      return NextResponse.json({
        success: true,
        message: 'Claim approved successfully',
        listingId,
      });
    } else {
      // Reject - reset to unclaimed
      await listing.update({
        claimStatus: 'rejected',
        claimApprovedAt: new Date(),
        claimApprovedBy: adminName || 'Admin',
      });

      // TODO: Send rejection email to claimant
      console.log(`[EMAIL] Claim rejected for listing ${listingId}, notified ${listing.claimEmail}`);

      return NextResponse.json({
        success: true,
        message: 'Claim rejected',
        listingId,
      });
    }
  } catch (error) {
    console.error('Error processing claim approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
