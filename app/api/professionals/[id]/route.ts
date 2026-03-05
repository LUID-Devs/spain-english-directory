import { NextRequest, NextResponse } from 'next/server';
import { Professional, Category, City, Review } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const professionalId = parseInt(id, 10);
    
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
    
    const professional = await Professional.findByPk(professionalId, {
      include: [
        { model: Category, as: 'category' },
        { model: City, as: 'city' },
        { model: Review, as: 'reviews' },
      ],
    });
    
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
    
    return NextResponse.json({
      success: true,
      data: professional,
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
