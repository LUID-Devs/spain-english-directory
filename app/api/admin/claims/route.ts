import { NextRequest, NextResponse } from 'next/server';
import { Claim, DirectoryEntry } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows: claims } = await Claim.findAndCountAll({
      where: whereClause,
      include: [{
        model: DirectoryEntry,
        as: 'directoryEntry',
        attributes: ['id', 'name', 'category', 'city', 'email', 'phone', 'isClaimed'],
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching admin claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
