import { NextRequest, NextResponse } from 'next/server';
import { getCityCategoryListings } from '@/lib/server/cityCategoryListings';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const citySlug = searchParams.get('citySlug') || '';
    const categorySlug = searchParams.get('categorySlug') || '';
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const specialty = searchParams.get('specialty');
    const language = searchParams.get('language');

    if (!citySlug || !categorySlug) {
      return NextResponse.json(
        { success: false, error: 'citySlug and categorySlug are required.' },
        { status: 400 }
      );
    }

    const data = await getCityCategoryListings({
      citySlug,
      categorySlug,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
      specialty,
      language,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to load city/category listings:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load listings.' },
      { status: 500 }
    );
  }
}
