import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/models';
import { getAuthSession } from '@/lib/auth/server';

// PATCH /api/leads/:id/status - Update lead status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['new', 'contacted', 'converted', 'archived'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const leadId = Number.parseInt(id, 10);
    if (Number.isNaN(leadId)) {
      return NextResponse.json(
        { message: 'Invalid lead id' },
        { status: 400 }
      );
    }

    const lead = await Lead.findByPk(leadId);
    if (!lead) {
      return NextResponse.json(
        { message: 'Lead not found' },
        { status: 404 }
      );
    }

    if (lead.professionalId !== session.entryId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Existing DB enum is new/contacted/closed. Map converted/archived to closed.
    const mappedStatus = status === 'converted' || status === 'archived' ? 'closed' : status;
    await lead.update({ status: mappedStatus });

    return NextResponse.json({
      id: String(lead.id),
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json(
      { message: 'Failed to update lead status' },
      { status: 500 }
    );
  }
}
