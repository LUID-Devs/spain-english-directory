import { NextRequest, NextResponse } from 'next/server';
import { Professional, Lead, LeadStatus } from '@/models';

interface ContactRequest {
  professionalId: number;
  name: string;
  email: string;
  message: string;
}

function validateContactData(data: Partial<ContactRequest>): string[] {
  const errors: string[] = [];
  
  if (!data.professionalId || typeof data.professionalId !== 'number') {
    errors.push('professionalId is required and must be a number');
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters');
  }
  
  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('email must be a valid email address');
    }
  }
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('message is required and must be at least 10 characters');
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    let body: Partial<ContactRequest>;
    
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
    const validationErrors = validateContactData(body);
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
    
    const { professionalId, name, email, message } = body as ContactRequest;
    
    // Check if professional exists
    const professional = await Professional.findByPk(professionalId);
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
    
    // Create lead in database
    const lead = await Lead.create({
      professionalId,
      requesterName: name,
      requesterEmail: email,
      message,
      status: LeadStatus.NEW,
    });
    
    // TODO: Send email notification to professional
    if (professional.email) {
      console.log('=== CONTACT FORM SUBMISSION ===');
      console.log(`To: ${professional.email}`);
      console.log(`From: ${email}`);
      console.log(`Subject: New message from ${name} via Spain English Directory`);
      console.log(`Message: ${message}`);
      console.log(`Lead ID: ${lead.id}`);
      console.log('=============================');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        leadId: lead.id,
        professionalId,
        professionalName: professional.name,
        sentAt: lead.createdAt,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit contact form',
        message: error instanceof Error ? error.message : 'Unknown error',
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
