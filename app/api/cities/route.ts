import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/initDb';

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const [rows] = await sequelize.query<{
      name: string;
      province: string | null;
      count: number;
    }>(
      `SELECT city AS name, province, COUNT(*)::int AS count
       FROM directory_entries
       GROUP BY city, province
       ORDER BY city ASC`
    );

    const cities = rows.map((row, index) => ({
      id: index + 1,
      name: row.name,
      slug: slugify(row.name),
      province: row.province,
      count: row.count,
    }));
    
    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cities',
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
