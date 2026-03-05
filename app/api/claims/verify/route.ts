import { NextRequest, NextResponse } from 'next/server';
import { Claim } from '@/models';

// POST /api/claims/verify - Verify email verification code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, code } = body;

    // Validate required fields
    if (!claimId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: claimId, code' },
        { status: 400 }
      );
    }

    // Find the claim
    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (claim.isVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        claim: {
          id: claim.id,
          status: claim.status,
        },
      });
    }

    // Check if code is expired
    if (new Date() > claim.verificationCodeExpiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Verify the code
    if (claim.verificationCode !== code.trim()) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update claim as verified
    await claim.update({
      isVerified: true,
      verifiedAt: new Date(),
      status: 'verified',
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. Your claim is now pending admin review.',
      claim: {
        id: claim.id,
        status: 'verified',
      },
    });

  } catch (error) {
    console.error('Error verifying claim:', error);
    return NextResponse.json(
      { error: 'Failed to verify claim' },
      { status: 500 }
    );
  }
}

// PATCH /api/claims/verify - Resend verification code
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId } = body;

    if (!claimId) {
      return NextResponse.json(
        { error: 'Missing required field: claimId' },
        { status: 400 }
      );
    }

    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    if (claim.isVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate new code
    const { sendVerificationCode } = await import('@/lib/email');
    const { default: DirectoryEntry } = await import('@/models/DirectoryEntry');
    const crypto = await import('crypto');

    const newCode = crypto.randomInt(100000, 999999).toString();
    const newExpiry = new Date(Date.now() + 30 * 60 * 1000);

    await claim.update({
      verificationCode: newCode,
      verificationCodeExpiresAt: newExpiry,
    });

    // Send new code
    const entry = await DirectoryEntry.findByPk(claim.directoryEntryId);
    if (entry) {
      await sendVerificationCode(claim.claimantEmail, newCode, entry.name);
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent',
    });

  } catch (error) {
    console.error('Error resending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}
