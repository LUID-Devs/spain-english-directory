import { NextRequest, NextResponse } from 'next/server';

// GET /api/leads - Get leads for current professional
export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user and filter by their professional ID
    // For now, return mock data
    const leads = [
      {
        id: 'lead-1',
        professionalId: 'prof-123',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+34 987 654 321',
        message: 'Hi, I am looking for legal advice regarding property purchase in Barcelona. Can you help me?',
        status: 'new',
        createdAt: '2024-03-05T10:30:00Z',
        updatedAt: '2024-03-05T10:30:00Z',
      },
      {
        id: 'lead-2',
        professionalId: 'prof-123',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: null,
        message: 'Hello, I need help with translating some documents from Spanish to English for my business. What are your rates?',
        status: 'contacted',
        createdAt: '2024-03-04T14:20:00Z',
        updatedAt: '2024-03-04T16:45:00Z',
      },
      {
        id: 'lead-3',
        professionalId: 'prof-123',
        name: 'Michael Brown',
        email: 'mbrown@example.com',
        phone: '+44 7700 900001',
        message: 'I am moving to Madrid next month and need help setting up my business. Are you available for a consultation?',
        status: 'converted',
        createdAt: '2024-03-03T09:15:00Z',
        updatedAt: '2024-03-04T11:00:00Z',
      },
      {
        id: 'lead-4',
        professionalId: 'prof-123',
        name: 'Emma Wilson',
        email: 'emma.w@example.com',
        phone: null,
        message: 'Do you offer services in Valencia? I am looking for an English-speaking lawyer.',
        status: 'archived',
        createdAt: '2024-03-01T16:30:00Z',
        updatedAt: '2024-03-02T10:00:00Z',
      },
    ];

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
