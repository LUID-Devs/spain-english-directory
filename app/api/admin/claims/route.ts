import { NextRequest, NextResponse } from 'next/server';
import DirectoryEntry from '@/models/DirectoryEntry';
import { Op } from 'sequelize';
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from '@/lib/email/claim-emails';

// Use Node.js runtime for database operations
export const runtime = 'nodejs';

// GET /api/admin/claims - List all claims pending approval
export async function GET(request: NextRequest) {
  try {
    // Get admin API key from header for basic auth
    const adminKey = request.headers.get('x-admin-key');
    
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'verified';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    
    if (status === 'all') {
      where.claimStatus = { [Op.ne]: 'unclaimed' };
    } else if (status === 'pending-verification') {
      where.claimStatus = 'pending';
    } else if (status === 'pending-approval') {
      where.claimStatus = 'verified';
    } else {
      where.claimStatus = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: claims } = await DirectoryEntry.findAndCountAll({
      where,
      order: [['claimRequestedAt', 'DESC']],
      limit,
      offset,
    });

    return NextResponse.json({
      claims,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/claims - Approve or reject a claim
export async function POST(request: NextRequest) {
  try {
    // Get admin API key from header for basic auth
    const adminKey = request.headers.get('x-admin-key');
    
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, action, adminName } = body;

    if (!listingId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: listingId, action (approve/reject)' },
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
        { error: 'Claim is not in verified status' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await listing.update({
        claimStatus: 'approved',
        claimApprovedAt: new Date(),
        claimApprovedBy: adminName || 'Admin',
      });

      // Send approval email to claimant
      await sendClaimApprovedEmail({
        to: listing.claimEmail!,
        listingName: listing.name,
      });

      return NextResponse.json({
        success: true,
        message: 'Claim approved successfully',
        listing: {
          id: listing.id,
          name: listing.name,
          claimedBy: listing.claimedBy,
          claimStatus: listing.claimStatus,
        },
      });
    } else {
      // Reject claim
      const rejectionReason = body.reason || 'Your claim could not be verified.';

      await listing.update({
        claimStatus: 'rejected',
      });

      // Send rejection email to claimant
      await sendClaimRejectedEmail({
        to: listing.claimEmail!,
        listingName: listing.name,
        reason: rejectionReason,
      });

      // Clear claim data after a delay (keep for record keeping)
      setTimeout(async () => {
        await listing.update({
          claimStatus: 'unclaimed',
          claimedBy: null as unknown as undefined,
          claimEmail: null as unknown as undefined,
          claimPhone: null as unknown as undefined,
          claimVerificationCode: null as unknown as undefined,
          claimVerificationExpiry: null as unknown as undefined,
          claimRequestedAt: null as unknown as undefined,
          claimApprovedAt: null as unknown as undefined,
          claimApprovedBy: null as unknown as undefined,
        });
      }, 1000 * 60 * 60 * 24); // Clear after 24 hours

      return NextResponse.json({
        success: true,
        message: 'Claim rejected',
        listing: {
          id: listing.id,
          name: listing.name,
          claimStatus: 'rejected',
        },
      });
    }

  } catch (error) {
    console.error('Error processing claim action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
