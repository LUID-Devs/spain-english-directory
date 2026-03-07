import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';
import { sendVerificationCode } from '@/lib/email';
import crypto from 'crypto';

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { directoryEntryId, claimantName, claimantEmail, claimantPhone, relationship, documentUrl } = body;

    if (!directoryEntryId || !claimantName || !claimantEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: directoryEntryId, claimantName, claimantEmail' },
        { status: 400 }
      );
    }

    if (relationship) {
      const validRelationships = ['owner', 'employee', 'authorized'];
      if (!validRelationships.includes(relationship)) {
        return NextResponse.json(
          { error: `Invalid relationship. Must be one of: ${validRelationships.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const entry = await DirectoryEntry.findByPk(directoryEntryId);
    if (!entry) {
      return NextResponse.json(
        { error: 'Directory entry not found' },
        { status: 404 }
      );
    }

    if (entry.isClaimed) {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

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

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const claim = await Claim.create({
      directoryEntryId,
      claimantName,
      claimantEmail: claimantEmail.toLowerCase().trim(),
      claimantPhone,
      relationship: relationship || null,
      documentUrl,
      verificationCode,
      verificationCodeExpiresAt,
      status: 'pending',
      isVerified: false,
    });

    const emailSent = await sendVerificationCode(claimantEmail, verificationCode, entry.name);

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const claims = await Claim.findAll({
      where: { claimantEmail: email.toLowerCase().trim() },
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
