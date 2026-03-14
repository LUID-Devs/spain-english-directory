import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';
import { sequelize } from '@/models';

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
    const rows = await sequelize.query<{
      name: string;
      count: number;
    }>(
      `SELECT category AS name, COUNT(*)::int AS count
       FROM directory_entries
       GROUP BY category
       ORDER BY category ASC`,
      { type: QueryTypes.SELECT }
    );

    const categories = rows.map((row, index) => ({
      id: index + 1,
      name: row.name,
      slug: slugify(row.name),
      count: row.count,
    }));
    
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
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
