import { NextRequest, NextResponse } from 'next/server';
import { Lead } from '@/models';

// GET /api/leads - Get leads for current professional
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalIdRaw = searchParams.get('professionalId');

    const where: Record<string, unknown> = {};
    if (professionalIdRaw && /^\d+$/.test(professionalIdRaw)) {
      where.professionalId = Number.parseInt(professionalIdRaw, 10);
    }

    const leads = await Lead.findAll({
      where,
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
