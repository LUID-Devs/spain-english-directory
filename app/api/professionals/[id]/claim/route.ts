import { NextRequest, NextResponse } from 'next/server';
import DirectoryEntry from '@/models/DirectoryEntry';
import { sendClaimVerificationEmail } from '@/lib/email/claim-emails';
import crypto from 'crypto';

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
    const { email, phone, name } = body;

    if (!email || !phone || !name) {
      return NextResponse.json(
        { error: 'Email, phone, and name are required' },
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

    // Check if already claimed or pending
    if (listing.claimStatus === 'approved') {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

    if (listing.claimStatus === 'pending' || listing.claimStatus === 'verified') {
      return NextResponse.json(
        { error: 'A claim request is already pending for this listing' },
        { status: 409 }
      );
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry

    // Update listing with claim information
    await listing.update({
      claimStatus: 'pending',
      claimedBy: name,
      claimEmail: email,
      claimPhone: phone,
      claimVerificationCode: verificationCode,
      claimVerificationExpiry: expiryDate,
      claimRequestedAt: new Date(),
    });

    // Send verification email
    await sendClaimVerificationEmail({
      to: email,
      listingName: listing.name,
      verificationCode,
      expiryDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Claim request submitted. Please check your email for verification code.',
      listingId: listing.id,
    });

  } catch (error) {
    console.error('Error processing claim request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
