import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';
import { sendVerificationCode } from '@/lib/email';
import crypto from 'crypto';

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// POST /api/claims - Create a new claim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { directoryEntryId, claimantName, claimantEmail, claimantPhone, documentUrl } = body;

    // Validate required fields
    if (!directoryEntryId || !claimantName || !claimantEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: directoryEntryId, claimantName, claimantEmail' },
        { status: 400 }
      );
    }

    // Check if the directory entry exists
    const entry = await DirectoryEntry.findByPk(directoryEntryId);
    if (!entry) {
      return NextResponse.json(
        { error: 'Directory entry not found' },
        { status: 404 }
      );
    }

    // Check if the listing is already claimed
    if (entry.isClaimed) {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

    // Check if there's already a pending claim for this email + listing
    const existingClaim = await Claim.findOne({
      where: {
        directoryEntryId,
        claimantEmail: claimantEmail.toLowerCase().trim(),
        status: ['pending', 'verified'],
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this listing' },
        { status: 409 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create the claim
    const claim = await Claim.create({
      directoryEntryId,
      claimantName,
      claimantEmail: claimantEmail.toLowerCase().trim(),
      claimantPhone,
      documentUrl,
      verificationCode,
      verificationCodeExpiresAt,
      status: 'pending',
      isVerified: false,
    });

    // Send verification email
    const emailSent = await sendVerificationCode(claimantEmail, verificationCode, entry.name);

    if (!emailSent) {
      console.error('Failed to send verification email to:', claimantEmail);
    }

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      message: 'Claim created successfully. Please check your email for verification code.',
      emailSent,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}

// GET /api/claims?email=xxx - Get claims by email (for checking status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const entryId = searchParams.get('entryId');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { claimantEmail: email.toLowerCase().trim() };
    if (entryId) {
      whereClause.directoryEntryId = entryId;
    }

    const claims = await Claim.findAll({
      where: whereClause,
      include: [{
        model: DirectoryEntry,
        as: 'directoryEntry',
        attributes: ['id', 'name', 'category', 'city'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ claims });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
