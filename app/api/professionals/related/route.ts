import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid build-time database connection
    const { default: DirectoryEntry } = await import('@/models/DirectoryEntry');
    const { Op } = await import('sequelize');

    // Build where clause to exclude current professional and match category or city
    const whereClause: any = {
      slug: { [Op.ne]: slug },
    };

    if (category && city) {
      whereClause[Op.or] = [
        { category },
        { city }
      ];
    } else if (category) {
      whereClause.category = category;
    } else if (city) {
      whereClause.city = city;
    }

    const relatedProfessionals = await DirectoryEntry.findAll({
      where: whereClause,
      limit,
      order: [
        ['category', 'ASC'],
        ['city', 'ASC'],
        ['name', 'ASC']
      ],
    });

    // Sort manually to prioritize same category and city
    const sorted = relatedProfessionals.sort((a: any, b: any) => {
      const aScore = (a.category === category ? 2 : 0) + (a.city === city ? 1 : 0);
      const bScore = (b.category === category ? 2 : 0) + (b.city === city ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching related professionals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
