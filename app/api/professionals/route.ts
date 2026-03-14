import { NextRequest, NextResponse } from 'next/server';
import { DirectoryEntry } from '@/models';
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
    
    const where: any = {};

    if (city) {
      where.city = { [Op.iLike]: city };
    }

    if (category) {
      where.category = { [Op.iLike]: category };
    }
    
    if (search) {
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${escapedSearch}%` } },
        { description: { [Op.iLike]: `%${escapedSearch}%` } },
        { address: { [Op.iLike]: `%${escapedSearch}%` } },
      ];
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Fetch professionals
    const { count, rows: entries } = await DirectoryEntry.findAndCountAll({
      where,
      limit,
      offset,
      order: [['isFeatured', 'DESC'], ['name', 'ASC']],
      raw: true,
    });

    const professionals = entries.map((entry: any) => ({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      address: entry.address,
      phone: entry.phone,
      email: entry.email,
      website: entry.website,
      speaksEnglish: entry.speaksEnglish,
      englishLevel: entry.englishLevel,
      specialties: entry.specialties,
      isVerified: entry.isVerified,
      isFeatured: entry.isFeatured,
      city: {
        name: entry.city,
        province: entry.province,
      },
      category: {
        name: entry.category,
      },
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
    
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
