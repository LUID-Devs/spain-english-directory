import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/models';
import { getAuthSession } from '@/lib/auth/server';

// GET /api/leads - Get leads for current professional
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const leads = await Lead.findAll({
      where: { professionalId: session.entryId },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    const mapped = leads.map((lead) => ({
      id: String(lead.id),
      professionalId: String(lead.professionalId),
      name: lead.requesterName,
      email: lead.requesterEmail,
      phone: null,
      message: lead.message,
      status: lead.status === 'closed' ? 'archived' : lead.status,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
