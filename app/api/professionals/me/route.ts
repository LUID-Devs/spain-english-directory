import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry } from '@/models';

// GET /api/professionals/me - Get current user's professional profile
export async function GET(request: NextRequest) {
  try {
    // Until auth-based ownership is in place, prefer claimed entries and fall back to newest entry.
    const professional = await DirectoryEntry.findOne({
      where: { isClaimed: true },
      order: [['updatedAt', 'DESC']],
      raw: true,
    }) || await DirectoryEntry.findOne({
      order: [['updatedAt', 'DESC']],
      raw: true,
    });

    if (!professional) {
      return NextResponse.json(
        { message: 'No listing profile found' },
        { status: 404 }
      );
    }

    const payload = {
      id: String(professional.id),
      name: professional.name,
      email: professional.email || '',
      phone: professional.phone || '',
      description: professional.description || '',
      services: Array.isArray(professional.specialties) ? professional.specialties : [],
      hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '14:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: true },
      },
      photoUrl: null,
      website: professional.website || '',
      address: professional.address || '',
      city: professional.city || '',
      province: professional.province || '',
      category: professional.category || '',
      claimed: Boolean(professional.isClaimed),
      claimedBy: professional.claimedBy || undefined,
      views: 0,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
