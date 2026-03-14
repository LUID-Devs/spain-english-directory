import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry, Review } from '@/models';
import { getAuthSession } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const professionalId = Number.parseInt(id, 10);
    
    if (isNaN(professionalId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID format',
          message: 'ID must be a valid number',
        },
        { status: 400 }
      );
    }
    
    const professional = await DirectoryEntry.findByPk(professionalId, { raw: true });
    
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
    
    const reviews = await Review.findAll({
      where: { professionalId },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    const data = {
      ...professional,
      city: {
        name: professional.city,
        province: professional.province,
      },
      category: {
        name: professional.category,
      },
      reviews,
    };

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching professional:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch professional',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to update a profile',
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const professionalId = Number.parseInt(id, 10);

    if (Number.isNaN(professionalId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID format',
          message: 'ID must be a valid number',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
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

    if (session.entryId !== professionalId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You are not allowed to update this profile',
        },
        { status: 403 }
      );
    }

    await professional.update({
      name: body.name ?? professional.name,
      description: body.description ?? professional.description,
      specialties: Array.isArray(body.services) ? body.services : professional.specialties,
      phone: body.phone ?? professional.phone,
      website: body.website ?? professional.website,
      address: body.address ?? professional.address,
      city: body.city ?? professional.city,
      province: body.province ?? professional.province,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: professional,
    });
  } catch (error) {
    console.error('Error updating professional:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update professional',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
