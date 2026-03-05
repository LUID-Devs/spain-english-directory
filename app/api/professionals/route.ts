import { NextRequest, NextResponse } from 'next/server';
import { Professional, Category, City } from '@/models';
import { Op } from 'sequelize';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limitRaw = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10);
    const limit = isNaN(limitRaw) || limitRaw < 1 ? DEFAULT_PAGE_SIZE : Math.min(limitRaw, 100);
    
    // Build where clause
    const where: any = {};
    
    // Include relations
    const include: any[] = [];
    
    if (city) {
      include.push({
        model: City,
        as: 'city',
        where: { slug: city },
        required: true,
      });
    } else {
      include.push({
        model: City,
        as: 'city',
      });
    }
    
    if (category) {
      include.push({
        model: Category,
        as: 'category',
        where: { slug: category },
        required: true,
      });
    } else {
      include.push({
        model: Category,
        as: 'category',
      });
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Fetch professionals
    const { count, rows: professionals } = await Professional.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['isFeatured', 'DESC'], ['name', 'ASC']],
    });
    
    // Calculate pagination
    const totalPages = Math.ceil(count / limit);
    
    return NextResponse.json({
      success: true,
      data: professionals,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch professionals',
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
