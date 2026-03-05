import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry, Claim } from '@/models';

// Generate a random verification code
function generateVerificationCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface ClaimRequest {
  professionalId: number;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  relationship: 'owner' | 'employee' | 'authorized';
  message?: string;
}

function validateClaimData(data: Partial<ClaimRequest>): string[] {
  const errors: string[] = [];
  
  if (!data.professionalId || typeof data.professionalId !== 'number') {
    errors.push('professionalId is required and must be a number');
  }
  
  if (!data.claimantName || typeof data.claimantName !== 'string' || data.claimantName.trim().length < 2) {
    errors.push('claimantName is required and must be at least 2 characters');
  }
  
  if (!data.claimantEmail || typeof data.claimantEmail !== 'string') {
    errors.push('claimantEmail is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.claimantEmail)) {
      errors.push('claimantEmail must be a valid email address');
    }
  }
  
  if (!data.relationship || typeof data.relationship !== 'string') {
    errors.push('relationship is required');
  } else {
    const validRelationships = ['owner', 'employee', 'authorized'];
    if (!validRelationships.includes(data.relationship)) {
      errors.push(`relationship must be one of: ${validRelationships.join(', ')}`);
    }
  }
  
  if (data.claimantPhone && typeof data.claimantPhone !== 'string') {
    errors.push('claimantPhone must be a string');
  }
  
  if (data.message && typeof data.message !== 'string') {
    errors.push('message must be a string');
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    let body: Partial<ClaimRequest>;
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }
    
    // Validate input
    const validationErrors = validateClaimData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validationErrors.join(', '),
          errors: validationErrors,
        },
        { status: 400 }
      );
    }
    
    const { professionalId, claimantName, claimantEmail, claimantPhone, relationship, message } = body as ClaimRequest;
    
    // Check if professional exists
    const professional = await DirectoryEntry.findByPk(professionalId);
    if (!professional) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: `Professional with ID ${professionalId} not found`,
        },
        { status: 404 }
      );
    }
    
    // Generate verification code and expiration (24 hours from now)
    const verificationCode = generateVerificationCode(8);
    const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store claim request in database
    const claim = await Claim.create({
      directoryEntryId: professionalId,
      claimantName,
      claimantEmail: claimantEmail.toLowerCase().trim(),
      claimantPhone,
      relationship,
      notes: message || null,
      verificationCode,
      verificationCodeExpiresAt,
      status: 'pending',
      isVerified: false,
    });
    
    console.log('=== LISTING CLAIM REQUEST ===');
    console.log(`Professional: ${professional.name} (ID: ${professionalId})`);
    console.log(`Claimant: ${claimantName} <[REDACTED]>`);
    if (claimantPhone) console.log(`Phone: [REDACTED]`);
    console.log(`Relationship: ${relationship}`);
    if (message) console.log(`Message: [REDACTED]`);
    console.log(`Submitted at: ${new Date().toISOString()}`);
    console.log(`Claim ID: ${claim.id}`);
    console.log('=============================');
    
    return NextResponse.json({
      success: true,
      message: 'Claim request submitted successfully. We will review your request and contact you shortly.',
      data: {
        claimId: claim.id,
        professionalId,
        professionalName: professional.name,
        claimantName,
        claimantEmail,
        relationship,
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error submitting claim request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit claim request',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
