import { NextRequest, NextResponse } from 'next/server';

// GET /api/professionals/me - Get current user's professional profile
export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user from session/token
    // For now, return mock data
    const professional = {
      id: 'prof-123',
      name: 'Sample Business',
      email: 'contact@example.com',
      phone: '+34 123 456 789',
      description: 'We provide excellent English-speaking services in Spain.',
      services: ['Consulting', 'Translation', 'Legal Services'],
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
      website: 'https://example.com',
      address: '123 Main Street',
      city: 'Madrid',
      province: 'Madrid',
      category: 'Legal',
      claimed: true,
      claimedBy: 'user-123',
      views: 156,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-05T12:00:00Z',
    };

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
