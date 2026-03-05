import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Dynamic import to avoid build-time database connection
    const { default: DirectoryEntry } = await import('@/models/DirectoryEntry');

    const professional = await DirectoryEntry.findOne({
      where: { slug },
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch (error) {
    console.error('Error fetching professional:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
