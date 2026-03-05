import { NextRequest, NextResponse } from 'next/server';
import type { ContactFormData } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid build-time database connection
    const { DirectoryEntry, Lead } = await import('@/models');
    const { sendLeadEmail, sendConfirmationEmail } = await import('@/lib/email/service');

    // Find the professional
    const professional = await DirectoryEntry.findOne({
      where: { slug },
    });

    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Professional not found' },
        { status: 404 }
      );
    }

    if (!professional.email) {
      return NextResponse.json(
        { success: false, message: 'Professional has no contact email configured' },
        { status: 400 }
      );
    }

    // Create the lead
    const lead = await Lead.create({
      professionalId: professional.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      serviceInterest: body.serviceInterest,
      status: 'new',
      emailSent: false,
    } as any);

    // Send email to professional
    const emailSent = await sendLeadEmail(
      {
        id: professional.id,
        name: professional.name,
        slug: professional.slug,
        category: professional.category,
        description: professional.description || undefined,
        address: professional.address || undefined,
        city: professional.city,
        province: professional.province || undefined,
        phone: professional.phone || undefined,
        email: professional.email,
        website: professional.website || undefined,
        speaksEnglish: professional.speaksEnglish,
      },
      body
    );

    // Send confirmation email to user
    await sendConfirmationEmail(body, professional.name);

    // Update lead with email status
    if (emailSent) {
      await lead.update({
        emailSent: true,
        emailSentAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been sent successfully',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}
