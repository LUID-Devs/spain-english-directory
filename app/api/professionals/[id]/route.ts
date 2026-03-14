import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry, Review } from '@/models';

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

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
